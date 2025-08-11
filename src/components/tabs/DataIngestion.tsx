import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  CloudUpload,
  TableView,
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { projectApi } from '../../services/api';

interface CSVPreview {
  headers: string[];
  rows: string[][];
  fileName: string;
  totalRows: number;
}

const DataIngestion: React.FC = () => {
  const {
    currentProjectId,
    setCurrentProjectId,
    projectProperties,
    uploadHistory,
    addUpload,
  } = useAppStore();

  // Local state
  const [projectId, setProjectId] = useState(currentProjectId || '');
  const [csvPreviews, setCsvPreviews] = useState<CSVPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewDialog, setPreviewDialog] = useState<CSVPreview | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFiles = acceptedFiles.filter(file => file.name.endsWith('.csv'));
    
    csvFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = lines[0]?.split(',').map(h => h.trim()) || [];
        const dataRows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));
        
        const preview: CSVPreview = {
          headers,
          rows: dataRows,
          fileName: file.name,
          totalRows: lines.length - 1,
        };
        
        setCsvPreviews(prev => [...prev, preview]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: true,
  });

  // Mutations
  const pushDataMutation = useMutation({
    mutationFn: ({ pid, csvData }: { pid: string; csvData: string }) => 
      projectApi.pushData(pid, csvData),
    onSuccess: (data, variables) => {
      const preview = csvPreviews.find(p => p.fileName === variables.csvData.split('\n')[0]);
      addUpload({
        fileName: preview?.fileName || 'Unknown file',
        status: 'success',
        rowCount: preview?.totalRows || 0,
      });
      setSnackbar({ open: true, message: 'Data pushed successfully!', severity: 'success' });
      setUploadProgress(0);
    },
    onError: (error: any) => {
      addUpload({
        fileName: 'Upload failed',
        status: 'error',
        rowCount: 0,
      });
      setSnackbar({ open: true, message: `Failed to push data: ${error.message}`, severity: 'error' });
      setUploadProgress(0);
    },
  });

  const handlePushData = async (preview: CSVPreview) => {
    if (!projectId) {
      setSnackbar({ open: true, message: 'Please specify a Project ID', severity: 'error' });
      return;
    }

    // Simulate file reading progress
    setUploadProgress(10);
    
    try {
      // Read the original file content (for demo, we'll reconstruct it)
      const csvContent = [
        preview.headers.join(','),
        ...preview.rows.map(row => row.join(',')),
        // Note: In a real app, you'd read the full file content
      ].join('\n');
      
      setUploadProgress(50);
      
      await pushDataMutation.mutateAsync({ pid: projectId, csvData: csvContent });
      
      // Remove from preview after successful upload
      setCsvPreviews(prev => prev.filter(p => p.fileName !== preview.fileName));
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handlePushAllData = async () => {
    for (const preview of csvPreviews) {
      await handlePushData(preview);
    }
  };

  const removePreview = (fileName: string) => {
    setCsvPreviews(prev => prev.filter(p => p.fileName !== fileName));
  };

  // Get project info
  const { data: projectInfo, isLoading: projectInfoLoading } = useQuery({
    queryKey: ['project-info', projectId],
    queryFn: () => projectApi.getProjectInfo(projectId),
    enabled: !!projectId,
  });

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          <CloudUpload sx={{ mr: 2, verticalAlign: 'middle' }} />
          Data Ingestion & Upload
        </Typography>

        {/* Project ID & Status */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Project Configuration" />
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Project ID"
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    if (e.target.value !== currentProjectId) {
                      // Show warning about changing project ID
                    }
                  }}
                  placeholder="Enter project ID"
                  helperText={
                    currentProjectId && projectId !== currentProjectId
                      ? "⚠️ Warning: This differs from your current project ID"
                      : "Auto-populated from Clean Room Setup"
                  }
                  sx={{ minWidth: 300 }}
                />
                {projectId && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Project Properties</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Type: ${projectProperties.processingType}`} size="small" />
                      <Chip 
                        label={`Persist: ${projectProperties.persistData ? 'Yes' : 'No'}`} 
                        size="small" 
                        color={projectProperties.persistData ? 'success' : 'default'}
                      />
                      <Chip 
                        label={`Histogram: ${projectProperties.enableHistogram ? 'Yes' : 'No'}`} 
                        size="small"
                        color={projectProperties.enableHistogram ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* File Upload Zone */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="CSV File Upload" />
          <CardContent>
            <Box
              {...getRootProps()}
              sx={{
                border: 2,
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderStyle: 'dashed',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: isDragActive ? 'primary.50' : 'background.default',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the CSV files here...' : 'Drag & drop CSV files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Or click to select files • Supports multiple files like peer_A_patients.csv, peer_B_patients.csv
              </Typography>
            </Box>

            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* CSV Previews */}
        {csvPreviews.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardHeader 
              title="File Previews"
              action={
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={handlePushAllData}
                  disabled={!projectId || pushDataMutation.isPending}
                >
                  Push All to Clean Room
                </Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {csvPreviews.map((preview, index) => (
                  <Box key={index}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{preview.fileName}</Typography>
                        <Box>
                          <Chip label={`${preview.totalRows} rows`} size="small" sx={{ mr: 1 }} />
                          <IconButton onClick={() => setPreviewDialog(preview)} size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            onClick={() => handlePushData(preview)}
                            disabled={!projectId || pushDataMutation.isPending}
                            size="small"
                            color="primary"
                          >
                            <CloudUpload />
                          </IconButton>
                          <IconButton onClick={() => removePreview(preview.fileName)} size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {preview.headers.map((header, i) => (
                                <TableCell key={i} sx={{ fontWeight: 'bold' }}>
                                  {header}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {preview.rows.map((row, i) => (
                              <TableRow key={i}>
                                {row.map((cell, j) => (
                                  <TableCell key={j}>{cell}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      {preview.totalRows > 5 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Showing first 5 rows of {preview.totalRows} total rows
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Upload History */}
        <Card>
          <CardHeader title="Upload History" />
          <CardContent>
            {uploadHistory.length === 0 ? (
              <Alert severity="info">
                No uploads yet. Upload some CSV files to see the history here.
              </Alert>
            ) : (
              <List>
                {uploadHistory.map((upload, index) => (
                  <ListItem key={upload.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {upload.status === 'success' && <CheckCircle color="success" fontSize="small" />}
                          {upload.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                          {upload.status === 'pending' && <Warning color="warning" fontSize="small" />}
                          <Typography variant="subtitle2">{upload.fileName}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(upload.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {upload.rowCount} rows • Status: {upload.status}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined" startIcon={<Refresh />}>
                        Re-push
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDialog} onClose={() => setPreviewDialog(null)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {previewDialog?.fileName} - Full Preview
        </DialogTitle>
        <DialogContent>
          {previewDialog && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {previewDialog.headers.map((header, i) => (
                      <TableCell key={i} sx={{ fontWeight: 'bold' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewDialog.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(null)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (previewDialog) handlePushData(previewDialog);
              setPreviewDialog(null);
            }}
            disabled={!projectId}
          >
            Push to Clean Room
          </Button>
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

export default DataIngestion;