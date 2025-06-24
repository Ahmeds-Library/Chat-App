import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { TokenService } from './tokenService';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private tokenService: TokenService;

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
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.tokenService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('🚨 Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor with detailed error logging
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses for debugging
        console.log('✅ API Success:', {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          data: response.data
        });
        return response;
      },
      async (error) => {
        // Enhanced error logging
        console.error('🚨 Backend Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers
        });

        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.warn('🔒 Token expired, attempting refresh...');
          originalRequest._retry = true;
          
          try {
            await this.tokenService.refreshToken();
            
            const newToken = this.tokenService.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            this.tokenService.clearTokens();
            window.location.href = '/login';
          }
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: any): ApiError {
    let transformedError: ApiError;
    
    if (error.response) {
      transformedError = {
        message: error.response.data?.error || error.response.data?.message || 'API Error',
        status: error.response.status,
        details: error.response.data?.details || error.response.statusText,
      };
    } else if (error.request) {
      transformedError = {
        message: 'Network Error',
        details: 'No response received from server',
      };
    } else {
      transformedError = {
        message: error.message || 'Unknown Error',
      };
    }

    console.error('🚨 Transformed Error:', transformedError);
    return transformedError;
  }

  // Enhanced user identification method - gets numeric user ID from JWT
  getCurrentUserNumber(): string | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) {
        console.warn('⚠️ No access token available for user identification');
        return null;
      }

      // Decode JWT payload to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📱 JWT payload:', payload);
      
      // Return the actual user ID from the token (matches backend senderID)
      const userId = payload.id || payload.user_id || payload.sub;
      if (userId) {
        console.log('📱 Current user ID from JWT:', userId);
        return userId.toString(); // Always return as string for consistency
      }
      
      console.warn('⚠️ No user ID found in JWT payload');
      return null;
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
      return null;
    }
  }

  // Fallback method to get phone number if needed
  getCurrentUserPhoneNumber(): string | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) {
        return null;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.phone_number || payload.phone || null;
    } catch (error) {
      console.error('❌ Error getting phone number from JWT:', error);
      return null;
    }
  }

  // Legacy methods that other services expect
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  handleApiError(error: any): ApiError {
    return this.transformError(error);
  }

  validateTokens(): boolean {
    return this.tokenService.hasValidTokens();
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidTokens();
  }

  logout(): void {
    this.tokenService.clearTokens();
  }

  // HTTP methods with proper return types
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get(url, { params });
    // Handle both wrapped and unwrapped responses
    return response.data && typeof response.data === 'object' && 'data' in response.data 
      ? response.data.data 
      : response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post(url, data);
    // Handle both wrapped and unwrapped responses
    return response.data && typeof response.data === 'object' && 'data' in response.data 
      ? response.data.data 
      : response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put(url, data);
    // Handle both wrapped and unwrapped responses
    return response.data && typeof response.data === 'object' && 'data' in response.data 
      ? response.data.data 
      : response.data;
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete(url);
    // Handle both wrapped and unwrapped responses
    return response.data && typeof response.data === 'object' && 'data' in response.data 
      ? response.data.data 
      : response.data;
  }

  // Raw axios instance for direct access if needed
  get axios(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default ApiClient;
