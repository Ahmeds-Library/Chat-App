import { AxiosResponse } from 'axios';
import ApiClient from './apiClient';
import { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth';

class AuthService {
  private static instance: AuthService;
  private apiClient: ApiClient;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Signup attempt:', { username: data.username, number: data.number });
      const { confirmPassword, ...signupData } = data;
      const response: AxiosResponse<AuthResponse> = await this.apiClient.getAxiosInstance().post('/signup', signupData);
      console.log('✅ Signup successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Signup failed - Full error details:', {
        error,
        response: (error as any)?.response,
        request: (error as any)?.request,
        message: (error as any)?.message
      });
      throw this.apiClient.handleApiError(error as any);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt:', { username: data.username, number: data.number });
      const response: AxiosResponse<AuthResponse> = await this.apiClient.getAxiosInstance().post('/login', data);
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed - Full error details:', {
        error,
        response: (error as any)?.response,
        request: (error as any)?.request,
        message: (error as any)?.message
      });
      throw this.apiClient.handleApiError(error as any);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      console.log('🔄 Refresh token attempt');
      const refreshToken = this.apiClient.validateTokens();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<AuthResponse> = await this.apiClient.getAxiosInstance().post('/refresh_key', {});
      console.log('✅ Token refresh successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed - Full error details:', {
        error,
        response: (error as any)?.response,
        request: (error as any)?.request,
        message: (error as any)?.message
      });
      throw this.apiClient.handleApiError(error as any);
    }
  }

  isAuthenticated(): boolean {
    return this.apiClient.isAuthenticated();
  }

  logout(): void {
    this.apiClient.logout();
  }
}

export default AuthService;
