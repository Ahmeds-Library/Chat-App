
import React, { useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '@/types/chat';
import { MessageBubble } from '@/components/chat/MessageBubble';

interface MessageListProps {
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

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  currentUserNumber,
  editingMessageId,
  editingText,
  onEditMessage,
  onStartEdit,
  onCancelEdit,
  setEditingText
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className="h-12 w-64 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto overscroll-contain p-4"
      style={{ height: 'calc(100vh - 180px)' }}
    >
      <div className="space-y-6 pb-4 min-h-full">
        {Object.entries(messageGroups).map(([dateString, dayMessages]) => (
          <div key={dateString} className="space-y-1">
            {/* Date separator */}
            <div className="flex justify-center my-6 sticky top-0 z-10">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                {formatDate(dateString)}
              </div>
            </div>

            {dayMessages.map((message) => {
              const isOwnMessage = message.sender === currentUserNumber;
              
              console.log('💬 MessageList: Message positioning debug:', {
                messageId: message.id,
                sender: message.sender,
                receiver: message.receiver,
                currentUserNumber: currentUserNumber,
                isOwnMessage: isOwnMessage,
                content: message.content.substring(0, 30) + '...',
                timestamp: message.timestamp,
                senderEqualsCurrentUser: message.sender === currentUserNumber,
                senderLength: message.sender?.length || 0,
                currentUserLength: currentUserNumber?.length || 0
              });

              return (
                <div
                  key={message.id}
                  className={`w-full flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 relative z-0`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
                    <MessageBubble
                      message={message}
                      isOwnMessage={isOwnMessage}
                      onEdit={(messageId, newText) => onStartEdit(messageId, newText)}
                      isEditing={editingMessageId === message.id}
                      editingText={editingText}
                      onEditingTextChange={setEditingText}
                      onSaveEdit={onEditMessage}
                      onCancelEdit={onCancelEdit}
                    />
                    
                    {/* Message timestamp */}
                    <div className={`text-xs text-gray-500 mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {message.edited && (
                        <span className="ml-1 italic text-gray-400">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};
