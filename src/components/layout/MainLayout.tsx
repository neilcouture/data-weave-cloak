import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
  Paper,
  Chip,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Search,
  Menu as MenuIcon,
  LocalHospital,
  Security,
  CloudUpload,
  Analytics,
  Settings,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import CleanRoomSetup from '../tabs/CleanRoomSetup';
import DataIngestion from '../tabs/DataIngestion';
import ExplorationDashboard from '../tabs/ExplorationDashboard';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<null | HTMLElement>(null);

  const {
    isDarkMode,
    toggleTheme,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentProjectId,
    federationStatus,
  } = useAppStore();

  const tabs = [
    { label: 'Clean Room Setup', icon: <Security sx={{ mr: 1 }} />, component: <CleanRoomSetup /> },
    { label: 'Data Ingestion', icon: <CloudUpload sx={{ mr: 1 }} />, component: <DataIngestion /> },
    { label: 'Exploration Dashboard', icon: <Analytics sx={{ mr: 1 }} />, component: <ExplorationDashboard /> },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tabs[activeTab].component}
        </motion.div>
      </AnimatePresence>
    );
  };

  const statusColor = {
    idle: 'default',
    creating: 'warning',
    joining: 'warning',
    active: 'success',
    error: 'error',
  }[federationStatus] as 'default' | 'warning' | 'success' | 'error';

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <LocalHospital sx={{ mr: 2, color: 'primary.main' }} />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700,
                background: 'linear-gradient(135deg, hsl(203, 94%, 25%) 0%, hsl(149, 46%, 45%) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Healthcare Data Clean Room Elite
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          {/* Global Search */}
          <TextField
            size="small"
            placeholder="Search cohorts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mr: 2,
              width: 300,
              display: { xs: 'none', md: 'flex' }
            }}
          />

          {/* Project Status */}
          {currentProjectId && (
            <Box sx={{ mr: 2, display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Project:
              </Typography>
              <Chip
                label={currentProjectId}
                color={statusColor}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={federationStatus}
                color={statusColor}
                size="small"
                variant="outlined"
              />
            </Box>
          )}

          {/* Theme Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                icon={<LightMode />}
                checkedIcon={<DarkMode />}
              />
            }
            label=""
            sx={{ mr: 1 }}
          />

          {/* Settings Menu */}
          <IconButton
            color="inherit"
            onClick={(e) => setSettingsMenu(e.currentTarget)}
          >
            <Settings />
          </IconButton>
          <Menu
            anchorEl={settingsMenu}
            open={Boolean(settingsMenu)}
            onClose={() => setSettingsMenu(null)}
          >
            <MenuItem onClick={() => setSettingsMenu(null)}>
              Version 1.0.0
            </MenuItem>
            <MenuItem onClick={() => setSettingsMenu(null)}>
              Documentation
            </MenuItem>
            <MenuItem onClick={() => setSettingsMenu(null)}>
              API Status
            </MenuItem>
          </Menu>
        </Toolbar>

        {/* Tab Navigation */}
        {!isMobile && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ px: 2 }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {tab.icon}
                      {tab.label}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Navigation
          </Typography>
          <List>
            {tabs.map((tab, index) => (
              <ListItemButton
                key={index}
                selected={activeTab === index}
                onClick={() => {
                  setActiveTab(index);
                  setDrawerOpen(false);
                }}
              >
                {tab.icon}
                <ListItemText primary={tab.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {renderTabContent()}
      </Container>

      {/* Footer */}
      <Paper
        component="footer"
        elevation={0}
        sx={{
          mt: 'auto',
          py: 2,
          px: 2,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Healthcare DCR Elite v1.0.0 • HIPAA Compliant • Privacy-First
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography 
                variant="body2" 
                color="primary" 
                component="button"
                sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Documentation
              </Typography>
              <Typography 
                variant="body2" 
                color="primary"
                component="button"
                sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                API Reference
              </Typography>
              <Typography 
                variant="body2" 
                color="primary"
                component="button"
                sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Support
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default MainLayout;