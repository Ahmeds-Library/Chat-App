import { AxiosResponse } from 'axios';
import ApiClient from './apiClient';
import MessageService from './messageService';
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
  private messageService: MessageService;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
    this.messageService = MessageService.getInstance();
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
      
      console.log('📋 Chat list response received:', response.data);
      
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
      
      console.log('✅ Chat list processed:', users.length, 'unique conversations');
      return users;
    } catch (error: any) {
      console.error('❌ Chat list fetch failed - Backend error details:', error);
      
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('ℹ️ No chat list found - returning empty array');
        return [];
      }
      throw this.apiClient.handleApiError(error);
    }
  }

  async getMessages(receiverNumber: string): Promise<Message[]> {
    return this.messageService.getMessages(receiverNumber);
  }

  async sendMessage(receiverNumber: string, messageContent: string): Promise<Message> {
    return this.messageService.sendMessage(receiverNumber, messageContent);
  }

  async updateMessage(data: { messageId: string; content: string }): Promise<Message> {
    return this.messageService.updateMessage(data);
  }
}

export default ChatService;
