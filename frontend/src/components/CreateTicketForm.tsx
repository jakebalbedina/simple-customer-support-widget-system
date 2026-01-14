import { Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { useState } from 'react';
import { ticketAPI } from '@/api/client';
import { useWidget } from '@/context/WidgetContext';

interface CreateTicketFormProps {
  onTicketCreated: (ticketId: string) => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onTicketCreated }) => {
  const { sessionId, refreshCustomer } = useWidget();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await ticketAPI.createTicket({
        customer_name: name || 'Anonymous',
        customer_email: email || undefined,
        subject,
        message,
        priority,
        session_id: sessionId,
      });

      console.log('Ticket creation response:', response);

      if (response.success) {
        console.log('Refreshing customer after ticket creation...');
        // Refresh customer data to get the newly created customer ID
        await refreshCustomer();
        console.log('Customer refresh complete');
        
        setSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setPriority('medium');

        setTimeout(() => {
          console.log('Calling onTicketCreated with:', response.ticket_id);
          onTicketCreated(response.ticket_id);
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Ticket created successfully!</Alert>}

      <TextField
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name (optional)"
        fullWidth
        size="small"
      />

      <TextField
        label="Your Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email (optional)"
        fullWidth
        size="small"
      />

      <TextField
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="What is your issue about?"
        fullWidth
        size="small"
        required
      />

      <TextField
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your issue in detail..."
        fullWidth
        multiline
        rows={4}
        required
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading || !subject || !message}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Send Ticket'}
      </Button>
    </Box>
  );
};
