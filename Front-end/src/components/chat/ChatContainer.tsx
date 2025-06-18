
import React, { useState, useRef } from 'react';
import { User, Message } from '@/types/chat';
import { UserList } from '@/components/chat/UserList';
import { EnhancedChatArea } from '@/components/chat/EnhancedChatArea';
import { WelcomeMessage } from '@/components/chat/WelcomeMessage';
import { useIsMobile } from '@/hooks/use-mobile';
import { gsap } from 'gsap';

interface ChatContainerProps {
  currentUserNumber: string;
  username: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  currentUserNumber,
  username
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [initialMessage, setInitialMessage] = useState<Message | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setShowWelcome(false);
    setInitialMessage(null);
    
    gsap.fromTo('.chat-transition', 
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );

    console.log('✅ Selected user:', selectedUser.username, selectedUser.number);
  };

  const handleMessageSent = (userNumber: string, message: Message) => {
    // Update user list - no local storage, just in-memory
    setUsers(prev => {
      const existingUserIndex = prev.findIndex(u => u.number === userNumber);
      if (existingUserIndex >= 0) {
        const updatedUsers = [...prev];
        updatedUsers[existingUserIndex] = {
          ...updatedUsers[existingUserIndex],
          lastMessage: message.content,
          lastMessageTime: message.timestamp
        };
        // Move to top
        const [updatedUser] = updatedUsers.splice(existingUserIndex, 1);
        return [updatedUser, ...updatedUsers];
      }
      return prev;
    });
    
    console.log('✅ Message sent, updated user list in memory');
  };

  const handleNewChatCreated = (newUser: User, message: Message) => {
    console.log('✅ Handling new chat creation:', {
      user: newUser,
      message: message
    });

    setUsers(prev => {
      const existingUserIndex = prev.findIndex(u => u.number === newUser.number);
      if (existingUserIndex >= 0) {
        const updatedUsers = [...prev];
        updatedUsers[existingUserIndex] = { ...updatedUsers[existingUserIndex], ...newUser };
        const [updatedUser] = updatedUsers.splice(existingUserIndex, 1);
        return [updatedUser, ...updatedUsers];
      } else {
        return [newUser, ...prev];
      }
    });

    setInitialMessage(message);
    setSelectedUser(newUser);
    setShowWelcome(false);
    
    console.log('✅ New chat created with:', newUser.username, newUser.number);
  };

  return (
    <div ref={mainRef} className="flex-1 flex overflow-hidden min-h-0">
      <UserList
        users={users}
        selectedUser={selectedUser}
        onUserSelect={handleUserSelect}
        currentUserNumber={currentUserNumber}
        onNewChatCreated={handleNewChatCreated}
      />
      
      <div className="chat-transition flex-1 flex flex-col min-w-0 overflow-hidden">
        {showWelcome && !selectedUser ? (
          <div className="flex-1 overflow-hidden">
            <WelcomeMessage username={username} />
          </div>
        ) : (
          <EnhancedChatArea
            selectedUser={selectedUser}
            currentUserNumber={currentUserNumber}
            onMessageSent={handleMessageSent}
            initialMessage={initialMessage}
          />
        )}
      </div>
    </div>
  );
};
