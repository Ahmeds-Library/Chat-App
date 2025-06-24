
import { useState, useEffect, useCallback } from 'react';
import { Message, User } from '@/types/chat';
import ApiService from '@/services/apiService';
import ApiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';

interface UseMessagesProps {
  selectedUser: User | null;
  currentUserNumber: string;
  initialMessage?: Message | null;
  onMessageSent: (userNumber: string, message: Message) => void;
}

export const useMessages = ({
  selectedUser,
  currentUserNumber,
  initialMessage,
  onMessageSent
}: UseMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const apiService = ApiService.getInstance();
  const apiClient = ApiClient.getInstance();

  // Enhanced current user detection - prioritize JWT user ID
  const getCurrentUser = useCallback(() => {
    // First priority: get user ID from JWT token (matches backend format)
    const userIdFromToken = apiClient.getCurrentUserNumber();
    if (userIdFromToken) {
      console.log('📱 useMessages: Using user ID from JWT token:', userIdFromToken);
      return userIdFromToken;
    }
    
    // Fallback: use provided currentUserNumber (might be phone number)
    if (currentUserNumber) {
      console.log('📱 useMessages: Using provided current user number as fallback:', currentUserNumber);
      return currentUserNumber;
    }
    
    console.warn('⚠️ useMessages: Could not determine current user');
    return null;
  }, [currentUserNumber, apiClient]);

  // Enhanced WebSocket message handler with correct user ID matching
  const handleNewWebSocketMessage = useCallback((newMessage: Message) => {
    console.log('📨 useMessages: Processing WebSocket message:', {
      messageId: newMessage.id,
      sender: newMessage.sender,
      receiver: newMessage.receiver,
      content: newMessage.content.substring(0, 30) + '...',
      selectedUser: selectedUser?.number,
      selectedUserId: selectedUser?.id,
      currentUser: getCurrentUser(),
      timestamp: newMessage.timestamp
    });

    if (!selectedUser) {
      console.log('📨 useMessages: No selected user, message will be ignored');
      return;
    }
    
    const currentUserId = getCurrentUser();
    if (!currentUserId) {
      console.warn('⚠️ useMessages: No current user ID, ignoring message');
      return;
    }

    // Check if message is relevant to current conversation
    // Need to check both user ID and phone number for compatibility
    const selectedUserIdentifier = selectedUser.id || selectedUser.number;
    const isRelevantMessage = 
      (newMessage.sender === selectedUserIdentifier && newMessage.receiver === currentUserId) ||
      (newMessage.sender === currentUserId && newMessage.receiver === selectedUserIdentifier) ||
      // Additional checks for phone number compatibility
      (newMessage.sender === selectedUser.number && newMessage.receiver === currentUserId) ||
      (newMessage.sender === currentUserId && newMessage.receiver === selectedUser.number);
    
    console.log('📨 useMessages: Message relevance check:', {
      isRelevant: isRelevantMessage,
      messageSender: newMessage.sender,
      messageReceiver: newMessage.receiver,
      selectedUserIdentifier: selectedUserIdentifier,
      selectedUserNumber: selectedUser.number,
      currentUserId: currentUserId
    });

    if (isRelevantMessage) {
      console.log('📨 useMessages: Adding relevant message to conversation');
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.find(msg => 
          msg.id === newMessage.id || 
          (msg.content === newMessage.content && 
           msg.sender === newMessage.sender && 
           Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000)
        );
        
        if (exists) {
          console.log('📨 useMessages: Message already exists, skipping duplicate');
          return prev;
        }
        
        // Add message and sort by timestamp
        const newMessages = [...prev, newMessage].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        console.log('📨 useMessages: Message added, total messages:', newMessages.length);
        
        // Show toast for received messages (not sent by current user)
        if (newMessage.sender !== currentUserId) {
          console.log('📨 useMessages: Showing toast for received message');
          toast({
            title: `New message from ${selectedUser.username}`,
            description: newMessage.content.length > 50 
              ? newMessage.content.substring(0, 50) + '...' 
              : newMessage.content,
          });
        }
        
        return newMessages;
      });
    } else {
      console.log('📨 useMessages: Message not relevant to current conversation, ignoring');
    }
  }, [selectedUser, getCurrentUser, toast]);

  const { connectionStatus, sendTestMessage, messageCount } = useWebSocket({
    onNewMessage: handleNewWebSocketMessage,
    autoConnect: true
  });

  // Load messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      console.log('🔄 useMessages: Loading messages for selected user:', selectedUser.number);
      loadMessages();
    } else {
      console.log('🔄 useMessages: No selected user, clearing messages');
      setMessages([]);
    }
  }, [selectedUser]);

  // Handle initial message from new chat
  useEffect(() => {
    if (initialMessage && selectedUser) {
      console.log('📨 useMessages: Adding initial message from new chat:', initialMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === initialMessage.id);
        if (!exists) {
          const newMessages = [...prev, initialMessage].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          return newMessages;
        }
        return prev;
      });
    }
  }, [initialMessage, selectedUser]);

  const loadMessages = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      console.log('📨 useMessages: Loading messages for conversation with:', selectedUser.number);
      
      const messages = await apiService.getMessages(selectedUser.number);
      
      // Sort messages by timestamp
      messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      console.log('✅ useMessages: Messages loaded and sorted:', messages.length);
      setMessages(messages);
      
    } catch (error: any) {
      console.error('❌ useMessages: Failed to load messages:', error);
      
      if (error.status === 404 || error.status === 500 || error.status === 400) {
        console.log('ℹ️ useMessages: No messages found for this conversation');
        setMessages([]);
      } else {
        toast({
          title: "Failed to Load Messages",
          description: "Could not load conversation history. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || !selectedUser || isSending) return;

    const currentUserId = getCurrentUser();
    if (!currentUserId) {
      toast({
        title: "Authentication Error",
        description: "Could not identify current user. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Create optimistic message for immediate UI feedback
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: currentUserId,
      receiver: selectedUser.id || selectedUser.number,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    console.log('📤 useMessages: Adding optimistic message:', optimisticMessage);
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log('📤 useMessages: Sending message via REST API to:', selectedUser.number);
      
      // Send message via REST API (existing endpoint)
      const sentMessage = await apiService.sendMessage(selectedUser.number, messageContent);

      console.log('✅ useMessages: Message sent via REST API, updating optimistic message:', sentMessage);
      
      // Update optimistic message with real message data
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      // Notify parent for chat list update
      onMessageSent(selectedUser.number, sentMessage);
      
      console.log('✅ useMessages: Message sent successfully - WebSocket should deliver to receiver');

    } catch (error: any) {
      console.error('❌ useMessages: Failed to send message:', error);
      
      // Mark optimistic message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? { ...msg, status: 'failed' as const } : msg
        )
      );

      toast({
        title: "Failed to Send Message",
        description: error.message || "Could not send your message. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsSending(false);
    }
  }, [selectedUser, getCurrentUser, onMessageSent, isSending, apiService]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    try {
      await apiService.updateMessage({
        messageId,
        content: newText.trim(),
      });

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? {
            ...msg,
            content: newText.trim(),
            edited: true,
            editedAt: new Date().toISOString()
          } : msg
        )
      );

    } catch (error: any) {
      console.error('❌ useMessages: Failed to edit message:', error);
      toast({
        title: "Failed to Edit Message",
        description: error.message || "Could not edit your message",
        variant: "destructive",
      });
    }
  }, [apiService]);

  // Debug function to test WebSocket
  const testWebSocket = useCallback(() => {
    console.log('🧪 useMessages: Testing WebSocket connection');
    const testContent = `Test message from ${getCurrentUser()} at ${new Date().toLocaleTimeString()}`;
    console.log('🧪 useMessages: Sending test content:', testContent);
    sendTestMessage(testContent);
  }, [sendTestMessage, getCurrentUser]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    loadMessages,
    connectionStatus,
    testWebSocket,
    messageCount
  };
};
