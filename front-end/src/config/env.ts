
// Environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:9000',
  APP_NAME: 'ChatApp',
  TOKEN_STORAGE_KEY: 'chat_tokens',
  THEME_STORAGE_KEY: 'chat_theme'
} as const;

console.log('🌐 API Base URL configured:', ENV.API_BASE_URL);
console.log('🔌 WebSocket URL configured:', ENV.WS_BASE_URL);
console.log('🔧 Environment check:', {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  customApiUrl: import.meta.env.VITE_API_BASE_URL,
  customWsUrl: import.meta.env.VITE_WS_BASE_URL
});
