
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstructionTooltipProps {
  content: string;
  className?: string;
}

export const InstructionTooltip: React.FC<InstructionTooltipProps> = ({ 
  content, 
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate best position to prevent overflow
      let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

      // Check if tooltip fits above
      if (triggerRect.top - tooltipRect.height > 10) {
        bestPosition = 'top';
      }
      // Check if tooltip fits below
      else if (triggerRect.bottom + tooltipRect.height < viewportHeight - 10) {
        bestPosition = 'bottom';
      }
      // Check if tooltip fits on the right
      else if (triggerRect.right + tooltipRect.width < viewportWidth - 10) {
        bestPosition = 'right';
      }
      // Default to left
      else {
        bestPosition = 'left';
      }

      setPosition(bestPosition);
    }
  }, [isVisible]);

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 w-72 p-3 bg-popover border rounded-lg shadow-lg animate-fade-in";
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      default:
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover";
      case 'bottom':
        return "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-popover";
      case 'left':
        return "absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-popover";
      case 'right':
        return "absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-popover";
      default:
        return "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover";
    }
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        className={cn(
          "p-2 rounded-full bg-muted hover:bg-primary/10 transition-all duration-200 cursor-help",
          className
        )}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
      </div>
      
      {isVisible && (
        <div className={getTooltipClasses()} ref={tooltipRef}>
          <div className="text-sm text-popover-foreground whitespace-pre-line">
            {content}
          </div>
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
};
