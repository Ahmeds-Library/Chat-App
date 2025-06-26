
import { Message } from '@/types/chat';
import { ConnectionStatusInfo, SendMessagePayload } from './types';
import { ConnectionManager } from './ConnectionManager';
import { MessageHandler } from './MessageHandler';

class WebSocketService {
  private static instance: WebSocketService;
  private connectionManager: ConnectionManager;
  private messageHandler: MessageHandler;

  private constructor() {
    this.connectionManager = new ConnectionManager();
    this.messageHandler = new MessageHandler();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): void {
    this.connectionManager.connect()
      .then((ws) => {
        ws.onmessage = (event) => this.messageHandler.handleIncomingMessage(event);
        this.messageHandler.processPendingMessages(ws);
      })
      .catch(console.error);
  }

  disconnect(): void {
    this.connectionManager.disconnect();
  }

  forceReconnect(): void {
    this.connectionManager.forceReconnect();
  }

  sendMessage(receiverNumber: string, messageContent: string): Promise<Message> {
    const ws = this.connectionManager.getWebSocket();
    if (!ws) {
      return Promise.reject(new Error('WebSocket not connected'));
    }
    return this.messageHandler.sendMessage(ws, receiverNumber, messageContent);
  }

  onMessage(handler: (message: Message) => void): () => void {
    return this.messageHandler.onMessage(handler);
  }

  onMessageSent(handler: (message: Message) => void): () => void {
    return this.messageHandler.onMessageSent(handler);
  }

  onConnectionStatus(handler: (status: ConnectionStatusInfo) => void): () => void {
    return this.connectionManager.onConnectionStatus(handler);
  }

  getConnectionStatus(): ConnectionStatusInfo {
    return this.connectionManager.getConnectionStatus();
  }

  isHealthy(): boolean {
    return this.connectionManager.isHealthy();
  }

  getPendingMessageCount(): number {
    return this.messageHandler.getPendingMessageCount();
  }

  clearPendingMessages(): void {
    this.messageHandler.clearPendingMessages();
  }
}

export default WebSocketService;
export type { ConnectionStatusInfo } from './types';
