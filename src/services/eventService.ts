
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile, User } from './userService';

export interface Event {
  id: string;
  creatorId: string;
  creator?: User;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  createdAt: Date;
  attendees?: User[];
}

export interface EventInvitation {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user?: User;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

// Create a new event
export const createEvent = async (
  creatorId: string,
  title: string,
  description: string,
  location: string,
  eventDate: Date
): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        creator_id: creatorId,
        title,
        description,
        location,
        event_date: eventDate.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return null;
    }
    
    return {
      id: data.id,
      creatorId: data.creator_id,
      title: data.title,
      description: data.description,
      location: data.location,
      eventDate: new Date(data.event_date),
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

// Get events created by a user
export const getUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('creator_id', userId)
      .order('event_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
    
    return (data || []).map(event => ({
      id: event.id,
      creatorId: event.creator_id,
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: new Date(event.event_date),
      createdAt: new Date(event.created_at)
    }));
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
};

// Get events a user is invited to
export const getInvitedEvents = async (userId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('event_invitations')
      .select(`
        *,
        events(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error fetching invited events:', error);
      return [];
    }
    
    return (data || []).map(invitation => {
      const event = invitation.events;
      return {
        id: event.id,
        creatorId: event.creator_id,
        title: event.title,
        description: event.description,
        location: event.location,
        eventDate: new Date(event.event_date),
        createdAt: new Date(event.created_at)
      };
    });
  } catch (error) {
    console.error('Error getting invited events:', error);
    return [];
  }
};

// Invite a user to an event
export const inviteUserToEvent = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('event_invitations')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error inviting user to event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inviting user to event:', error);
    return false;
  }
};

// Respond to an event invitation
export const respondToInvitation = async (
  invitationId: string,
  status: 'accepted' | 'declined'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('event_invitations')
      .update({ status })
      .eq('id', invitationId);
    
    if (error) {
      console.error('Error responding to invitation:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return false;
  }
};

// Get pending invitations for a user
export const getPendingInvitations = async (userId: string): Promise<EventInvitation[]> => {
  try {
    const { data, error } = await supabase
      .from('event_invitations')
      .select(`
        *,
        events(*),
        profiles!event_invitations_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error fetching pending invitations:', error);
      return [];
    }
    
    return (data || []).map(invitation => {
      const event = invitation.events;
      return {
        id: invitation.id,
        eventId: invitation.event_id,
        userId: invitation.user_id,
        status: invitation.status,
        createdAt: new Date(invitation.created_at),
        event: {
          id: event.id,
          creatorId: event.creator_id,
          title: event.title,
          description: event.description,
          location: event.location,
          eventDate: new Date(event.event_date),
          createdAt: new Date(event.created_at)
        }
      };
    });
  } catch (error) {
    console.error('Error getting pending invitations:', error);
    return [];
  }
};
