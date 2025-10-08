import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI } from '../../services/api';
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
  LinearProgress
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChildAnalytics = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.listChildren();
        const list = (res.data || []).map(c => ({ value: c.id, label: c.name || c.email || c.id }));
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].value);
      } catch (e) {
        console.error('Failed to load children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedChild) return;
      try {
        setLoading(true);
        const res = await therapistAPI.getChildSummary(selectedChild);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [selectedChild]);

  const weeklyProgressData = [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 91 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 95 },
    { day: 'Sun', score: 78 }
  ];

  const activityDistribution = [
    { name: 'Practice', value: 60, color: '#8FA998' },
    { name: 'Games', value: 25, color: '#5B7C99' },
    { name: 'Assessments', value: 15, color: '#C67B5C' }
  ];

  const totalXP = Number(summary?.games?.Total_XP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;
  const selectedChildData = children.find(child => child.value === selectedChild);

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/therapist')}
            sx={{ 
              color: '#5B7C99', 
              mr: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#E8E6E1' }
            }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#3A3D42',
            fontWeight: 'bold'
          }}>
            Child Analytics 📊
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

        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography>Loading analytics...</Typography>
          </Box>
        ) : (
          <>
            {selectedChildData && (
              <Card sx={{ mb: 4, borderRadius: 3, backgroundColor: 'white', border: '1px solid #E8E6E1' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box sx={{ 
                      width: 80, height: 80, backgroundColor: '#5B7C99', 
                      borderRadius: '50%', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold'
                    }}>
                      {selectedChildData.label.charAt(0).toUpperCase()}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {selectedChildData.label}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#5B7C99', mb: 2 }}>
                        Level {currentLevel} • {totalXP} XP Total
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={levelProgress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards - shown under XP/Level and above charts */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingUp size={32} color="#8FA998" style={{ margin: '0 auto 12px' }} />
                  <Typography variant="h6" gutterBottom>Average Score</Typography>
                  <Typography variant="h2">{avgScore}</Typography>
                  <Typography variant="body2">Per session</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Award size={32} color="#C67B5C" style={{ margin: '0 auto 12px' }} />
                  <Typography variant="h6" gutterBottom>Best Score</Typography>
                  <Typography variant="h2">{bestScore}</Typography>
                  <Typography variant="body2">Highest achievement</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Calendar size={32} color="#5B7C99" style={{ margin: '0 auto 12px' }} />
                  <Typography variant="h6" gutterBottom>Practice Days</Typography>
                  <Typography variant="h2">{practiceDays}</Typography>
                  <Typography variant="body2">This month</Typography>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>Weekly Progress</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#8FA998" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>Activity Distribution</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={activityDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {activityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>Words Mastered</Typography>
                    <Typography variant="h2">
                      {summary?.progress?.Words_Learned || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>Current Streak</Typography>
                    <Typography variant="h2">
                      {summary?.progress?.Current_Streak || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ChildAnalytics;
