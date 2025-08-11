import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Psychology,
  Download,
  Info,
  PlayArrow,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { projectApi } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

interface PredictiveCardProps {
  data: any;
  onExport: (type: 'png' | 'csv') => void;
}

const PredictiveCard: React.FC<PredictiveCardProps> = ({ data, onExport }) => {
  const { currentProjectId } = useAppStore();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('logreg');
  const [selectedInputs, setSelectedInputs] = useState<string[]>(['age', 'bmi', 'sbp']);
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['hba1c']);
  const [modelResults, setModelResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const algorithms = [
    { value: 'logreg', label: 'Logistic Regression' },
    { value: 'ridgereg', label: 'Ridge Regression' },
    { value: 'randomforest', label: 'Random Forest' },
    { value: 'svm', label: 'Support Vector Machine' },
  ];

  const availableAttributes = ['age', 'bmi', 'sbp', 'hba1c', 'ldl', 'smoking'];
  const steps = ['Select Algorithm', 'Configure Model', 'Train & Predict'];

  const buildModelMutation = useMutation({
    mutationFn: () => projectApi.buildModel(currentProjectId, {
      algorithm: selectedAlgorithm,
      inputs: selectedInputs,
      targets: selectedTargets,
    }),
    onSuccess: (response) => {
      setModelResults(response.data);
      setActiveStep(2);
      setShowResults(true);
    },
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Train model
      if (!currentProjectId) {
        alert('Please select a project first');
        return;
      }
      buildModelMutation.mutate();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const generateMockResults = () => {
    // Mock results for demo purposes
    return {
      modelId: 'predict1',
      algorithm: selectedAlgorithm,
      metrics: {
        accuracy: 0.85,
        auc: 0.78,
        precision: 0.82,
        recall: 0.76,
        f1Score: 0.79,
        rmse: selectedAlgorithm.includes('reg') ? 0.45 : undefined,
        r2: selectedAlgorithm.includes('reg') ? 0.68 : undefined,
      },
      featureImportance: selectedInputs.map((input, idx) => ({
        feature: input,
        importance: Math.random() * 0.8 + 0.1,
        rank: idx + 1,
      })).sort((a, b) => b.importance - a.importance),
      roc: Array.from({ length: 20 }, (_, i) => ({
        fpr: i / 19,
        tpr: Math.min(1, (i / 19) + Math.random() * 0.2),
      })),
    };
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Algorithm</InputLabel>
              <Select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
              >
                {algorithms.map((algo) => (
                  <MenuItem key={algo.value} value={algo.value}>
                    {algo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              {selectedAlgorithm === 'logreg' && 'Linear model for binary classification with interpretable coefficients.'}
              {selectedAlgorithm === 'ridgereg' && 'Regularized regression to prevent overfitting with continuous outcomes.'}
              {selectedAlgorithm === 'randomforest' && 'Ensemble method robust to overfitting with feature importance.'}
              {selectedAlgorithm === 'svm' && 'Powerful classifier effective in high-dimensional spaces.'}
            </Typography>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Input Features
            </Typography>
            <Box sx={{ mb: 3 }}>
              {availableAttributes.map((attr) => (
                <Chip
                  key={attr}
                  label={attr}
                  onClick={() => {
                    setSelectedInputs(prev =>
                      prev.includes(attr)
                        ? prev.filter(a => a !== attr)
                        : [...prev, attr]
                    );
                  }}
                  color={selectedInputs.includes(attr) ? 'primary' : 'default'}
                  variant={selectedInputs.includes(attr) ? 'filled' : 'outlined'}
                  sx={{ m: 0.5, cursor: 'pointer' }}
                />
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Target Variables
            </Typography>
            <Box>
              {availableAttributes.map((attr) => (
                <Chip
                  key={attr}
                  label={attr}
                  onClick={() => {
                    setSelectedTargets(prev =>
                      prev.includes(attr)
                        ? prev.filter(a => a !== attr)
                        : [...prev, attr]
                    );
                  }}
                  color={selectedTargets.includes(attr) ? 'secondary' : 'default'}
                  variant={selectedTargets.includes(attr) ? 'filled' : 'outlined'}
                  sx={{ m: 0.5, cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {buildModelMutation.isPending ? (
              <Box>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Training model...</Typography>
              </Box>
            ) : modelResults ? (
              <Box>
                <Typography variant="h6" color="success.main" gutterBottom>
                  Model Training Complete!
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowResults(true)}
                  startIcon={<Assessment />}
                >
                  View Results
                </Button>
              </Box>
            ) : (
              <Typography>Ready to train model</Typography>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar={<Psychology color="warning" />}
          title="Predictive Insights"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Build predictive models using federated machine learning on privacy-preserved data">
                <IconButton size="small">
                  <Info />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Results">
                <IconButton size="small" onClick={() => onExport('png')}>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={buildModelMutation.isPending}
              startIcon={activeStep === steps.length - 1 ? <PlayArrow /> : undefined}
            >
              {activeStep === steps.length - 1 ? 'Train Model' : 'Next'}
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            All model training uses federated learning - your raw data never leaves your secure environment.
          </Alert>
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog
        open={showResults}
        onClose={() => setShowResults(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Model Results</DialogTitle>
        <DialogContent>
          {modelResults && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {algorithms.find(a => a.value === selectedAlgorithm)?.label}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
                {Object.entries(generateMockResults().metrics).map(([key, value]) => (
                  value !== undefined && (
                    <Box key={key} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {typeof value === 'number' ? value.toFixed(3) : value}
                      </Typography>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                    </Box>
                  )
                ))}
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Feature Importance
              </Typography>
              {generateMockResults().featureImportance.map((feature) => (
                <Box key={feature.feature} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 80 }}>{feature.feature}</Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 20,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                      mx: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${feature.importance * 100}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        transition: 'width 1s ease-in-out',
                      }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {(feature.importance * 100).toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>Close</Button>
          <Button onClick={() => onExport('csv')} variant="outlined">
            Export Results
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default PredictiveCard;