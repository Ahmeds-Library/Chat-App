import { ENV } from '@/config/env';
import { TokenService } from './tokenService';
import { Message } from '@/types/chat';

export interface WebSocketMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  type?: string;
}

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageHandlers: ((message: Message) => void)[] = [];
  private connectionStatusHandlers: ((status: 'connected' | 'disconnected' | 'connecting') => void)[] = [];
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime = Date.now();
  private connectionHealthy = true;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    const tokenService = TokenService.getInstance();
    const token = tokenService.getAccessToken();
    
    if (!token) {
      console.warn('⚠️ No access token for WebSocket connection');
      this.notifyConnectionStatus('disconnected');
      return;
    }

    this.isConnecting = true;
    this.notifyConnectionStatus('connecting');

    const wsUrl = `${ENV.WS_BASE_URL}/ws?token=${token}`;
    console.log('🔌 Connecting to WebSocket...');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionHealthy = true;
        this.notifyConnectionStatus('connected');
        this.startPingPong();
      };

      this.ws.onmessage = (event) => {
        this.lastPongTime = Date.now();
        this.connectionHealthy = true;
        
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data);
          
          // Filter out ping/pong and test messages from logs
          if (wsMessage.type === 'ping' || wsMessage.type === 'pong') {
            return;
          }
          
          if (wsMessage.type === 'test') {
            console.log('🧪 Test message:', wsMessage.message);
            return;
          }
          
          // Only log important chat messages
          console.log('📨 New message received:', {
            id: wsMessage.id,
            sender: wsMessage.sender_id,
            content: wsMessage.message?.substring(0, 30) + '...'
          });
          
          // Validate required fields for chat messages
          if (!wsMessage.sender_id || !wsMessage.receiver_id || !wsMessage.message) {
            console.warn('⚠️ Invalid message format');
            return;
          }
          
          // Transform WebSocket message to our Message type
          const message: Message = {
            id: wsMessage.id || `ws_${Date.now()}_${Math.random()}`,
            sender: wsMessage.sender_id,
            receiver: wsMessage.receiver_id,
            content: wsMessage.message,
            timestamp: this.normalizeTimestamp(wsMessage.created_at),
            status: 'delivered'
          };

          // Notify all message handlers
          this.messageHandlers.forEach((handler) => {
            try {
              handler(message);
            } catch (error) {
              console.error('❌ Message handler error:', error);
            }
          });
          
        } catch (error) {
          console.error('❌ WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code);
        this.isConnecting = false;
        this.connectionHealthy = false;
        this.stopPingPong();
        this.notifyConnectionStatus('disconnected');
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.connectionHealthy = false;
        this.notifyConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.isConnecting = false;
      this.connectionHealthy = false;
      this.notifyConnectionStatus('disconnected');
    }
  }

  private normalizeTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  private startPingPong(): void {
    this.stopPingPong();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const timeSinceLastPong = Date.now() - this.lastPongTime;
        if (timeSinceLastPong > 60000) { // 1 minute timeout
          console.warn('⚠️ Connection timeout - reconnecting');
          this.connectionHealthy = false;
          this.disconnect();
          this.connect();
        } else {
          this.sendPing();
        }
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopPingPong(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private sendPing(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const pingMessage = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(pingMessage));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.stopPingPong();
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.connectionHealthy = false;
  }

  onMessage(handler: (message: Message) => void): () => void {
    this.messageHandlers.push(handler);
    
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onConnectionStatus(handler: (status: 'connected' | 'disconnected' | 'connecting') => void): () => void {
    this.connectionStatusHandlers.push(handler);
    
    return () => {
      const index = this.connectionStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionStatusHandlers.splice(index, 1);
      }
    };
  }

  private notifyConnectionStatus(status: 'connected' | 'disconnected' | 'connecting'): void {
    this.connectionStatusHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error('❌ Connection status handler error:', error);
      }
    });
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnecting) return 'connecting';
    const status = this.ws?.readyState === WebSocket.OPEN && this.connectionHealthy ? 'connected' : 'disconnected';
    return status;
  }

  isHealthy(): boolean {
    return this.connectionHealthy && this.ws?.readyState === WebSocket.OPEN;
  }

  sendTestMessage(content: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const testMessage = {
        type: 'test',
        message: content,
        timestamp: new Date().toISOString()
      };
      console.log('🧪 Sending test message:', content);
      this.ws.send(JSON.stringify(testMessage));
    } else {
      console.warn('⚠️ Cannot send test message - not connected');
    }
  }
}

export default WebSocketService;
