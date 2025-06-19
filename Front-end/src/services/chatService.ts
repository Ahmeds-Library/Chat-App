import { AxiosResponse } from 'axios';
import ApiClient from './apiClient';
import { Message, User } from '@/types/chat';

interface ChatListItem {
  partner_id: string;
  partner_name: string;
  partner_number: string;
  last_message: string;
  last_message_at: string;
}

class ChatService {
  private static instance: ChatService;
  private apiClient: ApiClient;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getChatList(): Promise<User[]> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('📋 Fetching chat list...');
      const response = await this.apiClient.getAxiosInstance().get('/chat_list');
      
      console.log('📋 Raw chat list response:', response.data);
      
      const chatList = Array.isArray(response.data) ? response.data : [];
      
      // Remove duplicates by partner_id and keep only the latest message
      const uniqueChats = new Map<string, ChatListItem>();
      
      chatList.forEach((item: ChatListItem) => {
        const existingChat = uniqueChats.get(item.partner_id);
        if (!existingChat || new Date(item.last_message_at) > new Date(existingChat.last_message_at)) {
          uniqueChats.set(item.partner_id, item);
        }
      });
      
      const users: User[] = Array.from(uniqueChats.values()).map((item: ChatListItem) => ({
        id: item.partner_id,
        username: item.partner_name,
        number: item.partner_number,
        lastMessage: item.last_message,
        lastMessageTime: new Date(item.last_message_at).toISOString(),
        isOnline: false,
        unreadCount: 0
      }));
      
      console.log('✅ Chat list transformed:', users.length, 'unique conversations');
      return users;
    } catch (error: any) {
      console.error('❌ Failed to fetch chat list:', error);
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('ℹ️ No chat list found - returning empty array');
        return [];
      }
      throw this.apiClient.handleApiError(error);
    }
  }

  async getMessages(receiverNumber: string): Promise<Message[]> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('📨 Fetching messages for receiver number:', receiverNumber);
      const response = await this.apiClient.getAxiosInstance().post('/get_message', {
        receiver_number: receiverNumber
      });
      
      console.log('📨 Raw backend response:', response.data);
      
      const messagesArray = Array.isArray(response.data) ? response.data : (response.data.messages || []);
      
      console.log('📨 Messages array extracted:', messagesArray);
      
      const messages = messagesArray.map((msg: any) => {
        const transformedMessage: Message = {
          id: msg.id || msg._id || `${msg.sender_id}_${msg.receiver_id}_${Date.now()}`,
          sender: msg.sender_id || msg.sender || '',
          receiver: msg.receiver_id || msg.receiver || '',
          content: msg.message || msg.content || '',
          timestamp: msg.created_at || new Date().toISOString(),
          status: 'sent'
        };
        
        console.log('📨 Transformed message:', {
          original: msg,
          transformed: transformedMessage
        });
        
        return transformedMessage;
      });
      
      console.log('✅ Messages fetched and transformed:', messages.length);
      return messages;
    } catch (error: any) {
      console.error('❌ Failed to fetch messages:', error);
      if ((error as any).response?.status === 500 &&
          (error as any).response?.data?.details?.includes('no messages found')) {
        console.log('ℹ️ No messages found for conversation - returning empty array');
        return [];
      }
      if ((error as any).response?.status === 404) {
        console.log('ℹ️ No conversation found - returning empty array');
        return [];
      }
      if ((error as any).response?.status === 400) {
        console.log('ℹ️ Bad request or no messages - returning empty array');
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
      console.log('📤 Sending message to:', receiverNumber, 'content:', messageContent);
      const response = await this.apiClient.getAxiosInstance().post('/message', {
        receiver_number: receiverNumber,
        message: messageContent
      });
      
      console.log('📤 Backend response for sent message:', response.data);
      
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
      
      console.log('✅ Message sent successfully:', sentMessage);
      return sentMessage;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }

  async updateMessage(data: { messageId: string; content: string }): Promise<Message> {
    if (!this.apiClient.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('✏️ Updating message:', data.messageId);
      const response: AxiosResponse<Message> = await this.apiClient.getAxiosInstance().post('/update_message', data);
      console.log('✅ Message updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update message:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }
}

export default ChatService;
