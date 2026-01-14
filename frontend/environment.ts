// Environment variables configuration
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}
