
import { Message } from '@/types/chat';

export interface WebSocketMessage {
  _id?: string | { $oid: string }; // MongoDB ObjectID format
  id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string | Date;
  type?: string;
}

export interface SendMessagePayload {
  receiver_number: string; // Using receiver_number as expected by backend
  message: string;
}

export interface ConnectionStatusInfo {
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  lastConnected?: Date;
  reconnectAttempts?: number;
  error?: string;
}
