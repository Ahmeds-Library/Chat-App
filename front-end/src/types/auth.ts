
export interface LoginRequest {
  username: string;
  password: string;
  number: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  number: string;
  confirmPassword?: string; // This is for form validation only, not sent to backend
}

export interface User {
  id: string;
  username: string;
  number: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    id: string;
    username: string;
    number: string;
  };
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface ApiError {
  message: string;
  details?: string;
  status?: number;
}
