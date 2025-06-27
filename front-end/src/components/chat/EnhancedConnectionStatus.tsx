
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { ConnectionStatusInfo } from '@/services/websocket';
import { cn } from '@/lib/utils';

interface EnhancedConnectionStatusProps {
  connectionInfo: ConnectionStatusInfo;
  pendingMessageCount?: number;
  onReconnect?: () => void;
  onClearPending?: () => void;
  className?: string;
  showProgress?: boolean;
}

export const EnhancedConnectionStatus: React.FC<EnhancedConnectionStatusProps> = ({
  connectionInfo,
  pendingMessageCount = 0,
  onReconnect,
  onClearPending,
  className = '',
  showProgress = false
}) => {
  const [reconnectProgress, setReconnectProgress] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Simulate reconnection progress
  useEffect(() => {
    if (connectionInfo.status === 'reconnecting') {
      setIsReconnecting(true);
      setReconnectProgress(0);
      
      const interval = setInterval(() => {
        setReconnectProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setIsReconnecting(false);
      if (connectionInfo.status === 'connected') {
        setReconnectProgress(100);
        setTimeout(() => setReconnectProgress(0), 1000);
      }
    }
  }, [connectionInfo.status]);

  const getStatusConfig = () => {
    switch (connectionInfo.status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          text: 'Connected',
          variant: 'default' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          animate: false
        };
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting...',
          variant: 'secondary' as const,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          animate: true
        };
      case 'reconnecting':
        return {
          icon: RotateCcw,
          text: `Reconnecting... (${connectionInfo.reconnectAttempts || 0}/5)`,
          variant: 'secondary' as const,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          animate: true
        };
      case 'disconnected':
        return {
          icon: XCircle,
          text: 'Disconnected',
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          animate: false
        };
      default:
        return {
          icon: AlertTriangle,
          text: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          animate: false
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getDetailedTooltip = () => {
    let content = `Status: ${statusConfig.text}`;
    
    if (connectionInfo.lastConnected) {
      const timeAgo = Math.floor((Date.now() - connectionInfo.lastConnected.getTime()) / 1000);
      if (timeAgo < 60) {
        content += `\nLast connected: ${timeAgo}s ago`;
      } else if (timeAgo < 3600) {
        content += `\nLast connected: ${Math.floor(timeAgo / 60)}m ago`;
      } else {
        content += `\nLast connected: ${connectionInfo.lastConnected.toLocaleTimeString()}`;
      }
    }
    
    if (connectionInfo.error) {
      content += `\nError: ${connectionInfo.error}`;
    }
    
    if (pendingMessageCount > 0) {
      content += `\nPending messages: ${pendingMessageCount}`;
    }
    
    // Add reconnection tips for disconnected state
    if (connectionInfo.status === 'disconnected') {
      content += '\n\nTip: Click reconnect or check your internet connection';
    }
    
    return content;
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Main Status Badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200",
            statusConfig.bgColor,
            "hover:shadow-sm cursor-help"
          )}>
            <StatusIcon 
              className={cn(
                "h-3 w-3", 
                statusConfig.color,
                statusConfig.animate && "animate-spin"
              )} 
            />
            <span className={cn("text-xs font-medium", statusConfig.color)}>
              {statusConfig.text}
            </span>
            
            {/* Connection quality indicator */}
            {connectionInfo.status === 'connected' && (
              <div className="flex space-x-0.5">
                <div className="w-1 h-3 bg-green-500 rounded-full opacity-100"></div>
                <div className="w-1 h-3 bg-green-500 rounded-full opacity-75"></div>
                <div className="w-1 h-3 bg-green-500 rounded-full opacity-50"></div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="whitespace-pre-line text-sm">
            {getDetailedTooltip()}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Reconnection Progress Bar */}
      {showProgress && isReconnecting && (
        <div className="flex items-center space-x-2">
          <Progress value={reconnectProgress} className="w-16 h-2" />
          <span className="text-xs text-muted-foreground">
            {Math.round(reconnectProgress)}%
          </span>
        </div>
      )}

      {/* Pending Messages Counter */}
      {pendingMessageCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="flex items-center space-x-1 text-xs animate-pulse">
              <Clock className="h-3 w-3" />
              <span>{pendingMessageCount}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pendingMessageCount} message{pendingMessageCount !== 1 ? 's' : ''} queued for sending</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        {/* Reconnect Button */}
        {connectionInfo.status === 'disconnected' && onReconnect && (
          <Button
            size="sm"
            variant="outline"
            onClick={onReconnect}
            className="h-7 px-2 text-xs hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20"
            disabled={isReconnecting}
          >
            <RotateCcw className={cn("h-3 w-3 mr-1", isReconnecting && "animate-spin")} />
            Reconnect
          </Button>
        )}

        {/* Clear Queue Button */}
        {pendingMessageCount > 0 && onClearPending && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearPending}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Clear ({pendingMessageCount})
          </Button>
        )}

        {/* Connection Test Button - Only show when connected */}
        {connectionInfo.status === 'connected' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // This will be handled by the WebSocket test functionality
              console.log('🧪 Connection test triggered from UI');
            }}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Test
          </Button>
        )}
      </div>
    </div>
  );
};
