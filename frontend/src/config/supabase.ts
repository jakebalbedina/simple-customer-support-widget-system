import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './environment';

console.log('Initializing Supabase with URL:', supabaseUrl);

// Create client with proper global headers
const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  },
});

// Override the fetch to ensure headers are always sent
const originalFetch = supabaseClient.fetch;
supabaseClient.fetch = async (url, options = {}) => {
  const headers = {
    ...((options as any).headers || {}),
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };
  
  return originalFetch.call(supabaseClient, url, {
    ...options,
    headers,
  });
};

export const supabase = supabaseClient;

// Export variables for REST API calls
export { supabaseUrl, supabaseKey };

// Helper function to get or create a session
export const getOrCreateSession = async (): Promise<string> => {
  let sessionId = localStorage.getItem('support_widget_session');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('support_widget_session', sessionId);
  }
  
  return sessionId;
};

// Helper to subscribe to realtime updates
export const subscribeToTicketUpdates = (ticketId: string, callback: (message: any) => void) => {
  const subscription = supabase
    .channel(`ticket:${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Helper to subscribe to ticket status changes
export const subscribeToTicketStatusUpdates = (ticketId: string, callback: (ticket: any) => void) => {
  const subscription = supabase
    .channel(`ticket_status:${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};
