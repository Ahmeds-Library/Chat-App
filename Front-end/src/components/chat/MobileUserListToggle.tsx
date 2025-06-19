
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
      className="fixed top-4 left-4 z-[60] md:hidden bg-card/95 backdrop-blur-sm border shadow-lg hover:bg-card/80 transition-all duration-200 hover:scale-105"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </Button>
  );
};
