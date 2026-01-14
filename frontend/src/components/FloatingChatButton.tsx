import { Fab, Tooltip, Badge, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import ForumIcon from '@mui/icons-material/Forum';
import { ChatWidget } from './ChatWidget';
import { supabase } from '@/config/supabase';

export const FloatingChatButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to new tickets
    const subscription = supabase
      .channel('new-tickets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0); // Clear unread count when opening
  };

  return (
    <Box>
      <Tooltip title="Support">
        <Badge badgeContent={unreadCount} color="error">
          <Fab
            color="primary"
            aria-label="support"
            onClick={handleOpen}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <ForumIcon />
          </Fab>
        </Badge>
      </Tooltip>

      <ChatWidget open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};
