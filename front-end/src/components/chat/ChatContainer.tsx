
import React, { useState, useRef } from 'react';
import { User, Message } from '@/types/chat';
import { UserList } from '@/components/chat/UserList';
import { EnhancedChatArea } from '@/components/chat/EnhancedChatArea';
import { WelcomeMessage } from '@/components/chat/WelcomeMessage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatList } from '@/hooks/useChatList';
import { gsap } from 'gsap';
import ApiClient from '@/services/apiClient';

interface ChatContainerProps {
  currentUserNumber: string;
  username: string;
  mobileMenuState?: {
    isOpen: boolean;
    toggleSidebar: () => void;
  };
  onUserSelected?: (user: User | null) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  currentUserNumber,
  username,
  mobileMenuState,
  onUserSelected
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [initialMessage, setInitialMessage] = useState<Message | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const apiClient = ApiClient.getInstance();
  
  // Get the actual user ID from JWT token for proper message filtering
  const actualCurrentUserId = apiClient.getCurrentUserNumber() || currentUserNumber;
  
  console.log('🔍 ChatContainer: User identification:', {
    providedUserNumber: currentUserNumber,
    actualUserId: actualCurrentUserId,
    username: username
  });
  
  // Pass actualCurrentUserId to useChatList for consistent user detection
  const { chatList, isLoading, updateChatItem, addNewChatItem } = useChatList({
    currentUserNumber: actualCurrentUserId
  });

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setShowWelcome(false);
    setInitialMessage(null);
    
    // Notify parent component about user selection
    onUserSelected?.(selectedUser);
    
    gsap.fromTo('.chat-transition', 
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );

    console.log('✅ Selected user:', selectedUser.username, selectedUser.number);
  };

  const handleMessageSent = (userNumber: string, message: Message) => {
    // Update chat list with new message
    updateChatItem(userNumber, message.content, message.timestamp);
    console.log('✅ Message sent, updated chat list');
  };

  const handleNewChatCreated = (newUser: User, message: Message) => {
    console.log('✅ Handling new chat creation:', {
      user: newUser,
      message: message
    });

    // Add or update the chat item
    const userWithMessage: User = {
      ...newUser,
      lastMessage: message.content,
      lastMessageTime: message.timestamp
    };
    
    addNewChatItem(userWithMessage);
    setInitialMessage(message);
    setSelectedUser(newUser);
    setShowWelcome(false);
    
    // Notify parent component about user selection
    onUserSelected?.(newUser);
    
    console.log('✅ New chat created with:', newUser.username, newUser.number);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setShowWelcome(true);
    onUserSelected?.(null);
  };

  return (
    <div ref={mainRef} className="flex h-full w-full overflow-hidden">
      <UserList
        users={chatList}
        selectedUser={selectedUser}
        onUserSelect={handleUserSelect}
        currentUserNumber={actualCurrentUserId}
        onNewChatCreated={handleNewChatCreated}
        isLoading={isLoading}
        mobileMenuState={mobileMenuState}
      />
      
      <div className="chat-transition flex-1 flex flex-col min-w-0 overflow-hidden">
        {showWelcome && !selectedUser ? (
          <div className="flex-1 overflow-hidden">
            <WelcomeMessage username={username} />
          </div>
        ) : (
          <EnhancedChatArea
            selectedUser={selectedUser}
            currentUserNumber={actualCurrentUserId}
            onMessageSent={handleMessageSent}
            initialMessage={initialMessage}
            onBack={isMobile ? handleBackToList : undefined}
            mobileMenuState={mobileMenuState}
          />
        )}
      </div>
    </div>
  );
};
