
import React from 'react';
import { Message } from '@/types/chat';
import { MessageList } from '@/components/chat/MessageList';

interface MessagesContainerProps {
  messages: Message[];
  isLoading: boolean;
  currentUserNumber: string;
  editingMessageId: string | null;
  editingText: string;
  onEditMessage: (messageId: string, newText: string) => void;
  onStartEdit: (messageId: string, content: string) => void;
  onCancelEdit: () => void;
  setEditingText: (text: string) => void;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = (props) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50/30 to-purple-50/30 dark:from-gray-900/30 dark:to-gray-800/30 overflow-hidden">
      <MessageList {...props} />
    </div>
  );
};
