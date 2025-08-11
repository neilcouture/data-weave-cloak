import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  Add,
  Remove,
  ContentCopy,
  QrCode,
  PlayArrow,
  Stop,
  Refresh,
  Security,
  GroupAdd,
  CloudSync,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../../store/useAppStore';
import { federationApi } from '../../services/api';

const CleanRoomSetup: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    currentProjectId,
    setCurrentProjectId,
    projectProperties,
    setProjectProperties,
    federationStatus,
    setFederationStatus,
    isSyncing,
    setIsSyncing,
  } = useAppStore();

  // Local state
  const [projectId, setProjectId] = useState(currentProjectId || 'clean-room-1');
  const [natsHosts, setNatsHosts] = useState('nats://charm:4222');
  const [syncSchedule, setSyncSchedule] = useState('m1');
  const [invitePassword, setInvitePassword] = useState('passwd66');
  const [fedPid, setFedPid] = useState('');
  const [inviteJson, setInviteJson] = useState('');
  const [localProjectId, setLocalProjectId] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [qrDialog, setQrDialog] = useState(false);

  // Mutations
  const createFederationMutation = useMutation({
    mutationFn: federationApi.createFederation,
    onSuccess: (data) => {
      setCurrentProjectId(projectId);
      setFederationStatus('active');
      setSnackbar({ open: true, message: 'Federation created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setFederationStatus('error');
      setSnackbar({ open: true, message: `Failed to create federation: ${error.message}`, severity: 'error' });
    },
  });

  const generateInviteMutation = useMutation({
    mutationFn: ({ pid, password }: { pid: string; password: string }) => 
      federationApi.generateInvite(pid, password),
    onSuccess: (data) => {
      setGeneratedInvite(data.data);
      setSnackbar({ open: true, message: 'Invite generated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: `Failed to generate invite: ${error.message}`, severity: 'error' });
    },
  });

  const joinFederationMutation = useMutation({
    mutationFn: federationApi.joinFederation,
    onSuccess: (data) => {
      setCurrentProjectId(localProjectId);
      setFederationStatus('active');
      setSnackbar({ open: true, message: 'Successfully joined federation!', severity: 'success' });
    },
    onError: (error: any) => {
      setFederationStatus('error');
      setSnackbar({ open: true, message: `Failed to join federation: ${error.message}`, severity: 'error' });
    },
  });

  // Handlers
  const handleCreateFederation = () => {
    setFederationStatus('creating');
    createFederationMutation.mutate({
      pid: projectId,
      natsHosts,
      syncSchedule,
      ...projectProperties,
    });
  };

  const handleGenerateInvite = () => {
    const pid = fedPid || currentProjectId;
    if (!pid) {
      setSnackbar({ open: true, message: 'Please specify a Project ID', severity: 'error' });
      return;
    }
    generateInviteMutation.mutate({ pid, password: invitePassword });
  };

  const handleJoinFederation = () => {
    if (!inviteJson || !localProjectId) {
      setSnackbar({ open: true, message: 'Please provide invite JSON and local project ID', severity: 'error' });
      return;
    }
    setFederationStatus('joining');
    joinFederationMutation.mutate({
      pid: localProjectId,
      inviteJson,
      ...projectProperties,
    });
  };

  const handleAddTag = (field: 'targetList' | 'conditionList', value: string) => {
    if (!value.trim()) return;
    const currentList = projectProperties[field];
    if (!currentList.includes(value.trim())) {
      setProjectProperties({
        [field]: [...currentList, value.trim()],
      });
    }
  };

  const handleRemoveTag = (field: 'targetList' | 'conditionList', value: string) => {
    setProjectProperties({
      [field]: projectProperties[field].filter(item => item !== value),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          <Security sx={{ mr: 2, verticalAlign: 'middle' }} />
          Clean Room Setup & Federation Management
        </Typography>

        {/* Shared Project Configuration */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Project Configuration" />
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="clean-room-1"
                  sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Processing Type</InputLabel>
                  <Select
                    value={projectProperties.processingType}
                    onChange={(e) => setProjectProperties({ processingType: e.target.value as 'cpu' | 'gpu' })}
                  >
                    <MenuItem value="cpu">CPU</MenuItem>
                    <MenuItem value="gpu">GPU</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={projectProperties.persistData}
                        onChange={(e) => setProjectProperties({ persistData: e.target.checked })}
                      />
                    }
                    label="Persist Data"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={projectProperties.enableHistogram}
                        onChange={(e) => setProjectProperties({ enableHistogram: e.target.checked })}
                      />
                    }
                    label="Enable Histogram"
                  />
                </Box>
              </Box>
              
              {/* Project Properties Tags */}
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle1" gutterBottom>Target List</Typography>
                  <Box sx={{ mb: 2 }}>
                    {projectProperties.targetList.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag('targetList', tag)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Add target (e.g., age, bmi)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget instanceof HTMLInputElement) {
                        handleAddTag('targetList', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="subtitle1" gutterBottom>Condition List</Typography>
                  <Box sx={{ mb: 2 }}>
                    {projectProperties.conditionList.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag('conditionList', tag)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Add condition (e.g., smoker, on_statins)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget instanceof HTMLInputElement) {
                        handleAddTag('conditionList', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Federation Actions */}
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 4 }}>
          {/* Create Federation */}
          <Card sx={{ flex: 1, minWidth: 300 }}>
            <CardHeader
              title="Create Federation"
              avatar={<Security color="primary" />}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="NATS Hosts"
                  value={natsHosts}
                  onChange={(e) => setNatsHosts(e.target.value)}
                  placeholder="nats://charm:4222"
                />
                <FormControl fullWidth>
                  <InputLabel>Sync Schedule</InputLabel>
                  <Select
                    value={syncSchedule}
                    onChange={(e) => setSyncSchedule(e.target.value)}
                  >
                    <MenuItem value="m1">Every minute</MenuItem>
                    <MenuItem value="m5">Every 5 minutes</MenuItem>
                    <MenuItem value="h1">Every hour</MenuItem>
                    <MenuItem value="h6">Every 6 hours</MenuItem>
                    <MenuItem value="d1">Daily</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCreateFederation}
                  disabled={createFederationMutation.isPending || federationStatus === 'creating'}
                  startIcon={createFederationMutation.isPending ? <CircularProgress size={20} /> : <Security />}
                >
                  Create Clean Room
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Generate Invite */}
          <Card sx={{ flex: 1, minWidth: 300 }}>
            <CardHeader
              title="Generate Invite"
              avatar={<GroupAdd color="secondary" />}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Invite Password"
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="passwd66"
                />
                <TextField
                  fullWidth
                  label="Fed PID (optional)"
                  value={fedPid}
                  onChange={(e) => setFedPid(e.target.value)}
                  placeholder={currentProjectId || "Use current project"}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleGenerateInvite}
                  disabled={generateInviteMutation.isPending}
                  startIcon={generateInviteMutation.isPending ? <CircularProgress size={20} /> : <GroupAdd />}
                >
                  Generate Invite
                </Button>
                
                {generatedInvite && (
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Generated Invite</Typography>
                      <Box>
                        <IconButton onClick={() => setQrDialog(true)} size="small">
                          <QrCode />
                        </IconButton>
                        <IconButton onClick={() => copyToClipboard(JSON.stringify(generatedInvite, null, 2))} size="small">
                          <ContentCopy />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {JSON.stringify(generatedInvite, null, 2).substring(0, 100)}...
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Join Federation */}
          <Card sx={{ flex: 1, minWidth: 300 }}>
            <CardHeader
              title="Join Federation"
              avatar={<CloudSync color="info" />}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Invite JSON"
                  value={inviteJson}
                  onChange={(e) => setInviteJson(e.target.value)}
                  placeholder="Paste invite JSON here..."
                />
                <TextField
                  fullWidth
                  label="Local Project ID"
                  value={localProjectId}
                  onChange={(e) => setLocalProjectId(e.target.value)}
                  placeholder={`${projectId}-peer`}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={handleJoinFederation}
                  disabled={joinFederationMutation.isPending || federationStatus === 'joining'}
                  startIcon={joinFederationMutation.isPending ? <CircularProgress size={20} /> : <CloudSync />}
                >
                  Join Clean Room
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Status & Controls */}
        {currentProjectId && (
          <Card>
            <CardHeader title="Federation Controls & Monitoring" />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={`Status: ${federationStatus}`}
                  color={federationStatus === 'active' ? 'success' : 'default'}
                  icon={federationStatus === 'active' ? <CheckCircle /> : <Warning />}
                />
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  disabled={isSyncing}
                >
                  Start Sync Pulsing
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Stop />}
                  disabled={!isSyncing}
                >
                  Stop Sync Pulsing
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                >
                  Monitor Sync Stats
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog} onClose={() => setQrDialog(false)}>
        <DialogTitle>Invite QR Code</DialogTitle>
        <DialogContent>
          {generatedInvite && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <QRCodeSVG value={JSON.stringify(generatedInvite)} size={256} />
              <Typography variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                Scan this QR code to share the federation invite
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default CleanRoomSetup;