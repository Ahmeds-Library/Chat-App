
import { useState, useEffect, useCallback } from 'react';
import { User, Message } from '@/types/chat';
import ApiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import ApiClient from '@/services/apiClient';

interface UseChatListProps {
  currentUserNumber?: string;
}

export const useChatList = ({ currentUserNumber }: UseChatListProps = {}) => {
  const [chatList, setChatList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiService = ApiService.getInstance();
  const apiClient = ApiClient.getInstance();

  // Enhanced current user detection - now uses actual user ID from JWT
  const getCurrentUserNumber = useCallback(() => {
    // First priority: use provided currentUserNumber prop (if it's a user ID)
    if (currentUserNumber) {
      console.log('📱 useChatList: Using provided current user number:', currentUserNumber);
      return currentUserNumber;
    }
    
    // Second priority: get user ID from JWT token (this matches backend format)
    const userIdFromToken = apiClient.getCurrentUserNumber();
    if (userIdFromToken) {
      console.log('📱 useChatList: Using user ID from JWT token:', userIdFromToken);
      return userIdFromToken;
    }
    
    console.warn('⚠️ useChatList: Could not determine current user ID');
    return null;
  }, [currentUserNumber, apiClient]);

  // Handle incoming WebSocket messages to update chat list
  const handleIncomingMessage = useCallback((message: Message) => {
    const currentUserId = getCurrentUserNumber();
    if (!currentUserId) {
      console.warn('⚠️ useChatList: No current user ID, ignoring message');
      return;
    }

    console.log('📨 useChatList: Processing incoming message for chat list update:', {
      messageId: message.id,
      sender: message.sender,
      receiver: message.receiver,
      currentUserId: currentUserId,
      content: message.content.substring(0, 30) + '...'
    });

    // Determine the other user in the conversation
    let otherUserId: string;
    if (message.sender === currentUserId) {
      // Message sent by current user
      otherUserId = message.receiver;
    } else if (message.receiver === currentUserId) {
      // Message received by current user
      otherUserId = message.sender;
    } else {
      // Message not relevant to current user
      console.log('📨 useChatList: Message not relevant to current user, ignoring');
      return;
    }

    console.log('📨 useChatList: Updating chat list for user ID:', otherUserId);

    // Update chat list
    setChatList(prev => {
      const existingIndex = prev.findIndex(u => u.id === otherUserId || u.number === otherUserId);
      
      if (existingIndex >= 0) {
        // Update existing chat item
        const updatedUsers = [...prev];
        updatedUsers[existingIndex] = {
          ...updatedUsers[existingIndex],
          lastMessage: message.content,
          lastMessageTime: message.timestamp
        };
        // Move to top
        const [updatedUser] = updatedUsers.splice(existingIndex, 1);
        console.log('📨 useChatList: Updated existing chat item and moved to top');
        return [updatedUser, ...updatedUsers];
      } else {
        // Create new chat item for unknown user
        const newUser: User = {
          id: otherUserId,
          username: otherUserId, // Will be updated when user details are fetched
          number: otherUserId,
          lastMessage: message.content,
          lastMessageTime: message.timestamp
        };
        console.log('📨 useChatList: Created new chat item for unknown user');
        return [newUser, ...prev];
      }
    });

    // Show toast notification for received messages (not sent by current user)
    if (message.sender !== currentUserId) {
      toast({
        title: `New message from ${message.sender}`,
        description: message.content.length > 50 
          ? message.content.substring(0, 50) + '...' 
          : message.content,
      });
    }
  }, [getCurrentUserNumber, toast]);

  // Initialize WebSocket connection for real-time updates
  const { connectionStatus } = useWebSocket({
    onNewMessage: handleIncomingMessage,
    autoConnect: true
  });

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

  const updateChatItem = (userIdentifier: string, lastMessage: string, timestamp: string) => {
    setChatList(prev => {
      const existingIndex = prev.findIndex(u => u.number === userIdentifier || u.id === userIdentifier);
      
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
      const existingIndex = prev.findIndex(u => u.number === user.number || u.id === user.id);
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

  console.log('🔌 useChatList: WebSocket connection status:', connectionStatus);

  return {
    chatList,
    isLoading,
    error,
    loadChatList,
    updateChatItem,
    addNewChatItem,
    connectionStatus
  };
};
