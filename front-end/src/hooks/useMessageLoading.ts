
import { useState, useCallback } from 'react';
import { Message, User } from '@/types/chat';
import ApiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

export const useMessageLoading = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiService = ApiService.getInstance();

  const loadMessages = useCallback(async (selectedUser: User | null) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      console.log('📨 useMessageLoading: Loading messages for conversation with:', selectedUser.number);
      
      const messages = await apiService.getMessages(selectedUser.number);
      
      messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      console.log('✅ useMessageLoading: Messages loaded and sorted:', messages.length);
      setMessages(messages);
      
    } catch (error: any) {
      console.error('❌ useMessageLoading: Failed to load messages:', error);
      
      if (error.status === 404 || error.status === 500 || error.status === 400) {
        console.log('ℹ️ useMessageLoading: No messages found for this conversation');
        setMessages([]);
      } else if (error.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to load messages",
          variant: "destructive",
          duration: 2000,
        });
      } else {
        toast({
          title: "Failed to Load Messages",
          description: "Could not load conversation history. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const exists = prev.find(msg => 
        msg.id === message.id || 
        (msg.content === message.content && 
         msg.sender === message.sender && 
         Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 2000)
      );
      
      if (exists) {
        console.log('🔄 Message already exists, skipping duplicate');
        return prev;
      }
      
      const newMessages = [...prev, message].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      console.log('📝 Added new message. Total messages:', newMessages.length);
      return newMessages;
    });
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    isLoading,
    loadMessages,
    addMessage,
    updateMessage,
    removeMessage,
    setMessages
  };
};
