
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectionStatusInfo } from '@/services/websocket';
import { Wifi, WifiOff, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  connectionStatus: ConnectionStatusInfo;
  onReconnect?: () => void;
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  connectionStatus,
  onReconnect,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'connecting':
        return {
          icon: RotateCcw,
          text: 'Connecting...',
          variant: 'secondary' as const,
          color: 'text-blue-600'
        };
      case 'reconnecting':
        return {
          icon: RotateCcw,
          text: 'Reconnecting...',
          variant: 'secondary' as const,
          color: 'text-yellow-600'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
      default:
        return {
          icon: AlertTriangle,
          text: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-600'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
        <StatusIcon className={cn("h-3 w-3", statusConfig.color)} />
        <span>{statusConfig.text}</span>
      </Badge>
      
      {connectionStatus.status === 'disconnected' && onReconnect && (
        <Button
          size="sm"
          variant="outline"
          onClick={onReconnect}
          className="h-7 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reconnect
        </Button>
      )}
    </div>
  );
};
