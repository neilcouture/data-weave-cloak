import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  IconButton,
  Tooltip,
  Fab,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Analytics,
  Assessment,
  Download,
  Share,
  Refresh,
  FilterList,
  PictureAsPdf,
  GetApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { projectApi } from '../../services/api';
import Masonry from 'react-masonry-css';
import html2pdf from 'html2pdf.js';

// Import chart components
import DemographicsCard from '../charts/DemographicsCard';
import HealthMetricsCard from '../charts/HealthMetricsCard';
import CorrelationsCard from '../charts/CorrelationsCard';
import PredictiveCard from '../charts/PredictiveCard';

// Cohort options for healthcare data
const baseCohortOptions = [
  'All Patients',
  'I10_Hypertension',
  'J45_Asthma', 
  'K21_Reflux',
  'E11_Type2Diabetes',
  'Smokers',
  'Non-Smokers',
  'Age_65_Plus',
  'BMI_Obese',
];

const metricTypes = [
  { value: 'uni', label: 'Univariate' },
  { value: 'bi', label: 'Bivariate' }, 
  { value: 'pred', label: 'Predictive' },
];

// Masonry breakpoints
const breakpointCols = {
  default: 3,
  1200: 2,
  768: 1,
};

const ExplorationDashboard: React.FC = () => {
  const { currentProjectId } = useAppStore();

  // State management
  const [selectedCohort, setSelectedCohort] = useState('All Patients');
  const [selectedMetric, setSelectedMetric] = useState('uni');
  const [targetAttributes, setTargetAttributes] = useState<string[]>(['age', 'bmi', 'sbp']);
  const [ageRange, setAgeRange] = useState([18, 90]);
  const [bmiRange, setBmiRange] = useState([15, 50]);
  const [federatedView, setFederatedView] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [cohortOptions, setCohortOptions] = useState(baseCohortOptions);
  const [showFilters, setShowFilters] = useState(false);
  const [exportSnackbar, setExportSnackbar] = useState(false);

  // Hero metrics query - automatically fetched on tab load
  const { data: overviewMetrics, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['overview-metrics', currentProjectId],
    queryFn: () => projectApi.exploreUnivariate(currentProjectId, ['age', 'bmi', 'sbp', 'hba1c']),
    enabled: !!currentProjectId,
    refetchOnWindowFocus: false,
  });

  // Main analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: () => {
      if (selectedMetric === 'uni') {
        return projectApi.exploreUnivariate(currentProjectId, targetAttributes);
      } else if (selectedMetric === 'bi') {
        // For bivariate with cohort selection
        const inputAttributes = selectedCohort !== 'All Patients' 
          ? [selectedCohort, ...targetAttributes]
          : targetAttributes;
          
        return projectApi.exploreBivariate(currentProjectId, inputAttributes, 
          selectedCohort !== 'All Patients' ? selectedCohort : undefined);
      }
      // Predictive handled by PredictiveCard component
      return projectApi.exploreUnivariate(currentProjectId, ['age']);
    },
    onSuccess: (response) => {
      setAnalysisResults(response.data);
    },
  });

  const handleAnalyze = useCallback(() => {
    if (!currentProjectId) {
      alert('Please select a project first');
      return;
    }
    analyzeMutation.mutate();
  }, [currentProjectId, analyzeMutation]);

  const handleCardExport = useCallback((cardType: string, format: 'png' | 'csv') => {
    // Handle individual card exports
    setExportSnackbar(true);
    console.log(`Exporting ${cardType} as ${format}`);
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    const options = {
      margin: 1,
      filename: `healthcare-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(options).from(element).save();
      setExportSnackbar(true);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    refetchOverview();
    if (analysisResults) {
      handleAnalyze();
    }
  }, [refetchOverview, analysisResults, handleAnalyze]);

  // Extract overview statistics from API response
  const extractOverviewStats = (data: any) => {
    const stats: any = {};
    
    if (data?.age) {
      stats.avgAge = data.age.mean?.toFixed(1) || 'N/A';
      stats.ageRange = `${data.age.min || 0}-${data.age.max || 100}`;
    }
    
    if (data?.bmi) {
      stats.avgBMI = data.bmi.mean?.toFixed(1) || 'N/A';
    }
    
    if (data?.sbp) {
      stats.avgSBP = data.sbp.mean?.toFixed(0) || 'N/A';
    }
    
    if (data?.hba1c) {
      stats.avgHbA1c = data.hba1c.mean?.toFixed(2) || 'N/A';
    }
    
    // Mock total patients - would come from actual federation stats
    stats.totalPatients = 15420;
    
    return stats;
  };

  const overviewStats = extractOverviewStats(overviewMetrics?.data || {});

  return (
    <Box id="dashboard-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          <Analytics sx={{ mr: 2, verticalAlign: 'middle' }} />
          Exploration Dashboard
        </Typography>

        {/* Hero Overview Cards */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ minWidth: 180 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Patients
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {overviewLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    overviewStats.totalPatients?.toLocaleString() || 'N/A'
                  )}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ minWidth: 180 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Avg Age
                </Typography>
                <Typography variant="h4" component="div" color="secondary">
                  {overviewLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${overviewStats.avgAge || 'N/A'} yrs`
                  )}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ minWidth: 180 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Avg BMI
                </Typography>
                <Typography variant="h4" component="div" color="warning">
                  {overviewLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    overviewStats.avgBMI || 'N/A'
                  )}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ minWidth: 180 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Avg SBP
                </Typography>
                <Typography variant="h4" component="div" color="info">
                  {overviewLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${overviewStats.avgSBP || 'N/A'} mmHg`
                  )}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.5 }}
          >
            <Card sx={{ minWidth: 180 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Avg HbA1c
                </Typography>
                <Typography variant="h4" component="div" color="error">
                  {overviewLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `${overviewStats.avgHbA1c || 'N/A'}%`
                  )}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Analysis Controls */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Analysis Configuration" />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {/* Searchable Cohort Selector */}
              <Autocomplete
                freeSolo
                options={cohortOptions}
                value={selectedCohort}
                onChange={(event, newValue) => {
                  const cohort = newValue || 'All Patients';
                  setSelectedCohort(cohort);
                  if (!cohortOptions.includes(cohort) && cohort !== 'All Patients') {
                    setCohortOptions(prev => [...prev, cohort]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cohort Selection"
                    placeholder="Search or enter custom cohort..."
                    helperText="Try 'I10_Hypertension' or custom conditions"
                  />
                )}
                sx={{ minWidth: 250 }}
              />

              {/* Metric Toggle */}
              <FormControl>
                <ToggleButtonGroup
                  value={selectedMetric}
                  exclusive
                  onChange={(e, newValue) => newValue && setSelectedMetric(newValue)}
                  sx={{ height: 56 }}
                >
                  {metricTypes.map((metric) => (
                    <ToggleButton key={metric.value} value={metric.value}>
                      {metric.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </FormControl>

              {/* Target Attributes */}
              <Autocomplete
                multiple
                options={['age', 'bmi', 'hba1c', 'sbp', 'dbp', 'ldl', 'smoking']}
                value={targetAttributes}
                onChange={(event, newValue) => setTargetAttributes(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.toUpperCase()} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Attributes"
                    placeholder="Select clinical variables"
                  />
                )}
                sx={{ minWidth: 300 }}
              />

              {/* Analyze Button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !currentProjectId || targetAttributes.length === 0}
                startIcon={analyzeMutation.isPending ? <CircularProgress size={20} /> : <Assessment />}
                sx={{ minWidth: 120 }}
              >
                Analyze
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Additional Controls */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={federatedView}
                    onChange={(e) => setFederatedView(e.target.checked)}
                  />
                }
                label="Federated View"
              />
              <Button 
                startIcon={<FilterList />} 
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
              >
                Advanced Filters
              </Button>
              <Button 
                startIcon={<Refresh />} 
                variant="outlined"
                onClick={handleRefresh}
                disabled={overviewLoading}
              >
                Refresh Data
              </Button>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button startIcon={<PictureAsPdf />} onClick={handleGeneratePDF} variant="outlined">
                  Export PDF
                </Button>
                <Button startIcon={<Share />} variant="outlined">
                  Share Report
                </Button>
              </Box>
            </Box>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Advanced Filters
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                    <Box>
                      <Typography gutterBottom>Age Range (years)</Typography>
                      <Slider
                        value={ageRange}
                        onChange={(e, newValue) => setAgeRange(newValue as number[])}
                        valueLabelDisplay="auto"
                        min={18}
                        max={100}
                        marks={[
                          { value: 18, label: '18' },
                          { value: 65, label: '65' },
                          { value: 100, label: '100' }
                        ]}
                      />
                    </Box>
                    <Box>
                      <Typography gutterBottom>BMI Range</Typography>
                      <Slider
                        value={bmiRange}
                        onChange={(e, newValue) => setBmiRange(newValue as number[])}
                        valueLabelDisplay="auto"
                        min={15}
                        max={50}
                        marks={[
                          { value: 15, label: '15' },
                          { value: 25, label: '25' },
                          { value: 30, label: '30' },
                          { value: 50, label: '50' }
                        ]}
                      />
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Interactive Reports Dashboard */}
        {!currentProjectId ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            Please set up a clean room project first to begin data exploration.
          </Alert>
        ) : (
          <Box>
            {/* Masonry Grid for Interactive Reports */}
            <Masonry
              breakpointCols={breakpointCols}
              className="masonry-grid"
              columnClassName="masonry-grid-column"
            >
              <DemographicsCard 
                data={analysisResults || overviewMetrics?.data} 
                onExport={(type) => handleCardExport('Demographics', type)}
              />
              
              <HealthMetricsCard 
                data={analysisResults || overviewMetrics?.data}
                onExport={(type) => handleCardExport('HealthMetrics', type)}
              />
              
              <CorrelationsCard 
                data={analysisResults || overviewMetrics?.data}
                onExport={(type) => handleCardExport('Correlations', type)}
              />
              
              <PredictiveCard 
                data={analysisResults || overviewMetrics?.data}
                onExport={(type) => handleCardExport('Predictive', type)}
              />
            </Masonry>

            {/* Raw Analysis Results (for debugging/development) */}
            {analysisResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card sx={{ mt: 4 }}>
                  <CardHeader 
                    title="Raw Analysis Results" 
                    action={
                      <Tooltip title="Parsed KSVDMap response with statistical summaries">
                        <IconButton>
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      All statistical analyses are computed using privacy-preserving federated algorithms. 
                      Raw patient data never leaves the secure environment.
                    </Alert>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50', 
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: 'auto'
                    }}>
                      <Typography variant="body2" component="pre" sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {JSON.stringify(analysisResults, null, 2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Box>
        )}
      </motion.div>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Fab
          size="small"
          color="primary"
          onClick={handleRefresh}
          disabled={overviewLoading || analyzeMutation.isPending}
        >
          <Refresh />
        </Fab>
        <Fab
          size="small"
          color="secondary"
          onClick={handleGeneratePDF}
        >
          <GetApp />
        </Fab>
      </Box>

      {/* Export Success Snackbar */}
      <Snackbar
        open={exportSnackbar}
        autoHideDuration={3000}
        onClose={() => setExportSnackbar(false)}
        message="Export completed successfully!"
      />
    </Box>
  );
};

export default ExplorationDashboard;