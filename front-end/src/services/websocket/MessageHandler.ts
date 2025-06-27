
import { Message } from '@/types/chat';
import { WebSocketMessage, SendMessagePayload } from './types';

export class MessageHandler {
  private messageHandlers: ((message: Message) => void)[] = [];
  private messageSentHandlers: ((message: Message) => void)[] = [];
  private pendingMessages: SendMessagePayload[] = [];
  private connectionHealthy = true;

  handleIncomingMessage(event: MessageEvent): void {
    this.connectionHealthy = true;
    
    try {
      const wsMessage: WebSocketMessage = JSON.parse(event.data);
      
      if (wsMessage.type === 'ping' || wsMessage.type === 'pong') {
        console.log('🏓 Ping/Pong message received');
        return;
      }
      
      console.log('📨 CHAT MESSAGE RECEIVED FROM BACKEND:', {
        _id: wsMessage._id,
        id: wsMessage.id,
        sender: wsMessage.sender_id,
        receiver: wsMessage.receiver_id,
        content: wsMessage.message?.substring(0, 50) + '...',
        timestamp: wsMessage.created_at,
        messageHandlersCount: this.messageHandlers.length
      });
      
      if (!wsMessage.sender_id || !wsMessage.receiver_id || !wsMessage.message) {
        console.warn('⚠️ Invalid message format - missing required fields:', {
          hasSender: !!wsMessage.sender_id,
          hasReceiver: !!wsMessage.receiver_id,
          hasMessage: !!wsMessage.message,
          receivedMessage: wsMessage
        });
        return;
      }
      
      let messageId = '';
      if (wsMessage.id) {
        messageId = wsMessage.id;
      } else if (wsMessage._id) {
        if (typeof wsMessage._id === 'string') {
          messageId = wsMessage._id;
        } else if (wsMessage._id.$oid) {
          messageId = wsMessage._id.$oid;
        } else {
          messageId = String(wsMessage._id);
        }
      } else {
        messageId = `ws_${Date.now()}_${Math.random()}`;
      }

      const message: Message = {
        id: messageId,
        sender: wsMessage.sender_id,
        receiver: wsMessage.receiver_id,
        content: wsMessage.message,
        timestamp: this.normalizeTimestamp(wsMessage.created_at),
        status: 'delivered'
      };

      console.log('🔄 TRANSFORMED MESSAGE FOR FRONTEND:', message);
      console.log('📢 Notifying message handlers:', this.messageHandlers.length);

      this.messageHandlers.forEach((handler, index) => {
        try {
          console.log(`📢 Calling handler ${index + 1}/${this.messageHandlers.length}`);
          handler(message);
        } catch (error) {
          console.error(`❌ Message handler ${index + 1} error:`, error);
        }
      });
      
    } catch (error) {
      console.error('❌ WebSocket message parse error:', error);
      console.error('❌ Raw message that failed to parse:', event.data);
    }
  }

  sendMessage(ws: WebSocket, receiverNumber: string, messageContent: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn('⚠️ WebSocket not connected, queueing message');
        this.pendingMessages.push({ receiver_number: receiverNumber, message: messageContent });
        reject(new Error('WebSocket not connected - message queued for retry'));
        return;
      }

      try {
        const cleanReceiverNumber = receiverNumber.startsWith('+') ? receiverNumber.substring(1) : receiverNumber;
        
        const payload: SendMessagePayload = {
          receiver_number: cleanReceiverNumber,
          message: messageContent
        };

        console.log('📤 Sending message in requested format:', payload);
        ws.send(JSON.stringify(payload));

        const sentMessage: Message = {
          id: `ws_sent_${Date.now()}`,
          sender: '',
          receiver: cleanReceiverNumber,
          content: messageContent,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };

        this.messageSentHandlers.forEach((handler) => {
          try {
            handler(sentMessage);
          } catch (error) {
            console.error('❌ Message sent handler error:', error);
          }
        });

        resolve(sentMessage);
      } catch (error) {
        console.error('❌ Failed to send message via WebSocket:', error);
        reject(error);
      }
    });
  }

  processPendingMessages(ws: WebSocket): void {
    if (this.pendingMessages.length === 0) return;

    console.log('📤 Processing pending messages:', this.pendingMessages.length);
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];

    messages.forEach(({ receiver_number, message }) => {
      this.sendMessage(ws, receiver_number, message).catch(error => {
        console.error('❌ Failed to send pending message:', error);
        this.pendingMessages.push({ receiver_number, message });
      });
    });
  }

  onMessage(handler: (message: Message) => void): () => void {
    console.log('📝 Registering message handler. Total handlers:', this.messageHandlers.length + 1);
    this.messageHandlers.push(handler);
    
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        console.log('🗑️ Removing message handler. Remaining handlers:', this.messageHandlers.length - 1);
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onMessageSent(handler: (message: Message) => void): () => void {
    this.messageSentHandlers.push(handler);
    
    return () => {
      const index = this.messageSentHandlers.indexOf(handler);
      if (index > -1) {
        this.messageSentHandlers.splice(index, 1);
      }
    };
  }

  getPendingMessageCount(): number {
    return this.pendingMessages.length;
  }

  clearPendingMessages(): void {
    this.pendingMessages = [];
  }

  private normalizeTimestamp(timestamp: string | Date): string {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }
}
