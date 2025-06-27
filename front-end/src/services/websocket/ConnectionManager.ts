
import { ENV } from '@/config/env';
import { TokenService } from '../tokenService';
import { ConnectionStatusInfo } from './types';

export class ConnectionManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private connectionHealthy = true;
  private currentConnectionStatus: ConnectionStatusInfo = { status: 'disconnected' };
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionStatusHandlers: ((status: ConnectionStatusInfo) => void)[] = [];

  connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve(this.ws);
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      const tokenService = TokenService.getInstance();
      const token = tokenService.getAccessToken();
      
      if (!token) {
        console.warn('⚠️ No access token for WebSocket connection');
        this.updateConnectionStatus({
          status: 'disconnected',
          error: 'No authentication token available'
        });
        reject(new Error('No authentication token'));
        return;
      }

      this.isConnecting = true;
      this.updateConnectionStatus({
        status: this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting',
        reconnectAttempts: this.reconnectAttempts
      });

      const wsUrl = `${ENV.WS_BASE_URL}/ws?token=${token}`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectionHealthy = true;
          
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }

          this.updateConnectionStatus({
            status: 'connected',
            lastConnected: new Date(),
            reconnectAttempts: 0
          });
          
          resolve(this.ws!);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code);
          this.isConnecting = false;
          this.connectionHealthy = false;
          
          this.updateConnectionStatus({
            status: 'disconnected',
            error: event.code !== 1000 ? `Connection closed with code ${event.code}` : undefined
          });
          
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.connectionHealthy = false;
          
          this.updateConnectionStatus({
            status: 'disconnected',
            error: 'Connection error occurred'
          });
          
          reject(error);
        };

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        this.isConnecting = false;
        this.connectionHealthy = false;
        
        this.updateConnectionStatus({
          status: 'disconnected',
          error: 'Failed to create WebSocket connection'
        });
        
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.connectionHealthy = false;
    
    this.updateConnectionStatus({
      status: 'disconnected'
    });
  }

  forceReconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }

  getWebSocket(): WebSocket | null {
    return this.ws;
  }

  isHealthy(): boolean {
    return this.connectionHealthy && this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): ConnectionStatusInfo {
    return { ...this.currentConnectionStatus };
  }

  onConnectionStatus(handler: (status: ConnectionStatusInfo) => void): () => void {
    this.connectionStatusHandlers.push(handler);
    handler(this.currentConnectionStatus);
    
    return () => {
      const index = this.connectionStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionStatusHandlers.splice(index, 1);
      }
    };
  }

  private updateConnectionStatus(status: ConnectionStatusInfo): void {
    this.currentConnectionStatus = { ...status };
    console.log('📡 Connection status updated:', status);
    
    this.connectionStatusHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error('❌ Connection status handler error:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.updateConnectionStatus({
      status: 'disconnected',
      reconnectAttempts: this.reconnectAttempts,
      error: `Reconnecting in ${Math.ceil(delay / 1000)} seconds...`
    });
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }
}
