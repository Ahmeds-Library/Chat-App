
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileUserListToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileUserListToggle: React.FC<MobileUserListToggleProps> = ({
  isOpen,
  onToggle
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="w-8 h-8 p-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 hover:scale-105 flex-shrink-0"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
    </Button>
  );
};
