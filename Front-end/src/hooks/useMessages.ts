
import { useState, useEffect, useCallback } from 'react';
import { Message, User } from '@/types/chat';
import ApiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

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
          return [...prev, initialMessage];
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
      console.log('📨 useMessages: Message details for debugging:', messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver,
        content: msg.content.substring(0, 20) + '...',
        isOwnMessage: msg.sender === currentUserNumber
      })));
      
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

    setIsSending(true);

    // Create optimistic message with proper sender info
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: currentUserNumber,
      receiver: selectedUser.number,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    console.log('📤 useMessages: Adding optimistic message:', optimisticMessage);
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log('📤 useMessages: Sending message to:', selectedUser.number);
      const sentMessage = await apiService.sendMessage(selectedUser.number, messageContent);

      console.log('✅ useMessages: Message sent, updating optimistic message:', sentMessage);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      onMessageSent(selectedUser.number, sentMessage);
      console.log('✅ useMessages: Message sent successfully and notified parent:', sentMessage);

    } catch (error: any) {
      console.error('❌ useMessages: Failed to send message:', error);
      
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
  }, [selectedUser, currentUserNumber, onMessageSent, isSending, apiService]);

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

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    loadMessages
  };
};
