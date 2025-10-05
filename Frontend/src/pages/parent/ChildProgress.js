import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [selectedChild, setSelectedChild] = useState('emma');
  const [timeRange, setTimeRange] = useState('week');

  const children = [
    { value: 'emma', label: 'Emma (8 years old)' },
    { value: 'liam', label: 'Liam (6 years old)' }
  ];

  const timeRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const progressData = {
    emma: {
      weekly: [
        { day: 'Mon', score: 75, words: 3, time: 15 },
        { day: 'Tue', score: 82, words: 4, time: 20 },
        { day: 'Wed', score: 68, words: 2, time: 12 },
        { day: 'Thu', score: 91, words: 5, time: 25 },
        { day: 'Fri', score: 88, words: 4, time: 18 },
        { day: 'Sat', score: 95, words: 6, time: 30 },
        { day: 'Sun', score: 78, words: 3, time: 16 }
      ],
      monthly: [
        { week: 'Week 1', score: 78, words: 20, time: 120 },
        { week: 'Week 2', score: 82, words: 25, time: 150 },
        { week: 'Week 3', score: 85, words: 28, time: 165 },
        { week: 'Week 4', score: 88, words: 30, time: 180 }
      ],
      stats: {
        totalWords: 103,
        averageScore: 83,
        totalTime: 615,
        streak: 5,
        level: 3,
        xp: 1250
      }
    },
    liam: {
      weekly: [
        { day: 'Mon', score: 68, words: 2, time: 10 },
        { day: 'Tue', score: 74, words: 3, time: 15 },
        { day: 'Wed', score: 79, words: 4, time: 18 },
        { day: 'Thu', score: 85, words: 5, time: 22 },
        { day: 'Fri', score: 78, words: 3, time: 16 },
        { day: 'Sat', score: 92, words: 6, time: 28 },
        { day: 'Sun', score: 88, words: 4, time: 20 }
      ],
      monthly: [
        { week: 'Week 1', score: 72, words: 15, time: 90 },
        { week: 'Week 2', score: 78, words: 18, time: 110 },
        { week: 'Week 3', score: 82, words: 22, time: 130 },
        { week: 'Week 4', score: 85, words: 25, time: 145 }
      ],
      stats: {
        totalWords: 80,
        averageScore: 80,
        totalTime: 475,
        streak: 3,
        level: 2,
        xp: 890
      }
    }
  };

  const currentData = progressData[selectedChild][timeRange];
  const currentStats = progressData[selectedChild].stats;

  const pieData = [
    { name: 'Excellent (90-100%)', value: 25, color: '#4CAF50' },
    { name: 'Good (70-89%)', value: 45, color: '#8BC34A' },
    { name: 'Fair (50-69%)', value: 20, color: '#FFC107' },
    { name: 'Needs Work (0-49%)', value: 10, color: '#F44336' }
  ];

  const achievements = [
    { name: 'First Word Master', description: 'Completed first word practice', earned: true, date: '2024-01-15' },
    { name: '3 Day Streak', description: 'Practiced for 3 consecutive days', earned: true, date: '2024-01-18' },
    { name: 'Perfect Score', description: 'Achieved 100% accuracy', earned: true, date: '2024-01-20' },
    { name: 'Week Warrior', description: 'Practiced every day this week', earned: false, date: null },
    { name: 'Speed Demon', description: 'Completed 10 words in one session', earned: false, date: null }
  ];

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
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              sx={{ borderRadius: 3 }}
            >
              {timeRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={3}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FF6B6B' }}>
              <Target size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Total Words
            </Typography>
            <Typography variant="h2" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
              {currentStats.totalWords}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Words practiced
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>
              <TrendingUp size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Average Score
            </Typography>
            <Typography variant="h2" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              {currentStats.averageScore}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall accuracy
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9B59B6' }}>
              <Calendar size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Total Time
            </Typography>
            <Typography variant="h2" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
              {Math.floor(currentStats.totalTime / 60)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Practice time
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#F39C12' }}>
              <Star size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Current Streak
            </Typography>
            <Typography variant="h2" sx={{ color: '#F39C12', fontWeight: 'bold' }}>
              {currentStats.streak}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Days in a row
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={8}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Score Progress
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4ECDC4" 
                    strokeWidth={3}
                    dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Score Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Words Per Day
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="words" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Practice Time
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="time" fill="#9B59B6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h4" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
        Achievements
      </Typography>

      <Grid container spacing={2}>
        {achievements.map((achievement, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              className="game-card"
              sx={{ 
                opacity: achievement.earned ? 1 : 0.6,
                background: achievement.earned 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : 'linear-gradient(135deg, #E0E0E0, #BDBDBD)',
                color: 'white'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {achievement.earned ? '🏆' : '🔒'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {achievement.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  {achievement.description}
                </Typography>
                {achievement.earned && achievement.date && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                    Earned: {new Date(achievement.date).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ChildProgress;
