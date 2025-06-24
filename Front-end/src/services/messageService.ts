
import ApiClient from './apiClient';
import { Message } from '@/types/chat';

class MessageService {
  private static instance: MessageService;
  private apiClient: ApiClient;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
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
      console.log('📤 Sending message to:', receiverNumber);
      const response = await this.apiClient.getAxiosInstance().post('/message', {
        receiver_number: receiverNumber,
        message: messageContent
      });
      
      console.log('📤 Message send response:', response.data);
      
      let actualMessageContent = messageContent;
      if (response.data.message) {
        actualMessageContent = response.data.message;
      }
      
      const currentUserNumber = this.apiClient.getCurrentUserNumber();
      
      const sentMessage: Message = {
        id: `sent_${Date.now()}`,
        sender: currentUserNumber || '',
        receiver: receiverNumber,
        content: actualMessageContent,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      console.log('✅ Message sent successfully');
      return sentMessage;
    } catch (error) {
      console.error('❌ Message send failed - Backend error details:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }

  async updateMessage(data: { messageId: string; content: string }): Promise<Message> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('✏️ Updating message:', data.messageId);
      
      // Match your Go backend's Update_Message struct
      const payload = {
        id: data.messageId,
        new_message: data.content,
        updated_at: new Date().toISOString()
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
        editedAt: payload.updated_at
      };
      
      return updatedMessage;
    } catch (error) {
      console.error('❌ Message update failed - Backend error details:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }
}

export default MessageService;
