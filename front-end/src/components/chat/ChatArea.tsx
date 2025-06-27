import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, MoreVertical, Edit2, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import ApiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { gsap } from 'gsap';

interface ChatAreaProps {
  selectedUser: User | null;
  currentUserNumber: string;
  onMessageSent?: (userNumber: string, message: Message) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  selectedUser, 
  currentUserNumber, 
  onMessageSent 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const apiService = ApiService.getInstance();

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      setError(null);
      setRetryCount(0);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Animate empty state
    if (!selectedUser && emptyStateRef.current) {
      gsap.fromTo(emptyStateRef.current.children,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, [selectedUser]);

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedUser]);

  const loadMessages = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📨 Loading messages for conversation with:', selectedUser.number);
      
      // Load messages directly from backend using the correct endpoint structure
      const messages = await apiService.getMessages(selectedUser.number);
      
      // Sort messages by timestamp
      messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      setMessages(messages);
      console.log('✅ Messages loaded:', messages.length);
      
    } catch (error: any) {
      console.error('❌ Failed to load messages:', error);
      
      // Handle common error cases gracefully
      if (error.status === 500 && error.details?.includes('no messages found')) {
        console.log('ℹ️ No messages found for this conversation');
        setMessages([]);
      } else if (error.status === 401) {
        setError('Authentication expired. Please login again.');
        // Keep auth-related toasts as they are HTTP-based operations
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        });
      } else if (error.status >= 500) {
        setError('Server error.');
      } else {
        console.warn('API Error loading messages:', error);
        setError('Failed to load messages.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryLoadMessages = async () => {
    if (retryCount >= 3) {
      // Keep connection-related toasts for retry failures
      toast({
        title: "Max retries reached",
        description: "Please check your connection and try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setRetryCount(prev => prev + 1);
    await loadMessages();
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const validateMessage = (content: string): string | null => {
    if (!content.trim()) {
      return 'Message cannot be empty';
    }
    if (content.trim().length > 1000) {
      return 'Message is too long (max 1000 characters)';
    }
    return null;
  };

  const handleSendMessage = async () => {
    const messageContent = newMessage.trim();
    const validationError = validateMessage(messageContent);
    
    if (validationError) {
      // Keep validation toasts as they are UI feedback, not messaging operations
      toast({
        title: "Invalid Message",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!selectedUser) return;

    setIsSending(true);
    const tempId = Date.now().toString();
    
    // Optimistically add message to UI
    const optimisticMessage: Message = {
      id: tempId,
      sender: currentUserNumber,
      receiver: selectedUser.number,
      content: messageContent,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    scrollToBottom();

    try {
      // Send via WebSocket - no HTTP toasts, let WebSocket events handle all messaging feedback
      const sentMessage = await apiService.sendMessage(selectedUser.number, messageContent);
      
      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? sentMessage : msg
        )
      );
      
      // Notify parent component for user list update
      if (onMessageSent) {
        onMessageSent(selectedUser.number, sentMessage);
      }
      
      console.log('✅ Message sent successfully - WebSocket will handle delivery notifications');
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Restore message in input
      setNewMessage(messageContent);
      
      // Only show auth-related toasts, not general messaging failures
      if (error.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Authentication expired. Please login again.",
          variant: "destructive",
        });
      }
      // All other messaging errors are handled by WebSocket events, no HTTP toasts
      console.log('❌ Message send failed - WebSocket event handlers will manage user feedback');
    } finally {
      setIsSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!selectedUser) return;
    
    const validationError = validateMessage(newContent);
    if (validationError) {
      // Keep validation toasts as they are UI feedback
      toast({
        title: "Invalid Message",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updatedMessage = await apiService.updateMessage({
        messageId,
        content: newContent
      });

      // Update UI
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, ...updatedMessage } : msg
        )
      );

      setEditingMessageId(null);
      setEditingContent('');

      // Keep edit success toast as it's immediate UI feedback
      toast({
        title: "Message Updated",
        description: "Your message has been updated successfully",
      });
    } catch (error: any) {
      console.error('❌ Failed to update message:', error);
      
      // Only show auth-related toasts for edit failures
      if (error.status === 401) {
        toast({
          title: "Authentication Error", 
          description: "Authentication expired. Please login again.",
          variant: "destructive",
        });
      }
      // Other edit failures can be shown as they are immediate operations
      else {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update message",
          variant: "destructive",
        });
      }
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 via-background to-muted/30">
        <div ref={emptyStateRef} className="text-center max-w-md px-8">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-muted">
            <MessageSquare className="w-16 h-16 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Select a Conversation
          </h3>
          <p className="text-muted-foreground text-lg mb-4">
            Choose a contact from the sidebar to start chatting, or create a new conversation.
          </p>
          <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Click the "+" button to add new contacts</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Search existing conversations</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Start real-time messaging</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 hover:scale-110 transition-transform duration-200">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {selectedUser?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-foreground">{selectedUser?.username}</h3>
            <p className="text-sm text-muted-foreground">{selectedUser?.number}</p>
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{error}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {error && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryLoadMessages}
              disabled={isLoading}
              className="hover:scale-105 transition-transform duration-200"
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
              Retry
            </Button>
          )}
          <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform duration-200">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner size="lg" text="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-2">Start the conversation with {selectedUser?.username}!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender === currentUserNumber;
              const isEditing = editingMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-fade-in",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2 relative group hover:shadow-lg transition-all duration-200",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="bg-background text-foreground"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditMessage(message.id, editingContent);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          maxLength={1000}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditMessage(message.id, editingContent)}
                            className="hover:scale-105 transition-transform duration-200"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="hover:scale-105 transition-transform duration-200"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.edited && (
                            <span className="text-xs opacity-70 ml-2">edited</span>
                          )}
                        </div>
                        {isOwnMessage && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                            onClick={() => startEditing(message)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex space-x-2">
          <Input
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 hover:ring-2 hover:ring-primary/20 transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
            maxLength={1000}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
            className="hover:scale-110 transition-all duration-200 disabled:hover:scale-100"
          >
            {isSending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {newMessage.length}/1000 characters
        </div>
      </div>
    </div>
  );
};
