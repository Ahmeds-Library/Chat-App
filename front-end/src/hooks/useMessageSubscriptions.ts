
import { useCallback, useRef } from 'react';
import { Message, User } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import ToastRegistry from '@/services/toastRegistry';

interface UseMessageSubscriptionsProps {
  selectedUser: User | null;
  getCurrentUser: () => string | null;
  onNewMessage: (message: Message) => void;
}

export const useMessageSubscriptions = ({
  selectedUser,
  getCurrentUser,
  onNewMessage
}: UseMessageSubscriptionsProps) => {
  const toastRegistry = ToastRegistry.getInstance();
  const mountedRef = useRef(true);

  const handleNewWebSocketMessage = useCallback((newMessage: Message) => {
    console.log('🔍 useMessageSubscriptions: New WebSocket message received:', {
      id: newMessage.id,
      sender: newMessage.sender,
      receiver: newMessage.receiver,
      content: newMessage.content.substring(0, 30) + '...',
      selectedUser: selectedUser?.number,
      currentUser: getCurrentUser()
    });

    if (!mountedRef.current || !selectedUser) {
      console.log('⚠️ useMessageSubscriptions: Component not mounted or no selected user');
      return;
    }

    const currentUserId = getCurrentUser();
    if (!currentUserId) {
      console.warn('⚠️ useMessageSubscriptions: No current user ID, ignoring message');
      return;
    }

    const selectedUserIdentifier = selectedUser.id || selectedUser.number;
    
    const isIncomingMessage = 
      (newMessage.sender === selectedUserIdentifier && newMessage.receiver === currentUserId) ||
      (newMessage.sender === selectedUser.number && newMessage.receiver === currentUserId);
    
    const isOutgoingMessage = 
      (newMessage.sender === currentUserId && newMessage.receiver === selectedUserIdentifier) ||
      (newMessage.sender === currentUserId && newMessage.receiver === selectedUser.number);

    const isRelevantMessage = isIncomingMessage || isOutgoingMessage;

    if (!isRelevantMessage) {
      console.log('🚫 Message not relevant to current conversation, skipping');
      return;
    }

    console.log('✅ Message is relevant, adding to conversation');
    onNewMessage(newMessage);

    if (isIncomingMessage) {
      const toastId = toastRegistry.generateToastId(
        newMessage.sender, 
        newMessage.content, 
        newMessage.timestamp
      );
      
      if (toastRegistry.shouldShowToast(toastId)) {
        const senderDisplayName = selectedUser.username || selectedUser.number || 'Unknown';
        const messagePreview = newMessage.content.length > 40 
          ? newMessage.content.substring(0, 40) + '...' 
          : newMessage.content;

        toast({
          title: `💬 ${senderDisplayName}`,
          description: messagePreview,
          duration: 3000,
          variant: "default",
        });

        toastRegistry.markToastShown(toastId);
        console.log('✅ WebSocket message toast shown for incoming message');
      }
    } else if (isOutgoingMessage) {
      toast({
        title: "Message Delivered",
        description: "Your message was delivered successfully",
        duration: 2000,
        variant: "success",
      });
      console.log('✅ WebSocket delivery confirmation toast shown');
    }
  }, [selectedUser, getCurrentUser, onNewMessage, toastRegistry]);

  const { 
    connectionStatus, 
    connectionInfo,
    messageCount, 
    forceReconnect,
    pendingMessageCount,
    clearPendingMessages,
    connectionError
  } = useWebSocket({
    onNewMessage: handleNewWebSocketMessage,
    autoConnect: true
  });

  return {
    connectionStatus,
    connectionInfo,
    messageCount,
    forceReconnect,
    pendingMessageCount,
    clearPendingMessages,
    connectionError,
    mountedRef
  };
};
