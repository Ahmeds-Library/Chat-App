
import React, { useState } from 'react';
import { User, Message } from '@/types/chat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MobileChatHeader } from '@/components/chat/MobileChatHeader';
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
  onBack?: () => void;
  mobileMenuState?: {
    isOpen: boolean;
    toggleSidebar: () => void;
  };
}

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  selectedUser,
  currentUserNumber,
  onMessageSent,
  initialMessage = null,
  onBack,
  mobileMenuState
}) => {
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useIsMobile();

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    connectionStatus,
    messageCount
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
      setNewMessage(messageContent);
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
      "flex-1 flex flex-col h-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20",
      isMobile && "ml-0"
    )}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
        {isMobile ? (
          <MobileChatHeader 
            selectedUser={selectedUser}
            connectionStatus={connectionStatus}
            messageCount={messageCount}
            onBack={onBack}
            mobileMenuState={mobileMenuState}
          />
        ) : (
          <ChatHeader 
            selectedUser={selectedUser}
            connectionStatus={connectionStatus}
            messageCount={messageCount}
          />
        )}
      </div>
      
      {/* Chat Content - Scrollable Messages */}
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

        {/* Fixed Message Input */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
};
