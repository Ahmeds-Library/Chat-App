
import React from 'react';
import { User } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserListItemProps {
  user: User;
  isSelected: boolean;
  onSelect: (user: User) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isSelected,
  onSelect
}) => {
  return (
    <div
      onClick={() => onSelect(user)}
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/60 active:scale-[0.98]",
        isSelected && "bg-muted ring-2 ring-primary/20"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-foreground truncate">
            {user.username}
          </h3>
          {user.lastMessageTime && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {new Date(user.lastMessageTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground truncate mb-1">
          {user.number}
        </p>
        
        {user.lastMessage && (
          <p className="text-sm text-muted-foreground truncate">
            {user.lastMessage}
          </p>
        )}
      </div>
    </div>
  );
};
