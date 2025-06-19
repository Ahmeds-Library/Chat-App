
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useMobileUserList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
    setIsOpen
  };
};
