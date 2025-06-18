import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/auth';
import { TokenService } from '@/services/tokenService';
import ApiService from '@/services/apiService';
import { toast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const tokenService = TokenService.getInstance();
  const apiService = ApiService.getInstance();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      const accessToken = tokenService.getAccessToken();
      const refreshToken = tokenService.getRefreshToken();

      if (accessToken && refreshToken) {
        console.log('🔐 Found stored tokens, attempting to restore session...');
        
        // Try to get stored user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ Session restored for user:', userData.username);
          
          // Optionally verify token validity with a lightweight API call
          // This helps catch expired tokens early
          try {
            // You can add a /verify endpoint or use existing endpoint
            await apiService.getMessages(userData.number);
          } catch (verifyError: any) {
            if (verifyError.status === 401) {
              console.log('🔄 Token expired, attempting refresh...');
              await refreshAuth();
            }
            // If verification fails for other reasons, continue with stored session
          }
        }
      } else {
        console.log('🚫 No stored tokens found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error);
      // Clear potentially corrupted auth state
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 Refreshing authentication...');
      const refreshedTokens = await apiService.refreshToken();
      
      const tokens = {
        access_token: refreshedTokens["Access token"] || refreshedTokens.access_token,
        refresh_token: refreshedTokens["Refresh token"] || refreshedTokens.refresh_token
      };
      
      tokenService.setTokens(tokens);
      console.log('✅ Authentication refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh auth:', error);
      logout();
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const validateAuthResponse = (response: any, action: string) => {
    const tokens = {
      access_token: response["Access token"] || response.access_token,
      refresh_token: response["Refresh token"] || response.refresh_token
    };
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error(`Invalid ${action} response: missing tokens`);
    }
    
    return tokens;
  };

  const createUserObject = (response: any, formData: any): User => {
    return {
      id: response.user?.id || Date.now().toString(),
      username: formData.username,
      number: formData.number
    };
  };

  const login = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 Attempting login:', { username: data.username, number: data.number });
      const response = await apiService.login(data);
      
      const tokens = validateAuthResponse(response, 'login');
      tokenService.setTokens(tokens);
      
      const userObj = createUserObject(response, data);
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${userObj.username}`,
      });
      
      console.log('✅ Login successful for:', userObj.username);
      navigate('/chat', { replace: true });
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (error.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📝 Attempting signup:', { username: data.username, number: data.number });
      const response = await apiService.signup(data);
      
      const tokens = validateAuthResponse(response, 'signup');
      tokenService.setTokens(tokens);
      
      const userObj = createUserObject(response, data);
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      toast({
        title: "Welcome to ChatApp!",
        description: `Account created successfully for ${userObj.username}`,
      });
      
      console.log('✅ Signup successful for:', userObj.username);
      navigate('/chat', { replace: true });
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      if (error.status === 409) {
        errorMessage = 'Username or phone number already exists.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid information provided. Please check your details.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('👋 Logging out user...');
    setUser(null);
    setError(null);
    tokenService.clearTokens();
    localStorage.removeItem('user');
    
    // Clear API service state
    apiService.logout();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    
    navigate('/login', { replace: true });
  };

  const isAuthenticated = !!(user && tokenService.hasValidTokens());

  const value: AuthContextProps = {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
