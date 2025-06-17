
import { ENV } from '@/config/env';
import { TokenPair } from '@/types/auth';

export class TokenService {
  private static instance: TokenService;
  private tokens: TokenPair | null = null;

  private constructor() {
    this.loadTokens();
  }

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  private loadTokens(): void {
    try {
      const stored = localStorage.getItem(ENV.TOKEN_STORAGE_KEY);
      console.log('Loading tokens from localStorage:', stored ? 'found' : 'not found');
      if (stored && stored !== '{}' && stored !== 'null') {
        const parsedTokens = JSON.parse(stored);
        // Validate that the tokens actually exist and are not empty
        if (parsedTokens.access_token && parsedTokens.refresh_token && 
            parsedTokens.access_token.trim() !== '' && parsedTokens.refresh_token.trim() !== '') {
          this.tokens = parsedTokens;
          console.log('Tokens loaded successfully:', {
            hasAccess: !!this.tokens?.access_token,
            hasRefresh: !!this.tokens?.refresh_token,
            accessLength: this.tokens?.access_token?.length,
            refreshLength: this.tokens?.refresh_token?.length
          });
        } else {
          console.log('Invalid tokens found in localStorage, clearing...');
          this.clearTokens();
        }
      } else {
        console.log('No valid tokens found in localStorage');
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.clearTokens();
    }
  }

  setTokens(tokens: TokenPair): void {
    console.log('Setting tokens - received:', {
      access_token: tokens.access_token ? 'present' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing',
      hasAccess: !!tokens.access_token,
      hasRefresh: !!tokens.refresh_token,
      accessLength: tokens.access_token?.length,
      refreshLength: tokens.refresh_token?.length
    });

    // Validate tokens before storing
    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Invalid tokens received - missing access_token or refresh_token:', tokens);
      throw new Error('Invalid tokens: missing access_token or refresh_token');
    }

    if (tokens.access_token.trim() === '' || tokens.refresh_token.trim() === '') {
      console.error('Invalid tokens received - empty strings:', tokens);
      throw new Error('Invalid tokens: empty access_token or refresh_token');
    }
    
    this.tokens = tokens;
    try {
      const tokenString = JSON.stringify(tokens);
      localStorage.setItem(ENV.TOKEN_STORAGE_KEY, tokenString);
      console.log('Tokens saved to localStorage successfully');
      
      // Verify storage
      const verification = localStorage.getItem(ENV.TOKEN_STORAGE_KEY);
      console.log('Storage verification successful:', !!verification);
      
      // Double check by parsing again
      const verifyParsed = JSON.parse(verification || '{}');
      console.log('Parsed verification:', {
        hasAccess: !!verifyParsed.access_token,
        hasRefresh: !!verifyParsed.refresh_token
      });
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save tokens to localStorage');
    }
  }

  getAccessToken(): string | null {
    // Always try to reload from localStorage to ensure we have the latest tokens
    if (!this.tokens) {
      this.loadTokens();
    }
    
    const token = this.tokens?.access_token || null;
    console.log('Getting access token:', token ? `present (${token.length} chars)` : 'missing');
    return token;
  }

  getRefreshToken(): string | null {
    // Always try to reload from localStorage to ensure we have the latest tokens
    if (!this.tokens) {
      this.loadTokens();
    }
    
    const token = this.tokens?.refresh_token || null;
    console.log('Getting refresh token:', token ? `present (${token.length} chars)` : 'missing');
    return token;
  }

  clearTokens(): void {
    console.log('Clearing tokens...');
    this.tokens = null;
    localStorage.removeItem(ENV.TOKEN_STORAGE_KEY);
    console.log('Tokens cleared from localStorage');
  }

  hasValidTokens(): boolean {
    // Always try to reload from localStorage to ensure we have the latest tokens
    if (!this.tokens) {
      this.loadTokens();
    }
    
    const hasTokens = !!(this.tokens?.access_token && this.tokens?.refresh_token && 
                        this.tokens.access_token.trim() !== '' && this.tokens.refresh_token.trim() !== '');
    console.log('Checking valid tokens:', hasTokens);
    return hasTokens;
  }
}
