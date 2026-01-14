import React from 'react';
import { useWidget } from '@/context/WidgetContext';
import { useAuth } from '@/context/AuthContext';
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material';

/**
 * Component to verify all services are working correctly.
 * This page can be added to routes for debugging/monitoring.
 */
export const HealthCheck: React.FC = () => {
  const { sessionId, customer, loading: widgetLoading, error: widgetError } = useWidget();
  const { user, loading: authLoading } = useAuth();

  return (
    <Box sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
      <h1>🏥 System Health Check</h1>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Environment */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Environment
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <span>Supabase URL:</span>
              <strong>{import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</strong>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <span>Supabase Key:</span>
              <strong>{import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</strong>
            </Box>
          </CardContent>
        </Card>

        {/* Widget Context */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Widget Service
            </Typography>
            {widgetLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <span>Session ID:</span>
                  <strong>{sessionId ? '✅' : '❌'}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <span>Customer Loaded:</span>
                  <strong>{customer ? '✅' : '❌'}</strong>
                </Box>
                {widgetError && <Alert severity="error">{widgetError}</Alert>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Auth Context */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Authentication Service
            </Typography>
            {authLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <span>Admin Logged In:</span>
                  <strong>{user ? '✅' : '❌'}</strong>
                </Box>
                {user && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <span>User Email:</span>
                    <strong>{user.email}</strong>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Tests
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" size="small" onClick={() => console.log('Widget Context:', { sessionId, customer })}>
                Log Widget State
              </Button>
              <Button variant="outlined" size="small" onClick={() => console.log('Auth State:', { user })}>
                Log Auth State
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
