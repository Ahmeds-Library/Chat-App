
import AuthService from './authService';
import ChatService from './chatService';
import ApiClient from './apiClient';

class ApiService {
  private static instance: ApiService;
  private authService: AuthService;
  private chatService: ChatService;
  private apiClient: ApiClient;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.chatService = ChatService.getInstance();
    this.apiClient = ApiClient.getInstance();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Auth methods
  async signup(data: any) {
    return this.authService.signup(data);
  }

  async login(data: any) {
    return this.authService.login(data);
  }

  async refreshToken() {
    return this.authService.refreshToken();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }

  // Chat methods
  async getChatList() {
    return this.chatService.getChatList();
  }

  async getMessages(receiverNumber: string) {
    return this.chatService.getMessages(receiverNumber);
  }

  async sendMessage(receiverNumber: string, messageContent: string) {
    return this.chatService.sendMessage(receiverNumber, messageContent);
  }

  async updateMessage(data: { messageId: string; content: string }) {
    return this.chatService.updateMessage(data);
  }
}

export default ApiService;
