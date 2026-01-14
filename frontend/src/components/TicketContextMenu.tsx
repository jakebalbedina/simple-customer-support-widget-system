import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

interface TicketContextMenuProps {
  ticketId: string;
  status: string;
  onStatusChange?: (newStatus: string) => void;
}

export const TicketContextMenu: React.FC<TicketContextMenuProps> = ({
  ticketId,
  status,
  onStatusChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(newStatus);
    setOpen(false);
  };

  return (
    <>
      <Button
        size="small"
        startIcon={<MoreVertIcon />}
        onClick={() => setOpen(true)}
      >
        Actions
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Change Ticket Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            {status !== 'pending' && (
              <Button
                variant="outlined"
                onClick={() => handleStatusChange('pending')}
                fullWidth
              >
                Mark as Pending
              </Button>
            )}
            {status !== 'resolved' && (
              <Button
                variant="outlined"
                onClick={() => handleStatusChange('resolved')}
                fullWidth
              >
                Mark as Resolved
              </Button>
            )}
            {status !== 'closed' && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatusChange('closed')}
                fullWidth
              >
                Close Ticket
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
