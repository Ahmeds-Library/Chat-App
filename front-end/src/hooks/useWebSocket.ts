
import { useEffect, useCallback, useState } from 'react';
import WebSocketService, { ConnectionStatusInfo } from '@/services/websocket/WebSocketService';
import { Message } from '@/types/chat';

interface UseWebSocketProps {
  onNewMessage?: (message: Message) => void;
  onMessageSent?: (message: Message) => void;
  autoConnect?: boolean;
}

export const useWebSocket = ({ 
  onNewMessage,
  onMessageSent,
  autoConnect = true 
}: UseWebSocketProps = {}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusInfo>({ status: 'disconnected' });
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [pendingMessageCount, setPendingMessageCount] = useState(0);
  
  const wsService = WebSocketService.getInstance();

  const connect = useCallback(() => {
    console.log('🔌 useWebSocket: Attempting to connect...');
    wsService.connect();
  }, [wsService]);

  const disconnect = useCallback(() => {
    console.log('🔌 useWebSocket: Disconnecting...');
    wsService.disconnect();
  }, [wsService]);

  const forceReconnect = useCallback(() => {
    console.log('🔌 useWebSocket: Force reconnecting...');
    wsService.forceReconnect();
  }, [wsService]);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    console.log('📤 useWebSocket: Sending message via WebSocket:', { receiverId, content });
    return wsService.sendMessage(receiverId, content);
  }, [wsService]);

  const clearPendingMessages = useCallback(() => {
    wsService.clearPendingMessages();
    setPendingMessageCount(0);
  }, [wsService]);

  useEffect(() => {
    console.log('🔌 useWebSocket: Setting up WebSocket subscriptions');
    
    // Subscribe to connection status changes with enhanced info
    const unsubscribeStatus = wsService.onConnectionStatus((status) => {
      console.log('🔌 useWebSocket: Connection status changed to:', status);
      setConnectionStatus(status);
      setPendingMessageCount(wsService.getPendingMessageCount());
    });

    // Subscribe to new messages
    const unsubscribeMessages = onNewMessage ? wsService.onMessage((message) => {
      console.log('📨 useWebSocket: Received message:', {
        id: message.id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content.substring(0, 50) + '...'
      });
      
      setLastMessage(message);
      setMessageCount(prev => prev + 1);
      onNewMessage(message);
    }) : () => {};

    // Subscribe to message sent confirmations
    const unsubscribeMessageSent = onMessageSent ? wsService.onMessageSent((message) => {
      console.log('📤 useWebSocket: Message sent confirmation:', message.id);
      onMessageSent(message);
    }) : () => {};

    // Auto-connect if enabled
    if (autoConnect) {
      console.log('🔌 useWebSocket: Auto-connecting enabled');
      connect();
    }

    // Set initial connection status
    const initialStatus = wsService.getConnectionStatus();
    console.log('🔌 useWebSocket: Initial connection status:', initialStatus);
    setConnectionStatus(initialStatus);
    setPendingMessageCount(wsService.getPendingMessageCount());

    // Cleanup on unmount
    return () => {
      console.log('🔌 useWebSocket: Cleaning up subscriptions');
      unsubscribeStatus();
      unsubscribeMessages();
      unsubscribeMessageSent();
    };
  }, [wsService, onNewMessage, onMessageSent, autoConnect, connect]);

  return {
    connectionStatus: connectionStatus.status,
    connectionInfo: connectionStatus,
    connect,
    disconnect,
    forceReconnect,
    sendMessage,
    clearPendingMessages,
    isConnected: connectionStatus.status === 'connected',
    isConnecting: connectionStatus.status === 'connecting',
    isReconnecting: connectionStatus.status === 'reconnecting',
    isHealthy: wsService.isHealthy(),
    lastMessage,
    messageCount,
    pendingMessageCount,
    lastConnected: connectionStatus.lastConnected,
    reconnectAttempts: connectionStatus.reconnectAttempts || 0,
    connectionError: connectionStatus.error
  };
};
