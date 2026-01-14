import { supabase, supabaseUrl, supabaseKey } from '@/config/supabase';

// Helper to make direct REST API calls with proper headers
const restAPICall = async (endpoint: string, query: string = '') => {
  const url = `${supabaseUrl}/rest/v1/${endpoint}${query ? '?' + query : ''}`;
  console.log('REST API Call:', url);
  
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error('REST API error:', response.status, text);
    throw new Error(`REST API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`REST API response for ${endpoint}:`, data);
  return data;
};

// Fetch tickets for a customer
export const fetchCustomerTickets = async (customerId: string) => {
  return restAPICall(
    'tickets',
    `select=id,subject,status,priority,created_at,updated_at,resolved_at,messages(id,content,sender_type,sender_id,created_at,attachments(id,file_name,file_type,file_size,storage_path))&customer_id=eq.${customerId}&order=created_at.desc`
  );
};

// Fetch all tickets (admin)
export const fetchAllTickets = async (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}) => {
  let query = `select=id,subject,status,priority,created_at,updated_at,resolved_at,customers(id,name,email),messages(id)&order=created_at.desc`;
  
  if (filters?.status) {
    query += `&status=eq.${filters.status}`;
  }
  
  if (filters?.startDate) {
    query += `&created_at=gte.${filters.startDate}`;
  }
  
  if (filters?.endDate) {
    query += `&created_at=lte.${filters.endDate}`;
  }
  
  const data = await restAPICall('tickets', query);
  
  // Filter by search term if provided
  if (filters?.searchTerm) {
    return data?.filter(
      (ticket: any) =>
        ticket.subject.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        ticket.customers?.name?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        ticket.customers?.email?.toLowerCase().includes(filters.searchTerm!.toLowerCase())
    );
  }
  
  return data;
};

// Fetch single ticket with messages
export const fetchTicketWithMessages = async (ticketId: string) => {
  const results = await restAPICall(
    'tickets',
    `select=*,customers(id,name,email),messages(id,content,sender_type,sender_id,created_at,attachments(id,file_name,file_type,file_size,storage_path))&id=eq.${ticketId}`
  );
  
  if (!results || results.length === 0) {
    console.warn('No ticket found with ID:', ticketId);
    throw new Error('Ticket not found');
  }
  
  return results[0];
};

// Get analytics data
export const fetchAnalytics = async () => {
  const results = await restAPICall('analytics_summary', 'select=*');
  
  if (!results || results.length === 0) {
    return null;
  }
  
  return results[0];
};

// Get attachment download URL
export const getAttachmentDownloadUrl = (storagePath: string) => {
  const { data } = supabase.storage
    .from('support-attachments')
    .getPublicUrl(storagePath);
  return data.publicUrl;
};
