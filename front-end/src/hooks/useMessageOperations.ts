
import { useCallback } from 'react';
import { Message, User } from '@/types/chat';
import ApiService from '@/services/apiService';
import ApiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

interface UseMessageOperationsProps {
  selectedUser: User | null;
  currentUserNumber: string;
  onMessageSent: (userNumber: string, message: Message) => void;
}

export const useMessageOperations = ({
  selectedUser,
  currentUserNumber,
  onMessageSent
}: UseMessageOperationsProps) => {
  const apiService = ApiService.getInstance();
  const apiClient = ApiClient.getInstance();

  const getCurrentUser = useCallback(() => {
    const userIdFromToken = apiClient.getCurrentUserNumber();
    if (userIdFromToken) {
      console.log('🔍 Current user from token:', userIdFromToken);
      return userIdFromToken;
    }
    console.log('🔍 Current user from prop:', currentUserNumber);
    return currentUserNumber || null;
  }, [currentUserNumber, apiClient]);

  const sendMessage = useCallback(async (messageContent: string): Promise<Message> => {
    if (!messageContent.trim() || !selectedUser) {
      throw new Error('Invalid message or no selected user');
    }

    const currentUserId = getCurrentUser();
    if (!currentUserId) {
      toast({
        title: "Authentication Error",
        description: "Could not identify current user. Please try logging in again.",
        variant: "destructive",
        duration: 2000,
      });
      throw new Error('No current user');
    }

    console.log('📤 useMessageOperations: Sending message via WebSocket to:', selectedUser.number);
    
    const sentMessage = await apiService.sendMessage(selectedUser.number, messageContent);
    onMessageSent(selectedUser.number, sentMessage);
    
    toast({
      title: "📤 Message Sent",
      description: "Message sent via WebSocket",
      duration: 1500,
      variant: "success",
    });
    
    console.log('✅ useMessageOperations: Message sent successfully - WebSocket event-driven feedback');
    return sentMessage;
  }, [selectedUser, getCurrentUser, onMessageSent, apiService]);

  const editMessage = useCallback(async (messageId: string, newText: string): Promise<Message> => {
    if (!newText.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      const updatedMessage = await apiService.updateMessage({
        messageId,
        content: newText.trim(),
      });

      toast({
        title: "Message Edited",
        description: "Your message was updated successfully",
        duration: 2000,
        variant: "success",
      });

      return updatedMessage;
    } catch (error: any) {
      console.error('❌ useMessageOperations: Failed to edit message:', error);
      
      if (error.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please login to edit messages",
          variant: "destructive",
          duration: 2000,
        });
      } else {
        toast({
          title: "Edit Failed",
          description: error.message || "Could not edit your message",
          variant: "destructive",
          duration: 2000,
        });
      }
      throw error;
    }
  }, [apiService]);

  return {
    sendMessage,
    editMessage,
    getCurrentUser
  };
};
