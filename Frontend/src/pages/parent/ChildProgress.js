import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Star,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ChildProgress = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await parentAPI.listChildren();
        const list = (res.data || []).map(c => ({ value: c.id, label: c.name || c.email || c.id }));
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].value);
      } catch (e) {
        console.error('Failed to load children:', e);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedChild) return;
      try {
        const res = await parentAPI.getChildSummary(selectedChild);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      }
    };
    loadSummary();
  }, [selectedChild]);

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 2,
      py: 4
    }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/parent')}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold'
        }}>
          Progress Tracking 📈
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Child</InputLabel>
            <Select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              label="Select Child"
              sx={{ borderRadius: 3 }}
            >
              {children.map((child) => (
                <MenuItem key={child.value} value={child.value}>
                  {child.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Summary cards based on real backend data */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={4}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>
              <TrendingUp size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Average Score
            </Typography>
            <Typography variant="h2" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              {(() => {
                const totalXP = Number(summary?.games?.Total_XP || 0);
                const totalDays = Number(summary?.progress?.Practice_Days || 0);
                return totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
              })()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9B59B6' }}>
              <Star size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Best Score
            </Typography>
            <Typography variant="h2" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
              {Number(summary?.games?.Total_XP || 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#F39C12' }}>
              <Calendar size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Practice Days
            </Typography>
            <Typography variant="h2" sx={{ color: '#F39C12', fontWeight: 'bold' }}>
              {Number(summary?.progress?.Practice_Days ?? 0)}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChildProgress;
