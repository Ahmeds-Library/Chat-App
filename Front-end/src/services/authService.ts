
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
      console.log('✅ Signup successful');
      return response.data;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt:', { username: data.username, number: data.number });
      const response: AxiosResponse<AuthResponse> = await this.apiClient.getAxiosInstance().post('/login', data);
      console.log('✅ Login successful');
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw this.apiClient.handleApiError(error as any);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = this.apiClient.validateTokens();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<AuthResponse> = await this.apiClient.getAxiosInstance().post('/refresh_key', {});
      return response.data;
    } catch (error) {
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
