
import React from 'react';
import { Message } from '@/types/chat';
import { MessageList } from '@/components/chat/MessageList';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex-1 min-h-0 relative">
      <ScrollArea className="h-full">
        <MessageList {...props} />
      </ScrollArea>
    </div>
  );
};
