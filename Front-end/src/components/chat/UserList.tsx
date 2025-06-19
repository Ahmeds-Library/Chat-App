
import React, { useState } from 'react';
import { User, Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { UserSearchBar } from '@/components/chat/UserSearchBar';
import { UserListItem } from '@/components/chat/UserListItem';
import { MobileUserListToggle } from '@/components/chat/MobileUserListToggle';
import { useMobileUserList } from '@/hooks/useMobileUserList';

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  currentUserNumber: string;
  onNewChatCreated: (user: User, message: Message) => void;
  isLoading?: boolean;
}

export const UserList: React.FC<UserListProps> = ({ 
  users, 
  selectedUser, 
  onUserSelect, 
  currentUserNumber,
  onNewChatCreated,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, isMobile, toggleSidebar, closeSidebar } = useMobileUserList();

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.number.includes(searchQuery)
  );

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    if (isMobile) {
      closeSidebar();
    }
  };

  const UserListContent = () => (
    <>
      <div className="p-4 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Chats</h2>
          <NewChatDialog 
            onNewChatCreated={onNewChatCreated}
            currentUserNumber={currentUserNumber}
          />
        </div>
        
        <UserSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {searchQuery ? (
                <p>No contacts found for "{searchQuery}"</p>
              ) : (
                <p>No conversations yet</p>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id}
                onSelect={handleUserSelect}
              />
            ))
          )}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <MobileUserListToggle isOpen={isOpen} onToggle={toggleSidebar} />

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[50] md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-72 max-w-[80vw] bg-card border-r border-border z-[55] transform transition-all duration-300 ease-in-out md:hidden flex flex-col shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="pt-16 h-full flex flex-col">
            <UserListContent />
          </div>
        </div>
      </>
    );
  }

  // Desktop Layout
  return (
    <div className="w-80 lg:w-96 border-r border-border bg-card flex flex-col h-full">
      <UserListContent />
    </div>
  );
};
