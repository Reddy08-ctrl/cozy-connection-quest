
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Heart, Sparkles, Image as ImageIcon, Smile } from 'lucide-react';
import { getMessages, sendMessage } from '@/services/chatService';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface EnhancedChatInterfaceProps {
  match: {
    id: string;
    name: string;
    avatar: string;
  };
  currentUserId: string;
}

const messageAnimation = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.9 },
  transition: { type: 'spring', damping: 15, stiffness: 300 }
};

const bubbleVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

const heartAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: [0, 1.5, 1], opacity: 1 },
  transition: { duration: 0.5 }
};

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ match, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [typingEffect, setTypingEffect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

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
      
      // Simulate typing effect from match
      setTimeout(() => {
        setTypingEffect(true);
        
        // For demo purposes, simulate a reply after a short delay
        setTimeout(() => {
          setTypingEffect(false);
          
          const reply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: match.id,
            text: "That's interesting! I'd love to know more about it. Maybe we could meet up sometime?",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, reply]);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendHeartAnimation = () => {
    setShowLikeAnimation(true);
    
    const heartMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: "❤️",
      timestamp: new Date()
    };
    
    setMessages([...messages, heartMessage]);
    
    // Simulate heart response
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: match.id,
        text: "❤️",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, reply]);
    }, 1000);
    
    setTimeout(() => {
      setShowLikeAnimation(false);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
      <div className="flex items-center space-x-4 p-4 border-b bg-white/50 backdrop-blur-md">
        <Avatar className="ring-2 ring-primary ring-offset-2">
          <AvatarImage src={match.avatar} />
          <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg">{match.name}</h3>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
              Online
            </span>
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50/30 to-purple-50/30">
        {/* Message date separator */}
        <div className="text-center">
          <span className="px-2 py-1 bg-white/70 rounded-full text-xs text-gray-500 shadow-sm">
            Today
          </span>
        </div>
        
        <AnimatePresence>
          {messages.map((message, index) => {
            const isUser = message.senderId === currentUserId;
            const showAvatar = index === 0 || 
              messages[index - 1].senderId !== message.senderId;
            const isHeart = message.text === "❤️";
            
            return (
              <motion.div
                key={message.id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={messageAnimation}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
                  {!isUser && showAvatar ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={match.avatar} />
                      <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : !isUser ? <div className="w-8" /> : null}
                  
                  {isHeart ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                      className="text-3xl"
                    >
                      ❤️
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={bubbleVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className={`px-4 py-2 rounded-2xl ${
                        isUser 
                          ? 'bg-gradient-to-br from-primary to-purple-600 text-primary-foreground rounded-tr-none shadow-lg' 
                          : 'bg-white text-secondary-foreground rounded-tl-none shadow'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {typingEffect && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={match.avatar} />
                <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-none shadow">
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-2 h-2 bg-gray-300 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-gray-300 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-gray-300 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {showLikeAnimation && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={heartAnimation}
            transition={{ duration: 1 }}
          >
            <Heart className="h-20 w-20 fill-red-500 text-white opacity-70" />
          </motion.div>
        </div>
      )}
      
      <form onSubmit={handleSend} className="p-4 border-t bg-white/50 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-pink-100 hover:text-pink-500 transition-colors"
            onClick={sendHeartAnimation}
          >
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-blue-100 hover:text-blue-500 transition-colors"
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-green-100 hover:text-green-500 transition-colors"
            onClick={() => setIsImageUploading(!isImageUploading)}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <AnimatePresence>
              {isImageUploading && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="absolute bottom-full w-full mb-2 p-3 bg-white rounded-lg border shadow-md overflow-hidden"
                >
                  <div className="flex flex-col">
                    <p className="text-sm mb-2">Upload an image</p>
                    <input type="file" accept="image/*" className="text-xs" />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" variant="outline" onClick={() => setIsImageUploading(false)}>Cancel</Button>
                      <Button size="sm" className="ml-2">Upload</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-10 bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
            />
            
            <AnimatePresence>
              {newMessage.trim() && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full hover:bg-primary/20"
                  >
                    <Send className="h-4 w-4 text-primary" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!newMessage.trim() && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="rounded-full hover:bg-purple-100 hover:text-purple-500 transition-colors"
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EnhancedChatInterface;
