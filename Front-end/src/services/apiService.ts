import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '@/config/env';
import { TokenService } from './tokenService';
import { AuthResponse, LoginRequest, SignupRequest, ApiError } from '@/types/auth';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private tokenService: TokenService;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: Function; reject: Function }> = [];
  private retryAttempts = new Map<string, number>();

  private constructor() {
    this.tokenService = TokenService.getInstance();
    this.axiosInstance = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor with enhanced logging and validation
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.tokenService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            hasToken: true,
            tokenLength: token.length,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            hasToken: false,
            timestamp: new Date().toISOString()
          });
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with enhanced error handling and retry logic
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const requestKey = `${response.config.method?.toUpperCase()}_${response.config.url}`;
        this.retryAttempts.delete(requestKey);
        
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          timestamp: new Date().toISOString()
        });
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const requestKey = `${originalRequest?.method?.toUpperCase()}_${originalRequest?.url}`;

        console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
          status: error.response?.status,
          message: error.message,
          timestamp: new Date().toISOString()
        });

        // Handle 401 Unauthorized with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.tokenService.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            console.log('🔄 Attempting token refresh...');
            const response = await axios.post(`${ENV.API_BASE_URL}/refresh_key`, {}, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json',
              }
            });

            const newTokens = response.data;
            this.tokenService.setTokens(newTokens);
            console.log('✅ Token refresh successful');

            this.processQueue(null);
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            this.processQueue(refreshError);
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Retry logic for network errors and 5xx errors
        if (this.shouldRetry(error, requestKey)) {
          const retryCount = this.retryAttempts.get(requestKey) || 0;
          this.retryAttempts.set(requestKey, retryCount + 1);
          
          console.log(`🔄 Retrying request (attempt ${retryCount + 1}): ${requestKey}`);
          
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.axiosInstance(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError, requestKey: string): boolean {
    const retryCount = this.retryAttempts.get(requestKey) || 0;
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      this.retryAttempts.delete(requestKey);
      return false;
    }

    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    this.failedQueue = [];
  }

  private handleLogout(): void {
    this.tokenService.clearTokens();
    toast({
      title: "Session Expired",
      description: "Please log in again to continue.",
      variant: "destructive",
    });
    window.location.href = '/login';
  }

  private handleApiError(error: AxiosError): ApiError {
    const response = error.response;
    const responseData = response?.data as any;
    
    let message = 'An unexpected error occurred';
    
    if (responseData) {
      message = responseData.message || 
                responseData.detail || 
                responseData.error || 
                responseData.msg ||
                error.message ||
                'An unexpected error occurred';
    } else if (error.message) {
      message = error.message;
    }
    
    console.error('API Error Details:', {
      status: response?.status,
      message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData
    });

    return {
      message,
      status: response?.status,
      details: responseData?.details || error.message
    };
  }

  private validateTokens(): boolean {
    const hasValidTokens = this.tokenService.hasValidTokens();
    if (!hasValidTokens) {
      console.error('No valid tokens found');
      toast({
        title: "Authentication Required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Signup attempt:', { username: data.username, number: data.number });
      const { confirmPassword, ...signupData } = data;
      const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/signup', signupData);
      console.log('✅ Signup successful');
      return response.data;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw this.handleApiError(error as AxiosError);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt:', { username: data.username, number: data.number });
      const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/login', data);
      console.log('✅ Login successful');
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw this.handleApiError(error as AxiosError);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = this.tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<AuthResponse> = await axios.post(`${ENV.API_BASE_URL}/refresh_key`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async getMessages(receiverNumber: string): Promise<Message[]> {
    if (!this.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('📨 Fetching messages for receiver number:', receiverNumber);
      const response = await this.axiosInstance.post('/get_message', {
        receiver_number: receiverNumber
      });
      
      console.log('📨 Raw backend response:', response.data);
      
      // Handle direct array response from backend
      const messagesArray = Array.isArray(response.data) ? response.data : (response.data.messages || []);
      
      console.log('📨 Messages array extracted:', messagesArray);
      
      // Transform backend messages to frontend format
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
      console.log('📨 Final transformed messages:', messages);
      return messages;
    } catch (error: any) {
      console.error('❌ Failed to fetch messages:', error);
      // Handle "no messages found" as normal case, not an error
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
      throw this.handleApiError(error as AxiosError);
    }
  }

  async sendMessage(receiverNumber: string, messageContent: string): Promise<Message> {
    if (!this.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('📤 Sending message to:', receiverNumber, 'content:', messageContent);
      const response = await this.axiosInstance.post('/message', {
        receiver_number: receiverNumber,
        message: messageContent
      });
      
      console.log('📤 Backend response for sent message:', response.data);
      
      // Extract message content from backend response structure
      let actualMessageContent = messageContent;
      if (response.data.message) {
        actualMessageContent = response.data.message;
      }
      
      // Get current user info from token for proper sender assignment
      const currentUserNumber = this.getCurrentUserNumber();
      
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
      throw this.handleApiError(error as AxiosError);
    }
  }

  // Helper method to get current user number from token
  private getCurrentUserNumber(): string | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) return null;
      
      // Decode JWT token to get user info (simple base64 decode for payload)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return decodedPayload.number || decodedPayload.user_number || decodedPayload.phone_number || null;
    } catch (error) {
      console.error('❌ Failed to decode user info from token:', error);
      return null;
    }
  }

  async updateMessage(data: { messageId: string; content: string }): Promise<Message> {
    if (!this.validateTokens()) {
      throw new Error('Authentication required');
    }

    try {
      console.log('✏️ Updating message:', data.messageId);
      const response: AxiosResponse<Message> = await this.axiosInstance.post('/update_message', data);
      console.log('✅ Message updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update message:', error);
      throw this.handleApiError(error as AxiosError);
    }
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidTokens();
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.retryAttempts.clear();
    console.log('👋 User logged out');
  }
}

export default ApiService;
