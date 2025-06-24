
import { useEffect, useCallback, useState } from 'react';
import WebSocketService from '@/services/websocketService';
import { Message } from '@/types/chat';

interface UseWebSocketProps {
  onNewMessage?: (message: Message) => void;
  autoConnect?: boolean;
}

export const useWebSocket = ({ 
  onNewMessage, 
  autoConnect = true 
}: UseWebSocketProps = {}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [connectionHealth, setConnectionHealth] = useState(true);
  
  const wsService = WebSocketService.getInstance();

  const connect = useCallback(() => {
    console.log('🔌 useWebSocket: Attempting to connect...');
    wsService.connect();
  }, [wsService]);

  const disconnect = useCallback(() => {
    console.log('🔌 useWebSocket: Disconnecting...');
    wsService.disconnect();
  }, [wsService]);

  const sendTestMessage = useCallback((content: string = 'Test message from frontend') => {
    console.log('🧪 useWebSocket: Sending test message:', content);
    wsService.sendTestMessage(content);
  }, [wsService]);

  const checkConnectionHealth = useCallback(() => {
    const isHealthy = wsService.isHealthy();
    setConnectionHealth(isHealthy);
    return isHealthy;
  }, [wsService]);

  useEffect(() => {
    console.log('🔌 useWebSocket: Setting up WebSocket subscriptions');
    
    // Subscribe to connection status changes
    const unsubscribeStatus = wsService.onConnectionStatus((status) => {
      console.log('🔌 useWebSocket: Connection status changed to:', status);
      setConnectionStatus(status);
      
      // Update connection health when status changes
      if (status === 'connected') {
        setConnectionHealth(true);
      } else if (status === 'disconnected') {
        setConnectionHealth(false);
      }
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

    // Auto-connect if enabled
    if (autoConnect) {
      console.log('🔌 useWebSocket: Auto-connecting enabled');
      connect();
    }

    // Set initial connection status
    const initialStatus = wsService.getConnectionStatus();
    console.log('🔌 useWebSocket: Initial connection status:', initialStatus);
    setConnectionStatus(initialStatus);
    setConnectionHealth(wsService.isHealthy());

    // Health check interval
    const healthCheckInterval = setInterval(() => {
      checkConnectionHealth();
    }, 10000); // Check every 10 seconds

    // Cleanup on unmount
    return () => {
      console.log('🔌 useWebSocket: Cleaning up subscriptions');
      unsubscribeStatus();
      unsubscribeMessages();
      clearInterval(healthCheckInterval);
    };
  }, [wsService, onNewMessage, autoConnect, connect, checkConnectionHealth]);

  return {
    connectionStatus,
    connect,
    disconnect,
    sendTestMessage,
    checkConnectionHealth,
    isConnected: connectionStatus === 'connected' && connectionHealth,
    isConnecting: connectionStatus === 'connecting',
    isHealthy: connectionHealth,
    lastMessage,
    messageCount
  };
};
