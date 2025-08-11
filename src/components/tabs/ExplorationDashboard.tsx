import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  TextField,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Assessment,
  PieChart,
  BarChart,
  Download,
  Share,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { projectApi } from '../../services/api';

// Mock cohort options
const cohortOptions = [
  'All',
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

const ExplorationDashboard: React.FC = () => {
  const { currentProjectId, searchQuery } = useAppStore();

  // Local state
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('uni');
  const [attributes, setAttributes] = useState<string[]>(['age', 'bmi', 'hba1c']);
  const [ageRange, setAgeRange] = useState([18, 90]);
  const [bmiRange, setBmiRange] = useState([15, 50]);
  const [federatedView, setFederatedView] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Queries
  const { data: overviewMetrics, isLoading: overviewLoading } = useQuery({
    queryKey: ['overview-metrics', currentProjectId],
    queryFn: () => projectApi.exploreUnivariate(currentProjectId, ['age', 'bmi', 'sex']),
    enabled: !!currentProjectId,
  });

  // Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: () => {
      if (selectedMetric === 'uni') {
        return projectApi.exploreUnivariate(currentProjectId, attributes);
      } else if (selectedMetric === 'bi') {
        return projectApi.exploreBivariate(currentProjectId, attributes, selectedCohort !== 'All' ? selectedCohort : undefined);
      }
      // Predictive would be handled differently
      return Promise.resolve({ data: null });
    },
    onSuccess: (data) => {
      setAnalysisResults(data.data);
    },
  });

  const handleAnalyze = () => {
    if (!currentProjectId) {
      alert('Please select a project first');
      return;
    }
    analyzeMutation.mutate();
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // Implementation for exporting data
    console.log(`Exporting as ${format}`);
  };

  // Mock statistics for demo
  const mockStats = {
    totalPatients: 15420,
    avgAge: 64.5,
    malePercent: 48.2,
    avgBMI: 27.3,
    diabeticsPercent: 23.1,
    smokersPercent: 15.8,
  };

  return (
    <Box>
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
          <Card sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Total Patients
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {mockStats.totalPatients.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Avg Age
              </Typography>
              <Typography variant="h4" component="div" color="secondary">
                {mockStats.avgAge}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Male %
              </Typography>
              <Typography variant="h4" component="div" color="info">
                {mockStats.malePercent}%
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Avg BMI
              </Typography>
              <Typography variant="h4" component="div" color="warning">
                {mockStats.avgBMI}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Diabetics %
              </Typography>
              <Typography variant="h4" component="div" color="error">
                {mockStats.diabeticsPercent}%
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Smokers %
              </Typography>
              <Typography variant="h4" component="div" color="warning">
                {mockStats.smokersPercent}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Analysis Controls */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Analysis Configuration" />
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Autocomplete
                  options={cohortOptions}
                  value={selectedCohort}
                  onChange={(event, newValue) => setSelectedCohort(newValue || 'All')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cohort"
                      placeholder="Search cohorts..."
                    />
                  )}
                  sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Metric Type</InputLabel>
                  <Select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                  >
                    {metricTypes.map((metric) => (
                      <MenuItem key={metric.value} value={metric.value}>
                        {metric.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Autocomplete
                  multiple
                  options={['age', 'bmi', 'hba1c', 'sbp', 'dbp', 'cholesterol', 'smoking']}
                  value={attributes}
                  onChange={(event, newValue) => setAttributes(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Attributes"
                      placeholder="Select attributes"
                    />
                  )}
                  sx={{ minWidth: 300 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || !currentProjectId}
                  startIcon={analyzeMutation.isPending ? <CircularProgress size={20} /> : <Assessment />}
                >
                  Analyze
                </Button>
              </Box>

              <Divider />

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
                <Button startIcon={<FilterList />} variant="outlined">
                  Advanced Filters
                </Button>
                <Button startIcon={<Refresh />} variant="outlined">
                  Refresh Data
                </Button>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Button startIcon={<Download />} onClick={() => handleExport('csv')}>
                    Export CSV
                  </Button>
                  <Button startIcon={<Download />} onClick={() => handleExport('json')}>
                    Export JSON
                  </Button>
                  <Button startIcon={<Share />} variant="outlined">
                    Share Report
                  </Button>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Results Dashboard */}
        {!currentProjectId ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            Please set up a clean room project first to begin data exploration.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Charts Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
              <Card>
                <CardHeader 
                  title="Demographics"
                  avatar={<BarChart color="primary" />}
                />
                <CardContent>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" textAlign="center">
                      Age Distribution Chart
                      <br />
                      <small>Interactive histogram will appear here</small>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader 
                  title="Health Metrics"
                  avatar={<TrendingUp color="secondary" />}
                />
                <CardContent>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" textAlign="center">
                      HbA1c Distribution
                      <br />
                      <small>Gauge chart will appear here</small>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader 
                  title="Correlations"
                  avatar={<Assessment color="info" />}
                />
                <CardContent>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" textAlign="center">
                      Correlation Heatmap
                      <br />
                      <small>Interactive heatmap will appear here</small>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader 
                  title="Diagnosis Outcomes"
                  avatar={<PieChart color="warning" />}
                />
                <CardContent>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary" textAlign="center">
                      Stacked Bar Chart
                      <br />
                      <small>Diagnosis distribution will appear here</small>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Analysis Results */}
            {analysisResults && (
              <Card>
                <CardHeader title="Analysis Results" />
                <CardContent>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Statistical Summary
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                      {JSON.stringify(analysisResults, null, 2)}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            )}

            {/* Predictive Modeling Section */}
            {selectedMetric === 'pred' && (
              <Card>
                <CardHeader title="Predictive Modeling" />
                <CardContent>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Configure predictive models to generate risk assessments and outcome predictions.
                  </Alert>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Algorithm</InputLabel>
                      <Select defaultValue="logreg">
                        <MenuItem value="logreg">Logistic Regression</MenuItem>
                        <MenuItem value="rf">Random Forest</MenuItem>
                        <MenuItem value="svm">Support Vector Machine</MenuItem>
                        <MenuItem value="nn">Neural Network</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Target Variable"
                      placeholder="e.g., diabetes_risk"
                      sx={{ minWidth: 200 }}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<TrendingUp />}
                    >
                      Build Model
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </motion.div>
    </Box>
  );
};

export default ExplorationDashboard;