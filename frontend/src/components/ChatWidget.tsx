import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { CreateTicketForm } from './CreateTicketForm';
import { TicketList } from './TicketList';
import { TicketDetail } from './TicketDetail';
import { useWidget } from '@/context/WidgetContext';

interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ open, onClose }) => {
  const { customer } = useWidget();
  const [tabValue, setTabValue] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>();

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setTabValue(2); // Switch to detail view
  };

  const handleTicketCreated = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setTabValue(2); // Switch to detail view
  };

  const handleCloseDetail = () => {
    setSelectedTicketId(undefined);
    setTabValue(1); // Go back to tickets list
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Support Widget</span>
        <Button size="small" onClick={onClose}>
          ✕
        </Button>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="New Ticket" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="My Tickets" id="tab-1" aria-controls="tabpanel-1" />
          {selectedTicketId && (
            <Tab label="Details" id="tab-2" aria-controls="tabpanel-2" />
          )}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <TabPanel value={tabValue} index={0}>
          <CreateTicketForm onTicketCreated={handleTicketCreated} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {customer ? (
            <TicketList
              onSelectTicket={handleSelectTicket}
              selectedTicketId={selectedTicketId}
            />
          ) : (
            <Typography color="textSecondary">Loading...</Typography>
          )}
        </TabPanel>

        {selectedTicketId && (
          <TabPanel value={tabValue} index={2}>
            <TicketDetail
              ticketId={selectedTicketId}
              customerId={customer?.id || ''}
              onClose={handleCloseDetail}
            />
          </TabPanel>
        )}
      </Box>
    </Dialog>
  );
};
