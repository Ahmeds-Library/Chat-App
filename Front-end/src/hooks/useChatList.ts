
import { useState, useEffect } from 'react';
import { User } from '@/types/chat';
import ApiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

export const useChatList = () => {
  const [chatList, setChatList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiService = ApiService.getInstance();

  const loadChatList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading chat list...');
      
      const users = await apiService.getChatList();
      setChatList(users);
      
      console.log('✅ Chat list loaded successfully:', users.length, 'conversations');
    } catch (error: any) {
      console.error('❌ Failed to load chat list:', error);
      setError(error.message || 'Failed to load conversations');
      
      toast({
        title: "Failed to Load Conversations",
        description: "Could not load your chat list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatItem = (userNumber: string, lastMessage: string, timestamp: string) => {
    setChatList(prev => {
      const existingIndex = prev.findIndex(u => u.number === userNumber);
      
      if (existingIndex >= 0) {
        const updatedUsers = [...prev];
        updatedUsers[existingIndex] = {
          ...updatedUsers[existingIndex],
          lastMessage,
          lastMessageTime: timestamp
        };
        // Move to top
        const [updatedUser] = updatedUsers.splice(existingIndex, 1);
        return [updatedUser, ...updatedUsers];
      }
      
      return prev;
    });
  };

  const addNewChatItem = (user: User) => {
    setChatList(prev => {
      const existingIndex = prev.findIndex(u => u.number === user.number);
      if (existingIndex >= 0) {
        const updatedUsers = [...prev];
        updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...user };
        const [updatedUser] = updatedUsers.splice(existingIndex, 1);
        return [updatedUser, ...updatedUsers];
      } else {
        return [user, ...prev];
      }
    });
  };

  useEffect(() => {
    loadChatList();
  }, []);

  return {
    chatList,
    isLoading,
    error,
    loadChatList,
    updateChatItem,
    addNewChatItem
  };
};
