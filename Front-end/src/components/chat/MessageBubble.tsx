
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X, Clock, CheckCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/chat';
import { gsap } from 'gsap';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onEdit?: (messageId: string, newText: string) => void;
  isEditing?: boolean;
  editingText?: string;
  onEditingTextChange?: (text: string) => void;
  onSaveEdit?: (messageId: string, newText: string) => void;
  onCancelEdit?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onEdit,
  isEditing,
  editingText,
  onEditingTextChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (bubbleRef.current) {
      // WhatsApp-style entrance animation
      gsap.fromTo(bubbleRef.current, 
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.2)" }
      );
    }
  }, []);

  const getStatusIcon = () => {
    if (!message.status || !isOwnMessage) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSaveEdit = () => {
    if (editingText && onSaveEdit) {
      onSaveEdit(message.id, editingText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape' && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div 
      className={`group relative ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={bubbleRef}
        className={`
          relative px-3 py-2 rounded-2xl shadow-sm transition-all duration-200 max-w-xs sm:max-w-sm md:max-w-md
          ${isOwnMessage 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-blue-200/50 dark:shadow-blue-900/30' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-600/50 rounded-bl-md shadow-gray-200/50 dark:shadow-gray-800/30'
          }
          ${message.status === 'failed' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : ''}
          hover:shadow-lg transition-shadow duration-200
        `}
      >
        {/* Message content */}
        {isEditing ? (
          <div className="space-y-2">
            <Input
              ref={editInputRef}
              value={editingText}
              onChange={(e) => onEditingTextChange?.(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`${isOwnMessage 
                ? 'bg-white/20 border-white/30 text-white placeholder-white/70' 
                : 'bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
              }`}
              placeholder="Edit message..."
            />
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveEdit}
                className={`h-6 px-2 ${isOwnMessage 
                  ? 'text-white/80 hover:text-white hover:bg-white/20' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                }`}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                className={`h-6 px-2 ${isOwnMessage 
                  ? 'text-white/80 hover:text-white hover:bg-white/20' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                }`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
            
            {/* WhatsApp-style message footer */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="text-xs font-light">{formatTime(message.timestamp)}</span>
              {message.edited && (
                <span className="text-xs opacity-70 italic">edited</span>
              )}
              {getStatusIcon()}
            </div>
          </>
        )}

        {/* WhatsApp-style edit button */}
        {isOwnMessage && !isEditing && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(message.id, message.content)}
            className={`
              absolute -top-8 right-0 h-7 w-7 p-0 
              ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} 
              transition-all duration-200
              bg-white/90 hover:bg-white dark:bg-gray-700/90 dark:hover:bg-gray-600
              text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white
              rounded-full shadow-lg border border-gray-200 dark:border-gray-600
            `}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        )}

        {/* WhatsApp-style message tail */}
        <div 
          className={`
            absolute top-3 w-0 h-0
            ${isOwnMessage 
              ? 'right-0 translate-x-full border-l-8 border-l-blue-500 border-t-8 border-t-transparent border-b-8 border-b-transparent' 
              : 'left-0 -translate-x-full border-r-8 border-r-white dark:border-r-gray-700 border-t-8 border-t-transparent border-b-8 border-b-transparent'
            }
          `}
        />
      </div>
    </div>
  );
};
