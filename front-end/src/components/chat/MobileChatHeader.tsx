
import React, { useState } from 'react';
import { User } from '@/types/chat';
import { ConnectionStatus } from '@/types/connection';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MobileUserListToggle } from '@/components/chat/MobileUserListToggle';
import { EnhancedConnectionStatus } from '@/components/chat/EnhancedConnectionStatus';
import { MoreVertical, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from '@/hooks/use-toast';

interface MobileChatHeaderProps {
  selectedUser: User;
  connectionStatus?: ConnectionStatus;
  messageCount?: number;
  onBack?: () => void;
  mobileMenuState?: {
    isOpen: boolean;
    toggleSidebar: () => void;
  };
}

export const MobileChatHeader: React.FC<MobileChatHeaderProps> = ({ 
  selectedUser, 
  connectionStatus = 'disconnected',
  messageCount = 0,
  onBack,
  mobileMenuState
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get enhanced connection info and control functions
  const { 
    connectionInfo, 
    forceReconnect, 
    clearPendingMessages, 
    pendingMessageCount 
  } = useWebSocket({ autoConnect: false });

  const handleReconnect = () => {
    toast({
      title: "🔄 Reconnecting...",
      description: "Attempting to restore WebSocket connection",
      duration: 2000,
      variant: "default",
    });
    forceReconnect();
  };

  const handleClearPending = () => {
    toast({
      title: "🗑️ Messages Cleared",
      description: `${pendingMessageCount} pending messages cleared`,
      duration: 2000,
      variant: "default",
    });
    clearPendingMessages();
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Online',
          color: 'text-green-600 dark:text-green-400'
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          text: 'Connecting...',
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          text: 'Reconnecting...',
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Offline',
          color: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Unknown',
          color: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <div className="relative w-full">
      {/* Fixed Header Container */}
      <div className="border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        {/* Main Header */}
        <div className="flex items-center justify-between p-3">
          {/* Left Section */}
          <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
            {/* Menu Toggle Button */}
            {mobileMenuState && (
              <div className="flex-shrink-0">
                <MobileUserListToggle 
                  isOpen={mobileMenuState.isOpen} 
                  onToggle={mobileMenuState.toggleSidebar} 
                />
              </div>
            )}
            
            <Avatar className="w-10 h-10 ring-2 ring-green-200 dark:ring-green-700 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold">
                {selectedUser?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* User Name - Clean display */}
              <h3 className="font-semibold text-foreground">
                {selectedUser?.username}
              </h3>
              
              {/* Simple number display */}
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  {selectedUser?.number}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Actions - Only Three Dots */}
          <div className="flex items-center flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9"
              onClick={() => setShowDetails(!showDetails)}
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Fixed Expandable Details - Position Absolute */}
      <div className={cn(
        "absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/95 dark:bg-gray-700/95 backdrop-blur-xl z-50 border-b border-gray-200/50 dark:border-gray-600/50",
        showDetails ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-3 space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Number:</span> {selectedUser?.number}
          </div>
          
          {/* Connection Status in Mobile Dropdown */}
          <div className="border-t border-gray-200/50 dark:border-gray-600/50 pt-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connection Status
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <statusInfo.icon className={cn("w-4 h-4", statusInfo.color)} />
              <span className={cn("text-sm font-medium", statusInfo.color)}>
                {statusInfo.text}
              </span>
              {connectionStatus === 'connected' && (
                <span className="text-xs text-green-600 dark:text-green-400">• Live messaging active</span>
              )}
            </div>
            
            {/* Enhanced Connection Status Component */}
            <EnhancedConnectionStatus
              connectionInfo={connectionInfo}
              pendingMessageCount={pendingMessageCount}
              onReconnect={handleReconnect}
              onClearPending={handleClearPending}
              showProgress={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
