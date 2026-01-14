// Environment variables configuration
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
  console.warn('VITE_SUPABASE_URL:', supabaseUrl);
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
} else {
  console.log('Supabase environment variables loaded successfully');
  console.log('URL:', supabaseUrl);
  console.log('Key loaded:', !!supabaseKey);
  
  // Test REST API with proper headers
  fetch(`${supabaseUrl}/rest/v1/customers?select=*&limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  })
    .then(r => {
      console.log('REST API test status:', r.status);
      if (!r.ok) console.error('REST API test failed:', r.statusText);
    })
    .catch(e => console.error('REST API test error:', e));
}
