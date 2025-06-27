
import React from 'react';
import { Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const EmptyState: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
      isMobile && "ml-0"
    )}>
      <div className="text-center space-y-4 animate-fade-in px-4">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse-glow">
          <Send className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Select a conversation
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Choose a contact from the sidebar to start chatting and see your conversation history.
        </p>
      </div>
    </div>
  );
};
