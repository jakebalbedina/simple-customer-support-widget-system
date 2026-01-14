import { Box, Paper, Typography, Chip, Button, CircularProgress, Alert, Select, MenuItem, FormControl } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { fetchTicketWithMessages } from '@/api/supabase';
import { subscribeToTicketUpdates, subscribeToTicketStatusUpdates, supabase } from '@/config/supabase';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI } from '@/api/client';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

interface TicketDetailProps {
  ticketId: string;
  customerId: string;
  onClose?: () => void;
  isAdmin?: boolean;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticketId,
  customerId,
  onClose,
  isAdmin = false,
}) => {
  const [ticket, setTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load ticket and messages
  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        const data = await fetchTicketWithMessages(ticketId);
        setTicket(data);
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  // Subscribe to new messages
  useEffect(() => {
    const messageSubscription = subscribeToTicketUpdates(ticketId, async () => {
      try {
        const data = await fetchTicketWithMessages(ticketId);
        setTicket(data);
        setMessages(data.messages || []);
      } catch (err) {
        // Silently handle refresh errors to avoid disrupting user experience
      }
    });

    const statusSubscription = subscribeToTicketStatusUpdates(ticketId, (updatedTicket) => {
      setTicket(updatedTicket);
    });

    return () => {
      messageSubscription.unsubscribe();
      statusSubscription.unsubscribe();
    };
  }, [ticketId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageSent = async (): Promise<void> => {
    try {
      const updatedTicket = await fetchTicketWithMessages(ticketId);
      setMessages(updatedTicket.messages || []);
    } catch (err) {
      // Silently handle refresh errors
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'resolved' | 'closed') => {
    if (!user?.id) {
      setError('Admin authentication required to update ticket status');
      return;
    }

    try {
      setUpdatingStatus(true);
      await ticketAPI.updateTicketStatus({
        ticket_id: ticketId,
        status: newStatus,
        admin_id: user.id,
      });

      // Refresh ticket to get updated status
      const updatedTicket = await fetchTicketWithMessages(ticketId);
      setTicket(updatedTicket);
      setMessages(updatedTicket.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAttachmentDownload = async (storagePath: string, fileName: string): Promise<void> => {
    try {
      const { data, error } = await supabase.storage
        .from('support-attachments')
        .createSignedUrl(storagePath, 3600);

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error('Failed to generate download URL');
      }

      window.open(data.signedUrl, '_blank');
    } catch (err) {
      setError('Failed to download attachment');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!ticket) {
    return <Alert severity="info">Ticket not found</Alert>;
  }

  const statusColor = {
    pending: 'warning',
    resolved: 'success',
    closed: 'default',
  } as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Box>
            <Typography variant="h6">{ticket.subject}</Typography>
            <Typography variant="caption" color="textSecondary">
              Ticket ID: {ticket.id}
            </Typography>
          </Box>
          {onClose && (
            <Button size="small" onClick={onClose}>
              ✕ Close
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                disabled={updatingStatus}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={ticket.status.toUpperCase()}
              color={statusColor[ticket.status as keyof typeof statusColor]}
              size="small"
            />
          )}
          <Chip
            label={`Priority: ${ticket.priority.toUpperCase()}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        {messages.length === 0 ? (
          <Typography color="textSecondary" align="center">
            No messages yet
          </Typography>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              id={msg.id}
              content={msg.content}
              senderType={msg.sender_type}
              senderName={msg.sender_type === 'admin' ? 'Support Team' : undefined}
              createdAt={msg.created_at}
              attachments={msg.attachments}
              onAttachmentDownload={handleAttachmentDownload}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      {ticket.status !== 'closed' && (
        <MessageInput
          ticketId={ticketId}
          customerId={customerId}
          onMessageSent={handleMessageSent}
          isAdmin={isAdmin}
        />
      )}

      {ticket.status === 'closed' && (
        <Alert severity="info">This ticket is closed and cannot be reopened.</Alert>
      )}
    </Box>
  );
};
