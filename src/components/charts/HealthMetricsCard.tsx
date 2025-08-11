import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Download,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Scatter, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface HealthMetricsCardProps {
  data: any;
  onExport: (type: 'png' | 'csv') => void;
}

const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ data, onExport }) => {
  // Generate HbA1c gauge zones
  const generateHbA1cZones = () => {
    if (!data?.hba1c) return { normal: 60, preDiabetes: 25, diabetes: 15 };
    
    const { mean } = data.hba1c;
    
    // Simulate distribution based on mean
    if (mean < 5.7) {
      return { normal: 75, preDiabetes: 20, diabetes: 5 };
    } else if (mean < 6.5) {
      return { normal: 45, preDiabetes: 40, diabetes: 15 };
    } else {
      return { normal: 25, preDiabetes: 35, diabetes: 40 };
    }
  };

  // Generate SBP vs Age scatter plot
  const generateSBPAgeScatter = () => {
    if (!data?.sbp || !data?.age) return null;
    
    const points = [];
    const numPoints = 50;
    
    for (let i = 0; i < numPoints; i++) {
      // Generate realistic SBP-age correlation
      const age = data.age.min + Math.random() * (data.age.max - data.age.min);
      const baseSBP = 100 + age * 0.5; // Age-related increase
      const sbp = baseSBP + (Math.random() - 0.5) * 30;
      
      points.push({ x: age, y: Math.max(90, Math.min(180, sbp)) });
    }
    
    return {
      datasets: [{
        label: 'SBP vs Age',
        data: points,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };
  };

  // Generate smoker status donut
  const generateSmokerStatus = () => {
    // Mock data - would come from actual cohort analysis
    const smokerPercent = 15.8;
    const nonSmokerPercent = 84.2;
    
    return {
      labels: ['Non-Smokers', 'Smokers'],
      datasets: [{
        data: [nonSmokerPercent, smokerPercent],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2,
      }]
    };
  };

  const hba1cZones = generateHbA1cZones();
  const sbpAgeData = generateSBPAgeScatter();
  const smokerData = generateSmokerStatus();

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: () => '',
          label: (context: any) => {
            return `Age: ${context.parsed.x.toFixed(1)}, SBP: ${context.parsed.y.toFixed(0)} mmHg`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age (years)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Systolic BP (mmHg)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
    cutout: '50%',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar={<TrendingUp color="secondary" />}
          title="Health Metrics"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Clinical metrics including glucose control, blood pressure, and lifestyle factors">
                <IconButton size="small">
                  <Info />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Chart">
                <IconButton size="small" onClick={() => onExport('png')}>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          {/* HbA1c Zones */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              HbA1c Distribution
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Normal: ${hba1cZones.normal}%`}
                color="success"
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`Pre-diabetes: ${hba1cZones.preDiabetes}%`}
                color="warning"
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`Diabetes: ${hba1cZones.diabetes}%`}
                color="error"
                size="small"
                variant="outlined"
              />
            </Box>
            {data?.hba1c && (
              <Typography variant="caption" color="text.secondary">
                Mean HbA1c: {data.hba1c.mean?.toFixed(2)}% (Range: {data.hba1c.min?.toFixed(1)}-{data.hba1c.max?.toFixed(1)}%)
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 250 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom textAlign="center">
                Blood Pressure vs Age
              </Typography>
              {sbpAgeData ? (
                <Scatter data={sbpAgeData} options={scatterOptions} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No BP/Age data available
                  </Typography>
                </Box>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom textAlign="center">
                Smoking Status
              </Typography>
              <Doughnut data={smokerData} options={doughnutOptions} />
            </Box>
          </Box>

          {(data?.sbp || data?.hba1c) && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                <strong>Clinical Insights:</strong>
                {data?.sbp && ` Mean SBP: ${data.sbp.mean?.toFixed(0)} mmHg`}
                {data?.hba1c && `, HbA1c indicates ${data.hba1c.mean > 6.5 ? 'diabetic' : data.hba1c.mean > 5.7 ? 'pre-diabetic' : 'normal'} glucose control`}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthMetricsCard;