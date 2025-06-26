
import ApiClient from './apiClient';
import WebSocketService from './websocket/WebSocketService';
import { Message } from '@/types/chat';

class MessageService {
  private static instance: MessageService;
  private apiClient: ApiClient;
  private wsService: WebSocketService;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
    this.wsService = WebSocketService.getInstance();
  }

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  async getMessages(receiverNumber: string): Promise<Message[]> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('📨 Fetching messages for:', receiverNumber);
      const response = await this.apiClient.getAxiosInstance().post('/get_message', {
        receiver_number: receiverNumber
      });
      
      console.log('📨 Messages response received:', response.data);
      
      const messagesArray = Array.isArray(response.data) ? response.data : (response.data.messages || []);
      
      const messages = messagesArray.map((msg: any) => {
        const transformedMessage: Message = {
          id: msg.id || msg._id || `${msg.sender_id}_${msg.receiver_id}_${Date.now()}`,
          sender: msg.sender_id || msg.sender || '',
          receiver: msg.receiver_id || msg.receiver || '',
          content: msg.message || msg.content || '',
          timestamp: msg.created_at || new Date().toISOString(),
          status: 'sent'
        };
        
        return transformedMessage;
      });
      
      console.log('✅ Messages processed:', messages.length);
      return messages;
    } catch (error: any) {
      console.error('❌ Messages fetch failed - Backend error details:', error);
      
      if (error.response?.status === 500 &&
          error.response?.data?.details?.includes('no messages found')) {
        console.log('ℹ️ No messages found for conversation');
        return [];
      }
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('ℹ️ No conversation found');
        return [];
      }
      throw this.apiClient.handleApiError(error);
    }
  }

  async sendMessage(receiverNumber: string, messageContent: string): Promise<Message> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('📤 Sending message via WebSocket to:', receiverNumber, 'Content:', messageContent.substring(0, 50) + '...');
      
      // Ensure receiverNumber is in the correct format (with +)
      const formattedReceiverNumber = receiverNumber.startsWith('+') ? receiverNumber : `+${receiverNumber}`;
      
      // Use WebSocket service for sending messages - NO HTTP fallback, pure WebSocket only
      const sentMessage = await this.wsService.sendMessage(formattedReceiverNumber, messageContent);
      
      const currentUserNumber = this.apiClient.getCurrentUserNumber();
      
      const message: Message = {
        ...sentMessage,
        sender: currentUserNumber || '',
        id: `sent_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      console.log('✅ Message sent successfully via WebSocket - pure WebSocket messaging');
      return message;
    } catch (error: any) {
      console.error('❌ Message send failed via WebSocket:', error);
      // Don't show any toasts here - let WebSocket event handlers manage all messaging toasts
      throw new Error(error.message || 'Failed to send message via WebSocket');
    }
  }

  async updateMessage(data: { messageId: string; content: string }): Promise<Message> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('✏️ Updating message:', data.messageId);
      
      // Updated payload format to match your specified JSON structure
      const payload = {
        id: data.messageId,
        new_message: data.content
      };
      
      console.log('✏️ Sending update payload:', payload);
      
      const response = await this.apiClient.getAxiosInstance().post('/update_message', payload);
      
      console.log('✅ Message updated successfully:', response.data);
      
      // Return updated message with proper structure
      const updatedMessage: Message = {
        id: data.messageId,
        sender: '', // Will be filled by the calling component
        receiver: '', // Will be filled by the calling component
        content: data.content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        edited: true,
        editedAt: new Date().toISOString()
      };
      
      return updatedMessage;
    } catch (error) {
      console.error('❌ Message update failed - Backend error details:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }
}

export default MessageService;
