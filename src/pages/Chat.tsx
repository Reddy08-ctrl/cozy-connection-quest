
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import EnhancedChatInterface from '@/components/chat/EnhancedChatInterface';
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
  }, [user, id]);
  
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="py-2 px-4 border-b flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/matches')}
            className="rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Button>
          
          {otherUser ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={otherUser.avatar || undefined} />
                <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h3 className="font-medium">{otherUser.name}</h3>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => navigate(`/memory-tree/${id}`)}
                >
                  View Memory Tree
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-pulse h-10 w-48 bg-muted rounded"></div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden p-0 relative">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <EnhancedChatInterface
              match={{
                id: otherUser?.id || '',
                name: otherUser?.name || '',
                avatar: otherUser?.avatar || ''
              }}
              currentUserId={user?.id || ""}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
