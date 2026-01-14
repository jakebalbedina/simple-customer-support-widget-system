import React, { useState, useEffect } from 'react';
import { getOrCreateSession, supabaseUrl, supabaseKey } from '@/config/supabase';

interface Customer {
  id: string;
  name: string;
  email: string;
  session_id: string;
}

interface WidgetContextType {
  sessionId: string;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refreshCustomer: () => Promise<void>;
}

export const WidgetContext = React.createContext<WidgetContextType | undefined>(undefined);

// Helper to make REST API calls
const restAPICall = async (endpoint: string, query: string = '') => {
  const url = `${supabaseUrl}/rest/v1/${endpoint}${query ? '?' + query : ''}`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const text = await response.text();
    if (response.status === 406 || text.includes('0 rows')) {
      return null; // No rows found, return null
    }
    throw new Error(`REST API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await getOrCreateSession();
        setSessionId(session);
        
        // Fetch customer data using REST API
        const customerData = await restAPICall('customers', `select=*&session_id=eq.${session}`);
        
        if (customerData) {
          setCustomer(customerData);
        }
      } catch (err) {
        console.error('Error initializing session:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const refreshCustomer = async () => {
    if (!sessionId) return;
    try {
      const customerData = await restAPICall('customers', `select=*&session_id=eq.${sessionId}`);
      
      if (customerData) {
        setCustomer(customerData);
      }
    } catch (err) {
      console.error('Error refreshing customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh customer');
    }
  };

  return (
    <WidgetContext.Provider
      value={{
        sessionId,
        customer,
        loading,
        error,
        refreshCustomer,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = () => {
  const context = React.useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within WidgetProvider');
  }
  return context;
};
