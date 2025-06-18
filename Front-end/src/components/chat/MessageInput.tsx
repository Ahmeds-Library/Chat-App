
import React, { useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  isSending
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4 z-10">
      <div className="flex items-center space-x-2 max-w-full">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-full transition-all duration-200"
          />
        </div>
        
        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || isSending}
          data-send-button
          className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
