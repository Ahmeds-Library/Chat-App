
import React, { useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '@/types/chat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import ApiClient from '@/services/apiClient';
import { gsap } from 'gsap';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const apiClient = ApiClient.getInstance();

  useEffect(() => {
    // Enhanced scroll to bottom with smooth animation
    if (messagesEndRef.current) {
      gsap.to(messagesEndRef.current.parentElement, {
        scrollTop: messagesEndRef.current.offsetTop,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [messages]);

  useEffect(() => {
    // Animate new messages with staggered entrance
    if (messagesContainerRef.current && messages.length > 0) {
      const messageElements = messagesContainerRef.current.querySelectorAll('.message-item:last-child');
      if (messageElements.length > 0) {
        gsap.fromTo(messageElements, 
          { 
            opacity: 0, 
            y: 20, 
            scale: 0.95 
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.2)",
            stagger: 0.1
          }
        );
      }
    }
  }, [messages.length]);

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

  const isOwnMessage = (message: Message): boolean => {
    const actualUserId = apiClient.getCurrentUserNumber();
    
    if (message.sender && actualUserId) {
      return message.sender.toString() === actualUserId.toString();
    }
    
    if (message.sender && currentUserNumber) {
      return message.sender.toString() === currentUserNumber.toString();
    }
    
    return false;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
            <Skeleton className={`h-14 rounded-2xl animate-shimmer ${i % 2 === 0 ? 'w-72 bg-blue-100' : 'w-64 bg-gray-100'}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4" ref={messagesContainerRef}>
      <div className="space-y-4 min-h-full">
        {Object.entries(messageGroups).map(([dateString, dayMessages], groupIndex) => (
          <div key={dateString} className="space-y-1 animate-fade-in" style={{ animationDelay: `${groupIndex * 0.05}s` }}>
            {/* Enhanced date separator */}
            <div className="flex justify-center my-8">
              <div className="bg-white/95 dark:bg-gray-700/95 backdrop-blur-xl px-6 py-3 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 shadow-xl border border-gray-200/60 dark:border-gray-600/60 hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>{formatDate(dateString)}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {dayMessages.map((message, messageIndex) => {
              const isOwn = isOwnMessage(message);
              
              return (
                <div
                  key={message.id}
                  className={`w-full flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 message-item`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isOwn ? 'mr-2' : 'ml-2'} transform hover:scale-[1.02] transition-all duration-200`}>
                    <MessageBubble
                      message={message}
                      isOwnMessage={isOwn}
                      onEdit={(messageId, newText) => onStartEdit(messageId, newText)}
                      isEditing={editingMessageId === message.id}
                      editingText={editingText}
                      onEditingTextChange={setEditingText}
                      onSaveEdit={onEditMessage}
                      onCancelEdit={onCancelEdit}
                    />
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
