import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Container,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TicketManagementView } from '@/components/TicketManagementView';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>Support Ticket Admin</h2>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>{user?.email}</span>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Paper>
            <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
              <Tab label="Ticket Management" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Analytics" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TicketManagementView />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <AnalyticsDashboard />
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};
