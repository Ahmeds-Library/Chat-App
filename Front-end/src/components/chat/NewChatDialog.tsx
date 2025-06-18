import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Send } from 'lucide-react';
import ApiService from '@/services/apiService';
import { Message, User } from '@/types/chat';

interface NewChatDialogProps {
  onNewChatCreated: (user: User, message: Message) => void;
  currentUserNumber: string;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({ 
  onNewChatCreated, 
  currentUserNumber 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const apiService = ApiService.getInstance();

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{11,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleStartChat = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (11-15 digits)",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('📤 Starting new chat with:', phoneNumber.trim());
      
      // Send message via backend
      const sentMessage = await apiService.sendMessage(phoneNumber.trim(), message.trim());
      
      console.log('📤 Message sent successfully:', sentMessage);

      // Ensure content is always a string before creating user
      const messageContent = typeof sentMessage.content === 'string' 
        ? sentMessage.content 
        : String(sentMessage.content);

      // Ensure sender is set to current user number
      const finalMessage: Message = {
        ...sentMessage,
        sender: currentUserNumber,
        receiver: phoneNumber.trim(),
        content: messageContent
      };

      // Create new user object for the contact list
      const newUser: User = {
        id: phoneNumber.trim(),
        username: phoneNumber.trim(),
        number: phoneNumber.trim(),
        lastMessage: messageContent,
        lastMessageTime: finalMessage.timestamp
      };

      // Reset form and close dialog
      setPhoneNumber('');
      setMessage('');
      setIsOpen(false);

      // Notify parent component with the final message
      onNewChatCreated(newUser, finalMessage);

      toast({
        title: "Chat Started",
        description: `Message sent to ${phoneNumber}`,
      });

    } catch (error: any) {
      console.error('❌ Failed to start new chat:', error);
      
      let errorMessage = 'Failed to start chat. Please try again.';
      if (error.status === 404) {
        errorMessage = 'Phone number not found. Please check the number.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication expired. Please login again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to Send Message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Enter a phone number and message to start a new conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter phone number (e.g., 03038196739)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={15}
              disabled={isSending}
            />
            <p className="text-xs text-muted-foreground">
              Enter 11-15 digit phone number
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              disabled={isSending}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleStartChat();
                }
              }}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartChat}
              disabled={isSending || !phoneNumber.trim() || !message.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Send & Start Chat
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
