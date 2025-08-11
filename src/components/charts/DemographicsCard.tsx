import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Download,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface DemographicsCardProps {
  data: any;
  onExport: (type: 'png' | 'csv') => void;
}

const DemographicsCard: React.FC<DemographicsCardProps> = ({ data, onExport }) => {
  // Generate age distribution data from TD-Digest stats
  const generateAgeDistribution = () => {
    if (!data?.age) return null;
    
    const { min, max, mean, stddev } = data.age;
    const bins = 8;
    const binWidth = (max - min) / bins;
    
    const labels = [];
    const values = [];
    
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      labels.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);
      
      // Simulate normal distribution for demo
      const binCenter = binStart + binWidth / 2;
      const value = Math.exp(-0.5 * Math.pow((binCenter - mean) / stddev, 2)) * 100;
      values.push(Math.max(5, Math.round(value)));
    }
    
    return {
      labels,
      datasets: [{
        label: 'Patient Count',
        data: values,
        backgroundColor: 'rgba(30, 144, 255, 0.8)',
        borderColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };
  };

  // Generate sex distribution
  const generateSexDistribution = () => {
    if (!data?.sex) return null;
    
    // Mock sex distribution based on common healthcare data patterns
    const malePercent = 48.2;
    const femalePercent = 51.8;
    
    return {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [malePercent, femalePercent],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2,
      }]
    };
  };

  const ageData = generateAgeDistribution();
  const sexData = generateSexDistribution();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed.y || context.parsed} patients`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  const pieOptions = {
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar={<BarChartIcon color="primary" />}
          title="Demographics"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Patient demographics show age and sex distribution across the federated cohort">
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
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 300 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom textAlign="center">
                Age Distribution
              </Typography>
              {ageData ? (
                <Bar data={ageData} options={chartOptions} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No age data available
                  </Typography>
                </Box>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom textAlign="center">
                Sex Distribution
              </Typography>
              {sexData ? (
                <Pie data={sexData} options={pieOptions} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No sex data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          {data?.age && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                <strong>Age Statistics:</strong> Mean: {data.age.mean?.toFixed(1)} years, 
                Range: {data.age.min}-{data.age.max} years, 
                StdDev: {data.age.stddev?.toFixed(1)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DemographicsCard;