
import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, User } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import ToastRegistry from '@/services/toastRegistry';
import { useMessageOperations } from './useMessageOperations';
import { useMessageLoading } from './useMessageLoading';
import { useMessageSubscriptions } from './useMessageSubscriptions';

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
  const [isSending, setIsSending] = useState(false);
  const toastRegistry = ToastRegistry.getInstance();
  const currentConversationRef = useRef<string | null>(null);

  const {
    messages,
    isLoading,
    loadMessages,
    addMessage,
    updateMessage,
    setMessages
  } = useMessageLoading();

  const {
    sendMessage: sendMessageOperation,
    editMessage: editMessageOperation,
    getCurrentUser
  } = useMessageOperations({
    selectedUser,
    currentUserNumber,
    onMessageSent
  });

  const {
    connectionStatus,
    connectionInfo,
    messageCount,
    forceReconnect,
    pendingMessageCount,
    clearPendingMessages,
    connectionError
  } = useMessageSubscriptions({
    selectedUser,
    getCurrentUser,
    onNewMessage: addMessage
  });

  // Load messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      console.log('🔄 useMessages: Loading messages for selected user:', selectedUser.number);
      currentConversationRef.current = selectedUser.id || selectedUser.number;
      
      toastRegistry.clearForConversation(currentConversationRef.current);
      loadMessages(selectedUser);
    } else {
      console.log('🔄 useMessages: No selected user, clearing messages');
      setMessages([]);
      currentConversationRef.current = null;
    }
  }, [selectedUser, loadMessages, setMessages, toastRegistry]);

  // Handle initial message from new chat
  useEffect(() => {
    if (initialMessage && selectedUser) {
      console.log('📨 useMessages: Adding initial message from new chat:', initialMessage);
      addMessage(initialMessage);
    }
  }, [initialMessage, selectedUser, addMessage]);

  // WebSocket connection status toast notifications
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast({
        title: "🔌 Connected",
        description: "Real-time messaging is active",
        duration: 2000,
        variant: "success",
      });
    } else if (connectionStatus === 'disconnected' && connectionError) {
      toast({
        title: "⚠️ Connection Lost",
        description: "Trying to reconnect...",
        duration: 3000,
        variant: "warning",
      });
    }
  }, [connectionStatus, connectionError]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || !selectedUser || isSending) return;

    const currentUserId = getCurrentUser();
    if (!currentUserId) {
      toast({
        title: "Authentication Error",
        description: "Could not identify current user. Please try logging in again.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsSending(true);

    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: currentUserId,
      receiver: selectedUser.id || selectedUser.number,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    console.log('📤 useMessages: Adding optimistic message:', optimisticMessage);
    addMessage(optimisticMessage);

    try {
      const sentMessage = await sendMessageOperation(messageContent);
      
      updateMessage(optimisticMessage.id, { ...sentMessage, status: 'sent' });
      console.log('✅ useMessages: Message sent successfully - WebSocket event-driven feedback');

    } catch (error: any) {
      console.error('❌ useMessages: Failed to send message:', error);
      
      updateMessage(optimisticMessage.id, { status: 'failed' as const });

      let errorMessage = "Message failed to send";
      if (connectionStatus === 'disconnected') {
        errorMessage = "WebSocket disconnected. Message queued for retry.";
      } else if (pendingMessageCount > 0) {
        errorMessage = `${pendingMessageCount} messages pending. Check connection.`;
      } else {
        errorMessage = "WebSocket send failed. Please check connection.";
      }

      toast({
        title: "❌ WebSocket Send Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });

      throw error;
    } finally {
      setIsSending(false);
    }
  }, [selectedUser, getCurrentUser, isSending, addMessage, updateMessage, sendMessageOperation, connectionStatus, pendingMessageCount]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    try {
      const updatedMessage = await editMessageOperation(messageId, newText);
      
      updateMessage(messageId, {
        content: newText.trim(),
        edited: true,
        editedAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ useMessages: Failed to edit message:', error);
    }
  }, [editMessageOperation, updateMessage]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    loadMessages: () => loadMessages(selectedUser),
    connectionStatus,
    connectionInfo,
    messageCount,
    forceReconnect,
    pendingMessageCount,
    clearPendingMessages,
    connectionError
  };
};
