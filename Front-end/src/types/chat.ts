export interface User {
  id: string;
  username: string;
  number: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  edited?: boolean;
  editedAt?: string;
  // Additional fields that might come from backend
  sender_id?: string;
  receiver_id?: string;
  message?: string;
  created_at?: string | { $date: string };
}

export interface GetMessagesRequest {
  receiver_number: string;
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface SendMessageRequest {
  receiver: string;
  content: string;
}

export interface UpdateMessageRequest {
  messageId: string;
  content: string;
}
