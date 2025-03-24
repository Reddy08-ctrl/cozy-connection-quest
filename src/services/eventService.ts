
import { query } from './database';

export interface Event {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  createdAt: Date;
  creatorName?: string;
  attendees?: number;
}

export interface EventInvitation {
  id: number;
  eventId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  event?: Event;
  userName?: string;
}

// Create a new event
export const createEvent = async (
  creatorId: number,
  title: string,
  description: string,
  location: string,
  eventDate: Date
): Promise<Event | null> => {
  try {
    const result = await query(
      `INSERT INTO events (creator_id, title, description, location, event_date)
       VALUES (?, ?, ?, ?, ?)`,
      [creatorId, title, description, location, eventDate]
    );
    
    const eventId = result.insertId;
    
    const events = await query(
      `SELECT e.*, u.name as creator_name
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.id = ?`,
      [eventId]
    );
    
    if (!Array.isArray(events) || events.length === 0) {
      return null;
    }
    
    const event = events[0];
    
    return {
      id: event.id,
      creatorId: event.creator_id,
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.event_date,
      createdAt: event.created_at,
      creatorName: event.creator_name
    };
    
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

// Get events created by a user
export const getUserEvents = async (userId: number): Promise<Event[]> => {
  try {
    const events = await query(
      `SELECT e.*, u.name as creator_name,
              (SELECT COUNT(*) FROM event_invitations WHERE event_id = e.id AND status = 'accepted') as attendees
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.creator_id = ?
       ORDER BY e.event_date DESC`,
      [userId]
    );
    
    if (!Array.isArray(events)) {
      return [];
    }
    
    return events.map(event => ({
      id: event.id,
      creatorId: event.creator_id,
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.event_date,
      createdAt: event.created_at,
      creatorName: event.creator_name,
      attendees: event.attendees
    }));
    
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
};

// Get upcoming events (events a user is invited to)
export const getUpcomingEvents = async (userId: number): Promise<Event[]> => {
  try {
    const events = await query(
      `SELECT e.*, u.name as creator_name,
              (SELECT COUNT(*) FROM event_invitations WHERE event_id = e.id AND status = 'accepted') as attendees
       FROM events e
       JOIN users u ON e.creator_id = u.id
       JOIN event_invitations ei ON e.id = ei.event_id
       WHERE ei.user_id = ? AND e.event_date > NOW()
       ORDER BY e.event_date ASC`,
      [userId]
    );
    
    if (!Array.isArray(events)) {
      return [];
    }
    
    return events.map(event => ({
      id: event.id,
      creatorId: event.creator_id,
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.event_date,
      createdAt: event.created_at,
      creatorName: event.creator_name,
      attendees: event.attendees
    }));
    
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    return [];
  }
};

// Invite a user to an event
export const inviteToEvent = async (
  eventId: number,
  userId: number
): Promise<boolean> => {
  try {
    // Check if invitation already exists
    const existingInvitations = await query(
      'SELECT * FROM event_invitations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    
    if (Array.isArray(existingInvitations) && existingInvitations.length > 0) {
      // Update existing invitation if it was rejected
      if (existingInvitations[0].status === 'rejected') {
        await query(
          'UPDATE event_invitations SET status = ? WHERE id = ?',
          ['pending', existingInvitations[0].id]
        );
      }
    } else {
      // Create new invitation
      await query(
        'INSERT INTO event_invitations (event_id, user_id) VALUES (?, ?)',
        [eventId, userId]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error inviting to event:', error);
    return false;
  }
};

// Respond to an event invitation
export const respondToInvitation = async (
  invitationId: number,
  userId: number,
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    // Verify the invitation belongs to this user
    const invitations = await query(
      'SELECT * FROM event_invitations WHERE id = ? AND user_id = ?',
      [invitationId, userId]
    );
    
    if (!Array.isArray(invitations) || invitations.length === 0) {
      throw new Error('Invitation not found');
    }
    
    // Update invitation status
    await query(
      'UPDATE event_invitations SET status = ? WHERE id = ?',
      [status, invitationId]
    );
    
    return true;
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return false;
  }
};

// Get event invitations for a user
export const getUserInvitations = async (userId: number): Promise<EventInvitation[]> => {
  try {
    const invitations = await query(
      `SELECT ei.*, e.title, e.description, e.location, e.event_date, 
              u.name as creator_name
       FROM event_invitations ei
       JOIN events e ON ei.event_id = e.id
       JOIN users u ON e.creator_id = u.id
       WHERE ei.user_id = ? AND ei.status = 'pending'
       ORDER BY e.event_date ASC`,
      [userId]
    );
    
    if (!Array.isArray(invitations)) {
      return [];
    }
    
    return invitations.map(invitation => ({
      id: invitation.id,
      eventId: invitation.event_id,
      userId: invitation.user_id,
      status: invitation.status,
      createdAt: invitation.created_at,
      event: {
        id: invitation.event_id,
        creatorId: invitation.creator_id,
        title: invitation.title,
        description: invitation.description,
        location: invitation.location,
        eventDate: invitation.event_date,
        creatorName: invitation.creator_name
      }
    }));
    
  } catch (error) {
    console.error('Error getting user invitations:', error);
    return [];
  }
};

// Get event attendees
export const getEventAttendees = async (eventId: number): Promise<any[]> => {
  try {
    const attendees = await query(
      `SELECT u.id, u.name, u.avatar
       FROM event_invitations ei
       JOIN users u ON ei.user_id = u.id
       WHERE ei.event_id = ? AND ei.status = 'accepted'`,
      [eventId]
    );
    
    return Array.isArray(attendees) ? attendees : [];
  } catch (error) {
    console.error('Error getting event attendees:', error);
    return [];
  }
};

// Suggest matches to invite to an event (AI-powered)
export const suggestInvitees = async (
  userId: number,
  eventId: number
): Promise<any[]> => {
  try {
    // Get the event details to contextualize the suggestions
    const events = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Event not found');
    }
    
    const event = events[0];
    
    // Get user's matches
    const matches = await query(
      `SELECT m.*, 
              u.id as match_id, 
              u.name as match_name, 
              u.avatar as match_avatar,
              u.bio as match_bio
       FROM matches m
       JOIN users u ON (m.user_id_1 = ? AND m.user_id_2 = u.id) OR (m.user_id_2 = ? AND m.user_id_1 = u.id)
       WHERE m.status = 'accepted'`,
      [userId, userId]
    );
    
    if (!Array.isArray(matches) || matches.length === 0) {
      return [];
    }
    
    // Simple AI suggestion based on event title and match profiles
    // In a real app, this would use more sophisticated AI
    const suggestions = [];
    
    for (const match of matches) {
      // Check if already invited
      const invited = await query(
        'SELECT * FROM event_invitations WHERE event_id = ? AND user_id = ?',
        [eventId, match.match_id]
      );
      
      if (Array.isArray(invited) && invited.length > 0) {
        continue; // Skip if already invited
      }
      
      // Calculate a suggestion score
      let score = match.match_score * 0.7; // Base on match score
      
      // Add contextual factors
      if (event.title.toLowerCase().includes('dinner') && match.match_bio?.toLowerCase().includes('food')) {
        score += 0.2;
      }
      
      if (event.title.toLowerCase().includes('movie') && match.match_bio?.toLowerCase().includes('film')) {
        score += 0.2;
      }
      
      // Only suggest if score is above threshold
      if (score > 0.5) {
        suggestions.push({
          id: match.match_id,
          name: match.match_name,
          avatar: match.match_avatar,
          bio: match.match_bio,
          score
        });
      }
    }
    
    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.score - a.score);
    
  } catch (error) {
    console.error('Error suggesting invitees:', error);
    return [];
  }
};
