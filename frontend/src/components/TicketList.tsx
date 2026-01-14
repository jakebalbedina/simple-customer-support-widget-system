import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { fetchCustomerTickets } from '@/api/supabase';
import { useWidget } from '@/context/WidgetContext';
import { formatDistanceToNow } from 'date-fns';

interface TicketListProps {
  onSelectTicket: (ticketId: string) => void;
  selectedTicketId?: string;
}

export const TicketList: React.FC<TicketListProps> = ({
  onSelectTicket,
  selectedTicketId,
}) => {
  const { customer } = useWidget();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      if (!customer?.id) {
        console.log('No customer ID, skipping ticket fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching tickets for customer:', customer.id);
        const data = await fetchCustomerTickets(customer.id);
        console.log('Fetched tickets:', data);
        setTickets(data || []);
      } catch (err) {
        console.error('Error loading tickets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [customer?.id]);

  const handleRefresh = async () => {
    if (!customer?.id) return;
    try {
      setError(null);
      const data = await fetchCustomerTickets(customer.id);
      setTickets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tickets');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (tickets.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary" variant="body2">
          No tickets yet. Create one to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ height: '100%', overflow: 'auto' }}>
      <CardContent sx={{ p: 0 }}>
        <List sx={{ width: '100%', p: 0 }}>
          {tickets.map((ticket) => (
            <ListItem
              key={ticket.id}
              disablePadding
              selected={selectedTicketId === ticket.id}
            >
              <ListItemButton
                onClick={() => onSelectTicket(ticket.id)}
                sx={{
                  borderBottom: '1px solid rgba(0,0,0,0.1)',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {ticket.subject}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
