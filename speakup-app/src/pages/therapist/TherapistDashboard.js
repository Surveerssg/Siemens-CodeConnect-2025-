import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import { 
  TrendingUp, 
  Users, 
  Settings,
  LogOut,
  Play,
  Calendar,
  AlertCircle,
  Award
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const assignedChildren = [
    { id: 1, name: 'Emma Johnson', age: 8, avatar: '👧', level: 3, xp: 1250, streak: 5, lastSession: '2 hours ago', weeklyProgress: 85, totalWords: 45, averageScore: 78, nextSession: '2024-01-22', status: 'active' },
    { id: 2, name: 'Liam Smith', age: 6, avatar: '👦', level: 2, xp: 890, streak: 3, lastSession: '1 day ago', weeklyProgress: 72, totalWords: 32, averageScore: 82, nextSession: '2024-01-23', status: 'active' },
    { id: 3, name: 'Sophia Davis', age: 7, avatar: '👧', level: 4, xp: 2100, streak: 8, lastSession: '3 hours ago', weeklyProgress: 92, totalWords: 67, averageScore: 89, nextSession: '2024-01-21', status: 'excellent' }
  ];

  const weeklyData = [
    { day: 'Mon', emma: 75, liam: 68, sophia: 88 },
    { day: 'Tue', emma: 82, liam: 74, sophia: 92 },
    { day: 'Wed', emma: 68, liam: 79, sophia: 85 },
    { day: 'Thu', emma: 91, liam: 85, sophia: 94 },
    { day: 'Fri', emma: 88, liam: 78, sophia: 90 },
    { day: 'Sat', emma: 95, liam: 92, sophia: 96 },
    { day: 'Sun', emma: 78, liam: 88, sophia: 89 }
  ];

  const recentActivities = [
    { child: 'Emma', activity: 'Completed advanced vowel exercises', time: '2 hours ago', type: 'progress' },
    { child: 'Liam', activity: 'Struggling with consonant blends', time: '1 day ago', type: 'concern' },
    { child: 'Sophia', activity: 'Achieved perfect score in Word Match', time: '3 hours ago', type: 'achievement' },
    { child: 'Emma', activity: 'Showed improvement in pronunciation', time: '2 days ago', type: 'progress' },
    { child: 'Liam', activity: 'Completed daily practice goal', time: '2 days ago', type: 'achievement' }
  ];

  const quickActions = [
    { title: 'View All Children', description: 'See all assigned children', icon: <Users size={40} color="#4ECDC4" />, color: '#4ECDC4', action: () => navigate('/therapist/children') },
    { title: 'Analytics', description: 'View detailed analytics', icon: <TrendingUp size={40} color="#FF6B6B" />, color: '#FF6B6B', action: () => navigate('/therapist/analytics') },
    { title: 'Add Notes', description: 'Record session notes', icon: <Award size={40} color="#9B59B6" />, color: '#9B59B6', action: () => navigate('/therapist/notes') }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#4CAF50';
      case 'active': return '#4ECDC4';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent Progress';
      case 'active': return 'Active';
      default: return 'Unknown';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
            Welcome, Dr. {user?.displayName || 'Therapist'}! 👩‍⚕️
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Monitor and guide your patients' speech development
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button startIcon={<Settings size={20} />} onClick={() => navigate('/settings')} sx={{ color: '#4ECDC4' }}>
            Settings
          </Button>
          <Button startIcon={<LogOut size={20} />} onClick={handleLogout} sx={{ color: '#FF6B6B' }}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Cards Row */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4ECDC4, #44A08D)', color: 'white', textAlign: 'center', p: 3 }}>
            <Typography variant="h6">Assigned Children</Typography>
            <Typography variant="h2">{assignedChildren.length}</Typography>
            <Typography>Active patients</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#FF6B6B' }}>Average Progress</Typography>
            <Typography variant="h2" sx={{ color: '#FF6B6B' }}>
              {Math.round(assignedChildren.reduce((sum, c) => sum + c.weeklyProgress, 0) / assignedChildren.length)}%
            </Typography>
            <Typography color="text.secondary">This week</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#9B59B6' }}>Sessions Today</Typography>
            <Typography variant="h2" sx={{ color: '#9B59B6' }}>3</Typography>
            <Typography color="text.secondary">Scheduled sessions</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#F39C12' }}>Needs Attention</Typography>
            <Typography variant="h2" sx={{ color: '#F39C12' }}>1</Typography>
            <Typography color="text.secondary">Children requiring focus</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Progress Chart */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
        Weekly Progress Overview
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Daily Scores Comparison</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="emma" stroke="#4ECDC4" strokeWidth={3} name="Emma" />
              <Line type="monotone" dataKey="liam" stroke="#FF6B6B" strokeWidth={3} name="Liam" />
              <Line type="monotone" dataKey="sophia" stroke="#9B59B6" strokeWidth={3} name="Sophia" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TherapistDashboard;
