
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { InstructionTooltip } from '@/components/ui/instruction-tooltip';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { gsap } from 'gsap';

const Chat = () => {
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLHeadElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current && mainRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(headerRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      )
      .fromTo(mainRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, []);

  const handleLogout = () => {
    gsap.to('.chat-container', {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => logout()
    });
  };

  const instructionContent = `Welcome to Enhanced ChatApp! Here's how to use it:

1. **Select a Contact**: Click on any contact in the left sidebar to start chatting with them.

2. **Send Messages**: Type your message in the input field at the bottom and press Enter or click the send button.

3. **Auto-Conversations**: When you message someone new, they'll automatically appear in your contact list at the top.

4. **Edit Messages**: Hover over your own messages to see the edit button (pencil icon).

5. **Message Status**: See when your messages are sent, delivered, or failed to send.

6. **Real-time Updates**: Your conversations are saved automatically and the latest conversations appear at the top.

7. **Search Contacts**: Use the search bar at the top of the contacts list to find specific conversations.

8. **Theme Toggle**: Switch between light and dark modes using the theme toggle in the header.

9. **Mobile Navigation**: On mobile, use the menu button to toggle the contacts sidebar.

10. **WhatsApp-like Experience**: Messages are grouped by date, conversations auto-sort by recent activity, and the interface follows familiar messaging patterns.

Start chatting with your contacts! 💬✨`;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 flex flex-col chat-container transition-all duration-500 overflow-hidden">
      {/* Header */}
      <header ref={headerRef} className="border-b border-border/50 bg-card/90 backdrop-blur-xl z-[70] shadow-lg flex-shrink-0 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg">
              <div className="w-7 h-7 bg-white rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                ChatApp
              </h1>
              <p className="text-sm text-muted-foreground animate-fade-in">
                Welcome, <span className="font-medium text-foreground">{user?.username}</span>! 
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <InstructionTooltip 
              content={instructionContent}
              className="mr-2"
            />
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main 
        ref={mainRef} 
        className="flex-1 flex overflow-hidden min-h-0 relative w-full"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        <ChatContainer
          currentUserNumber={user?.number || ''}
          username={user?.username || 'User'}
        />
      </main>
    </div>
  );
};

export default Chat;
