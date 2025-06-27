
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, Users, Send } from 'lucide-react';

interface WelcomeMessageProps {
  username: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ username }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && titleRef.current && subtitleRef.current && cardsRef.current) {
      const tl = gsap.timeline();
      
      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current], { opacity: 0, y: 30 });
      gsap.set(cardsRef.current.children, { opacity: 0, y: 20, scale: 0.9 });
      
      // Animate elements in sequence
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .to(cardsRef.current.children, { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.2, 
          ease: "back.out(1.7)" 
        }, "-=0.3");
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <h1 
          ref={titleRef}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          Welcome, {username}! 🎉
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-lg text-muted-foreground mb-8"
        >
          You're all set to start chatting! Choose a contact or start a new conversation.
        </p>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card border rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Find Friends</h3>
            <p className="text-xs text-muted-foreground mt-1">Search and add new contacts</p>
          </div>
          
          <div className="p-4 bg-card border rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
            <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Start Chatting</h3>
            <p className="text-xs text-muted-foreground mt-1">Send your first message</p>
          </div>
          
          <div className="p-4 bg-card border rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
            <Send className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Stay Connected</h3>
            <p className="text-xs text-muted-foreground mt-1">Real-time conversations</p>
          </div>
        </div>
      </div>
    </div>
  );
};
