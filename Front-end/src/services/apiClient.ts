
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ENV } from '@/config/env';
import { TokenService } from './tokenService';
import { toast } from '@/hooks/use-toast';

class ApiClient {
  private static instance: ApiClient;
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

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
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

  getAxiosInstance() {
    return this.axiosInstance;
  }

  validateTokens(): boolean {
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

  handleApiError(error: AxiosError): any {
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

  getCurrentUserNumber(): string | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return decodedPayload.number || decodedPayload.user_number || decodedPayload.phone_number || null;
    } catch (error) {
      console.error('❌ Failed to decode user info from token:', error);
      return null;
    }
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.retryAttempts.clear();
    console.log('👋 User logged out');
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidTokens();
  }
}

export default ApiClient;
