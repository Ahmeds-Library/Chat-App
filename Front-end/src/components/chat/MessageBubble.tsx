
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
      // Hover animations
      const bubble = bubbleRef.current;
      
      const handleMouseEnter = () => {
        gsap.to(bubble, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out"
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(bubble, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      };

      bubble.addEventListener('mouseenter', handleMouseEnter);
      bubble.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        bubble.removeEventListener('mouseenter', handleMouseEnter);
        bubble.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  const getStatusIcon = () => {
    if (!message.status) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
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
      className={`group relative max-w-xs md:max-w-md lg:max-w-lg ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={bubbleRef}
        className={`
          relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200
          ${isOwnMessage 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md' 
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
          }
          ${message.status === 'failed' ? 'border-red-300 dark:border-red-700' : ''}
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
              className="bg-white/20 border-white/30 text-white placeholder-white/70"
              placeholder="Edit message..."
            />
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveEdit}
                className="h-6 px-2 text-white/80 hover:text-white hover:bg-white/20"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                className="h-6 px-2 text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
            
            {/* Message footer */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
              <span className="text-xs">{formatTime(message.timestamp)}</span>
              {message.edited && (
                <span className="text-xs opacity-70">edited</span>
              )}
              {isOwnMessage && getStatusIcon()}
            </div>
          </>
        )}

        {/* Edit button */}
        {isOwnMessage && !isEditing && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(message.id, message.content)}
            className={`
              absolute -top-8 right-0 h-6 w-6 p-0 
              ${isHovered ? 'opacity-100' : 'opacity-0'} 
              transition-opacity duration-200
              bg-white/10 hover:bg-white/20 text-white/80 hover:text-white
              rounded-full
            `}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        )}

        {/* Message bubble tail */}
        <div 
          className={`
            absolute top-3 w-0 h-0
            ${isOwnMessage 
              ? 'right-0 translate-x-full border-l-8 border-l-purple-500 border-t-8 border-t-transparent border-b-8 border-b-transparent' 
              : 'left-0 -translate-x-full border-r-8 border-r-white dark:border-r-gray-800 border-t-8 border-t-transparent border-b-8 border-b-transparent'
            }
          `}
        />
      </div>
    </div>
  );
};
