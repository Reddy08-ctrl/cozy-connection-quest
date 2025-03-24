
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProfileForm = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [date, setDate] = React.useState<Date | undefined>();
  
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple preview for demo purposes
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes
    toast.success('Profile saved successfully');
    navigate('/questionnaire');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-serif font-semibold tracking-tight">Create Your Profile</h1>
        <p className="text-muted-foreground mt-2">Tell us about yourself to find better matches</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatar || ''} />
            <AvatarFallback className="bg-secondary text-lg">{name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          
          <div>
            <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary hover:text-primary/80 transition-colors">
              Upload Photo
            </Label>
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={setGender}>
              <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dob"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border-white/30",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">About Me</Label>
          <Textarea
            id="bio"
            placeholder="Share something about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="resize-none bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
          />
        </div>

        <Button type="submit" className="w-full">Continue</Button>
      </form>
    </motion.div>
  );
};

export default ProfileForm;
