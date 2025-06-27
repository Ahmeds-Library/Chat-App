
// Shared connection status types for the chat system
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';

export interface ConnectionInfo {
  status: ConnectionStatus;
  lastConnected?: Date;
  reconnectAttempts?: number;
  error?: string;
}
