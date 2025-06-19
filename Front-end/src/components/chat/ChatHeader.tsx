
import React from 'react';
import { User } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, Video } from 'lucide-react';

interface ChatHeaderProps {
  selectedUser: User;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedUser }) => {
  return (
    <div className="flex items-center justify-between p-4 pl-16 md:pl-4 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10 hover:scale-110 transition-transform duration-200">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {selectedUser?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-foreground">{selectedUser?.username}</h3>
          <p className="text-sm text-muted-foreground">{selectedUser?.number}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:scale-110 transition-transform duration-200 hidden sm:flex"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:scale-110 transition-transform duration-200 hidden sm:flex"
        >
          <Video className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:scale-110 transition-transform duration-200"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
