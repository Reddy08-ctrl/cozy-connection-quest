import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/hooks/use-auth';
import { getMessages, sendMessage, Message } from '@/services/chatService';
import { getUserProfile, User } from '@/services/userService';

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoScroll = useRef(true);
  
  useEffect(() => {
    const loadChat = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        
        // Load the other user's profile
        const profile = await getUserProfile(id);
        setOtherUser(profile);
        
        // Load messages
        const chatMessages = await getMessages(user.id, id);
        setMessages(chatMessages);
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadChat();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      if (user && id) {
        getMessages(user.id, id).then(newMessages => {
          if (newMessages.length > messages.length) {
            setMessages(newMessages);
            if (autoScroll.current) {
              scrollToBottom();
            }
          }
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, id, messages.length]);
  
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading]);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id || !newMessage.trim()) return;
    
    try {
      const message = await sendMessage(user.id, id, newMessage.trim());
      
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        autoScroll.current = true;
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="py-2 px-4 border-b flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/matches')}
            className="rounded-full"
          >
            <ArrowLeft size={18} />
          </Button>
          
          {otherUser ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={otherUser.avatar || undefined} />
                <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{otherUser.name}</h3>
              </div>
            </div>
          ) : (
            <div className="animate-pulse h-10 w-48 bg-muted rounded"></div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <ChatInterface
              messageList={messages}
              currentUserId={user?.id || ""}
            />
          )}
          <div ref={chatEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Chat;
