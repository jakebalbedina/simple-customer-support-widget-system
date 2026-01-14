import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useState, useEffect, useCallback } from 'react';
import { fetchAllTickets } from '@/api/supabase';
import { supabase } from '@/config/supabase';
import { formatDistanceToNow } from 'date-fns';
import { TicketDetail } from './TicketDetail';

interface Ticket {
  id: string;
  subject: string;
  status: 'pending' | 'resolved' | 'closed';
  created_at: string;
  customers?: {
    name?: string;
    email?: string;
  };
  messages?: any[];
}

type StatusColor = 'warning' | 'success' | 'default';

export const TicketManagementView: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  const loadTickets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchAllTickets({
        status: statusFilter || undefined,
        searchTerm: searchTerm || undefined,
      });
      
      setTickets(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load tickets';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Subscribe to real-time ticket updates
  useEffect(() => {
    const subscription = supabase
      .channel('public:tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        () => {
          loadTickets();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadTickets]);

  const handleViewTicket = useCallback((ticketId: string): void => {
    setSelectedTicketId(ticketId);
    setDetailDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback((): void => {
    setDetailDialogOpen(false);
    setSelectedTicketId(null);
  }, []);

  const handleClearFilters = useCallback((): void => {
    setStatusFilter('');
    setSearchTerm('');
  }, []);

  const getStatusColor = useCallback((status: string): StatusColor => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
      default:
        return 'default';
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Filters */}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth
                size="small"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Search"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                onClick={handleClearFilters}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={loadTickets}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : tickets.length === 0 ? (
        <Alert severity="info">No tickets found</Alert>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Messages</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{ticket.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Box>
                      <div>{ticket.customers?.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                        {ticket.customers?.email || 'N/A'}
                      </div>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell align="center">{ticket.messages?.length || 0}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewTicket(ticket.id)}
                      title="View details"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent sx={{ flex: 1, overflow: 'auto' }}>
          {selectedTicketId && (
            <Box sx={{ pt: 2 }}>
              <TicketDetail
                ticketId={selectedTicketId}
                customerId=""
                isAdmin={true}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
