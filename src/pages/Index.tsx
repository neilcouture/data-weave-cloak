import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

// This page is now handled by MainLayout, but kept as fallback
const Index = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Loading Healthcare Data Clean Room...
      </Typography>
    </Box>
  );
};

export default Index;
