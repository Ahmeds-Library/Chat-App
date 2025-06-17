
import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/chat';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  selectedUser: User;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedUser }) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4 shadow-sm",
      isMobile && "pl-16"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-blue-200 dark:ring-blue-800">
            <AvatarImage src={selectedUser?.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
              {selectedUser?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedUser?.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser?.number}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
