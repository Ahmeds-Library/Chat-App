
import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { gsap } from 'gsap';

interface TypingIndicatorProps {
  username: string;
  avatar?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username, avatar }) => {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate container entrance
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 10, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }

    // Animate typing dots
    const timeline = gsap.timeline({ repeat: -1 });
    
    dotsRef.current.forEach((dot, index) => {
      if (dot) {
        timeline.to(dot, {
          scale: 1.2,
          opacity: 0.7,
          duration: 0.4,
          ease: "power2.inOut"
        }, index * 0.15);
        
        timeline.to(dot, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut"
        }, index * 0.15 + 0.2);
      }
    });

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex items-center space-x-3 animate-fade-in"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            {username} is typing
          </span>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              ref={(el) => dotsRef.current[index] = el}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
