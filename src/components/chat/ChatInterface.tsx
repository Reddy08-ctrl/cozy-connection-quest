
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { getMessages, sendMessage } from '@/services/chatService';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  match: {
    id: string;
    name: string;
    avatar: string;
  };
  currentUserId: string;
}

const ChatInterface = ({ match, currentUserId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await getMessages(currentUserId, match.id);
        
        // Convert to the format this component uses
        const formattedMessages = fetchedMessages.map(msg => ({
          id: msg.id.toString(),
          senderId: msg.senderId,
          text: msg.content,
          timestamp: new Date(msg.createdAt)
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    if (currentUserId && match.id) {
      loadMessages();
    } else {
      // For demo purposes, show some initial messages
      const initialMessages: Message[] = [
        {
          id: '1',
          senderId: match.id,
          text: "Hi there! I saw we matched and wanted to say hello.",
          timestamp: new Date(Date.now() - 60000 * 30) // 30 minutes ago
        },
        {
          id: '2',
          senderId: currentUserId,
          text: "Hey! Nice to meet you. How's your day going?",
          timestamp: new Date(Date.now() - 60000 * 25) // 25 minutes ago
        },
        {
          id: '3',
          senderId: match.id,
          text: "It's going well! I just finished work and now relaxing. What about you?",
          timestamp: new Date(Date.now() - 60000 * 20) // 20 minutes ago
        },
      ];
      
      setMessages(initialMessages);
    }
  }, [match.id, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, tempMessage]);
    setNewMessage('');
    
    try {
      const sentMessage = await sendMessage(currentUserId, match.id, newMessage);
      
      if (sentMessage) {
        // Update the temporary message with the real one
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id 
              ? { 
                  id: sentMessage.id.toString(), 
                  senderId: sentMessage.senderId,
                  text: sentMessage.content,
                  timestamp: new Date(sentMessage.createdAt)
                }
              : msg
          )
        );
      }
      
      // For demo purposes, simulate a reply after a short delay
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: match.id,
          text: "That's interesting! Tell me more about it.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, reply]);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
      <div className="flex items-center space-x-4 p-4 border-b bg-white/50 backdrop-blur-md">
        <Avatar>
          <AvatarImage src={match.avatar} />
          <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg">{match.name}</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isUser = message.senderId === currentUserId;
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
                {!isUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={match.avatar} />
                    <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`px-4 py-2 rounded-2xl ${
                  isUser 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-secondary text-secondary-foreground rounded-tl-none'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t bg-white/50 backdrop-blur-md flex items-center space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
        />
        <Button type="submit" size="icon" disabled={newMessage.trim() === ''}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
