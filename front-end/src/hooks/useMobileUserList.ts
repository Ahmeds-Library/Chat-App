
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useMobileUserList = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const isMobile = useIsMobile();

  // Auto-close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const openSidebar = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setIsOpen
  };
};
