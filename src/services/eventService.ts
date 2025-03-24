
import { query } from './database';
import { getUserProfile } from './userService';

export interface Event {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  createdAt: Date;
  creatorName: string;
}

export interface EventInvitation {
  id: number;
  eventId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  event: Event;
}

// Create a new event
export const createEvent = async (
  userId: number,
  eventData: Omit<Event, 'id' | 'creatorId' | 'createdAt' | 'creatorName'>
): Promise<Event | null> => {
  try {
    const { title, description, location, eventDate } = eventData;
    
    // Insert the new event
    const result = await query(
      `INSERT INTO events (creator_id, title, description, location, event_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, description, location, eventDate]
    );
    
    if (!result || !result.insertId) {
      throw new Error('Failed to create event');
    }
    
    // Get the user to include the creator name
    const userProfile = await getUserProfile(userId);
    
    // Return the created event
    return {
      id: result.insertId,
      creatorId: userId,
      title,
      description,
      location,
      eventDate,
      createdAt: new Date(),
      creatorName: userProfile?.name || 'Unknown'
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
      `SELECT e.*, u.name as creator_name
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
      eventDate: new Date(event.event_date),
      createdAt: new Date(event.created_at),
      creatorName: event.creator_name
    }));
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
};

// Get a single event by ID
export const getEventById = async (eventId: number): Promise<Event | null> => {
  try {
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
      eventDate: new Date(event.event_date),
      createdAt: new Date(event.created_at),
      creatorName: event.creator_name
    };
  } catch (error) {
    console.error('Error getting event:', error);
    return null;
  }
};

// Invite a user to an event
export const inviteUserToEvent = async (
  eventId: number,
  creatorId: number,
  invitedUserId: number
): Promise<boolean> => {
  try {
    // Verify the event exists and the creator is correct
    const events = await query(
      'SELECT * FROM events WHERE id = ? AND creator_id = ?',
      [eventId, creatorId]
    );
    
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Event not found or you are not the creator');
    }
    
    // Check if an invitation already exists
    const existingInvitations = await query(
      'SELECT * FROM event_invitations WHERE event_id = ? AND user_id = ?',
      [eventId, invitedUserId]
    );
    
    if (Array.isArray(existingInvitations) && existingInvitations.length > 0) {
      throw new Error('User has already been invited to this event');
    }
    
    // Create the invitation
    await query(
      'INSERT INTO event_invitations (event_id, user_id, status) VALUES (?, ?, ?)',
      [eventId, invitedUserId, 'pending']
    );
    
    return true;
  } catch (error) {
    console.error('Error inviting user to event:', error);
    return false;
  }
};

// Update invitation status
export const updateInvitationStatus = async (
  invitationId: number,
  userId: number,
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    // Verify the invitation exists and belongs to the user
    const invitations = await query(
      'SELECT * FROM event_invitations WHERE id = ? AND user_id = ?',
      [invitationId, userId]
    );
    
    if (!Array.isArray(invitations) || invitations.length === 0) {
      throw new Error('Invitation not found or does not belong to you');
    }
    
    // Update the status
    await query(
      'UPDATE event_invitations SET status = ? WHERE id = ?',
      [status, invitationId]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating invitation status:', error);
    return false;
  }
};

// Get user's event invitations
export const getUserInvitations = async (userId: number): Promise<EventInvitation[]> => {
  try {
    const invitations = await query(
      `SELECT i.*, e.*, u.name as creator_name
       FROM event_invitations i
       JOIN events e ON i.event_id = e.id
       JOIN users u ON e.creator_id = u.id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
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
      createdAt: new Date(invitation.created_at),
      event: {
        id: invitation.event_id,
        creatorId: invitation.creator_id,
        title: invitation.title,
        description: invitation.description,
        location: invitation.location,
        eventDate: new Date(invitation.event_date),
        createdAt: new Date(invitation.created_at),
        creatorName: invitation.creator_name
      }
    }));
  } catch (error) {
    console.error('Error getting user invitations:', error);
    return [];
  }
};
