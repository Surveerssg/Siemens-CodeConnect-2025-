import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI, gamesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load current child's progress (the logged-in user)
  useEffect(() => {
    const loadSummary = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // fetch progress and games data in parallel so we can compute Total_XP correctly
        const [progressRes, gamesRes] = await Promise.all([
          progressAPI.getProgress(),
          gamesAPI.getGameData()
        ]);

        // Both endpoints return { success: true, data: { ... } }
        const progressData = progressRes?.data || progressRes || null;
        const gamesData = gamesRes?.data || gamesRes || null;

        // Normalize to same shape parent page expects: { progress, games }
        setSummary({ progress: progressData, games: gamesData });
      } catch (e) {
        console.error('Failed to load progress/games summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [user]);

  // Mock data for charts (replace with actual from summary if available)
  // Use values from summary when available; fallback to mock data
  const weeklyProgressData = summary?.weeklyProgress || [
    { day: 'Mon', score: 75, words: 12 },
    { day: 'Tue', score: 82, words: 15 },
    { day: 'Wed', score: 68, words: 10 },
    { day: 'Thu', score: 91, words: 18 },
    { day: 'Fri', score: 88, words: 16 },
    { day: 'Sat', score: 95, words: 20 },
    { day: 'Sun', score: 78, words: 14 }
  ];

  const activityDistribution = summary?.activityDistribution || [
    { name: 'Practice', value: 60, color: '#8FA998' },
    { name: 'Games', value: 25, color: '#5B7C99' },
    { name: 'Assessments', value: 15, color: '#C67B5C' }
  ];

  // Stats calculations
  // Calculate stats from summary data (align with parent page logic)
  const totalXP = Number(summary?.games?.Total_XP || summary?.totalXP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || summary?.practiceDays || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = summary?.games?.Best_Score || summary?.bestScore || totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;
  const selectedChildData = user ? { label: user.displayName || user.email || user.uid } : null;

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/parent')}
            sx={{ color: '#5B7C99', mr: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ color: '#3A3D42', fontWeight: 'bold' }}>
            Progress Tracking 📈
          </Typography>
        </Box>

        {/* Child Selector */}
          {/* No selector for child page — show current user's data */}

        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography>Loading progress data...</Typography>
          </Box>
        ) : (
          <>
            {/* Level Progress Card */}
            {selectedChildData && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#5B7C99', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                      {selectedChildData.label.charAt(0).toUpperCase()}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="h5">{selectedChildData.label}</Typography>
                      <Typography variant="h6">Level {currentLevel} • {totalXP} XP Total</Typography>
                      <LinearProgress variant="determinate" value={levelProgress} sx={{ height: 8, borderRadius: 4 }} />
                      <Typography variant="body2">{1000 - (totalXP % 1000)} XP to Level {currentLevel + 1}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
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

            {/* Charts Section */}
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
                  <CardContent sx={{ textAlign: 'center' }}>
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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

export default Progress;
