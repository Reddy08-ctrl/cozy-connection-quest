
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, HeartOff, Star } from 'lucide-react';

export interface MatchCardProps {
  match: {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    avatar: string;
    compatibility: number;
    interests: string[];
  };
  onAccept?: () => Promise<boolean>;
  onReject?: () => Promise<boolean>;
  isFavorite?: boolean;
  onToggleFavorite?: () => Promise<boolean>;
}

export const MatchCard = ({ 
  match, 
  onAccept, 
  onReject, 
  isFavorite,
  onToggleFavorite 
}: MatchCardProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-sm mx-auto overflow-hidden"
    >
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img
            src={match.avatar}
            alt={match.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/30 backdrop-blur-md rounded-full px-3 py-1.5">
            <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-amber-400'}`} />
            <span className="text-sm font-medium">{match.compatibility}% Match</span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">{match.name}, {match.age}</h3>
              <span className="text-sm text-muted-foreground">{match.location}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{match.bio}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {match.interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {interest}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full flex-1 bg-white/20 border-white/30 hover:bg-destructive/20 hover:text-destructive"
              onClick={onReject}
            >
              <HeartOff className="h-5 w-5" />
              <span className="sr-only">Decline</span>
            </Button>
            
            <Button 
              onClick={() => navigate(`/chat/${match.id}`)}
              size="icon" 
              variant="outline" 
              className="rounded-full flex-1 bg-white/20 border-white/30 hover:bg-primary/20 hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Message</span>
            </Button>
            
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full flex-1 bg-white/20 border-white/30 hover:bg-primary/20 hover:text-primary"
              onClick={onAccept}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="sr-only">Like</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
