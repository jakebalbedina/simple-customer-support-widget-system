import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config/environment';
import { supabase } from '../config/supabase';

const API_BASE_URL = `${supabaseUrl}/functions/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`,
  },
});

// Ticket API endpoints
export const ticketAPI = {
  // Create a new ticket
  createTicket: async (data: {
    customer_name?: string;
    customer_email?: string;
    subject: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    session_id: string;
  }) => {
    const response = await apiClient.post('/create-ticket', data);
    return response.data;
  },

  // Add message to ticket
  addMessage: async (data: {
    ticket_id: string;
    sender_id: string;
    sender_type: 'customer' | 'admin';
    content: string;
  }) => {
    const response = await apiClient.post('/add-message', data);
    return response.data;
  },

  // Update ticket status (admin only)
  updateTicketStatus: async (data: {
    ticket_id: string;
    status: 'pending' | 'resolved' | 'closed';
    admin_id: string;
  }) => {
    const response = await apiClient.post('/update-ticket-status', data);
    return response.data;
  },

  // Get signed URL for file operations
  getSignedUrl: async (data: {
    action: 'upload' | 'download';
    file_name: string;
    file_type: string;
    message_id?: string;
  }) => {
    const response = await apiClient.post('/get-signed-url', data);
    return response.data;
  },

  // Create attachment record in database
  createAttachment: async (data: {
    message_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
  }) => {
    const { data: attachment, error } = await supabase
      .from('attachments')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return attachment;
  },
};

// Export error handler
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred';
};
