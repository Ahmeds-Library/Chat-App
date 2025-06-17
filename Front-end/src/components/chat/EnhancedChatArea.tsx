
import React, { useState } from 'react';
import { User, Message } from '@/types/chat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessagesContainer } from '@/components/chat/MessagesContainer';
import { EmptyState } from '@/components/chat/EmptyState';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMessages } from '@/hooks/useMessages';
import { useMessageEditor } from '@/hooks/useMessageEditor';

interface EnhancedChatAreaProps {
  selectedUser: User | null;
  currentUserNumber: string;
  onMessageSent: (userNumber: string, message: Message) => void;
  initialMessage?: Message | null;
}

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  selectedUser,
  currentUserNumber,
  onMessageSent,
  initialMessage = null,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useIsMobile();

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage
  } = useMessages({
    selectedUser,
    currentUserNumber,
    initialMessage,
    onMessageSent
  });

  const {
    editingMessageId,
    editingText,
    startEdit,
    cancelEdit,
    updateEditingText
  } = useMessageEditor();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage(messageContent);
    } catch (error) {
      // Error already handled in useMessages hook
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    await editMessage(messageId, newText);
    cancelEdit();
  };

  if (!selectedUser) {
    return <EmptyState />;
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20",
      isMobile && "ml-0"
    )}>
      <ChatHeader selectedUser={selectedUser} />
      
      <div className="flex-1 flex flex-col min-h-0">
        <MessagesContainer
          messages={messages}
          isLoading={isLoading}
          currentUserNumber={currentUserNumber}
          editingMessageId={editingMessageId}
          editingText={editingText}
          onEditMessage={handleEditMessage}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          setEditingText={updateEditingText}
        />

        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </div>
    </div>
  );
};
