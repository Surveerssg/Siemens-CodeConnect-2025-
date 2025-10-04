import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Hospital, 
  TrendingUp, 
  Users, 
  Settings,
  LogOut,
  Play,
  Calendar,
  Star,
  Award,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logout successful, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    }
  };

  const assignedChildren = [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 8,
      avatar: '👧',
      level: 3,
      xp: 1250,
      streak: 5,
      lastSession: '2 hours ago',
      weeklyProgress: 85,
      totalWords: 45,
      averageScore: 78,
      phonemeAccuracy: {
        vowels: 85,
        consonants: 72,
        blends: 68
      },
      nextSession: '2024-01-22',
      status: 'active'
    },
    {
      id: 2,
      name: 'Liam Smith',
      age: 6,
      avatar: '👦',
      level: 2,
      xp: 890,
      streak: 3,
      lastSession: '1 day ago',
      weeklyProgress: 72,
      totalWords: 32,
      averageScore: 82,
      phonemeAccuracy: {
        vowels: 88,
        consonants: 75,
        blends: 45
      },
      nextSession: '2024-01-23',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sophia Davis',
      age: 7,
      avatar: '👧',
      level: 4,
      xp: 2100,
      streak: 8,
      lastSession: '3 hours ago',
      weeklyProgress: 92,
      totalWords: 67,
      averageScore: 89,
      phonemeAccuracy: {
        vowels: 92,
        consonants: 88,
        blends: 85
      },
      nextSession: '2024-01-21',
      status: 'excellent'
    }
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
    {
      title: 'View All Children',
      description: 'See all assigned children',
      icon: <Users size={40} color="#4ECDC4" />,
      color: '#4ECDC4',
      action: () => navigate('/therapist/children')
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: <TrendingUp size={40} color="#FF6B6B" />,
      color: '#FF6B6B',
      action: () => navigate('/therapist/analytics')
    },
    {
      title: 'Add Notes',
      description: 'Record session notes',
      icon: <Award size={40} color="#9B59B6" />,
      color: '#9B59B6',
      action: () => navigate('/therapist/notes')
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#4CAF50';
      case 'active': return '#4ECDC4';
      case 'needs_attention': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent Progress';
      case 'active': return 'Active';
      case 'needs_attention': return 'Needs Attention';
      default: return 'Unknown';
    }
  };

  return (
    <div className="floating-letters">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${Math.random() * 1.5 + 0.8}rem`
          }}
        >
          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
        </div>
      ))}
      
      <Container maxWidth="lg" sx={{ 
        minHeight: '100vh',
        position: 'relative',
        zIndex: 2,
        py: 4
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Welcome, Dr. {user?.displayName || 'Therapist'}! 👩‍⚕️
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Monitor and guide your patients' speech development
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<Settings size={20} />}
              onClick={() => navigate('/settings')}
              sx={{ color: '#4ECDC4' }}
            >
              Settings
            </Button>
            <Button
              startIcon={<LogOut size={20} />}
              onClick={handleLogout}
              sx={{ color: '#FF6B6B' }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} mb={4}>
          <Grid item xs={12} md={3}>
            <Card className="game-card" sx={{ 
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              textAlign: 'center',
              p: 3
            }}>
              <Typography variant="h6" gutterBottom>
                <Users size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Assigned Children
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                {assignedChildren.length}
              </Typography>
              <Typography variant="body2">
                Active patients
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#FF6B6B' }}>
                <TrendingUp size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Average Progress
              </Typography>
              <Typography variant="h2" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {Math.round(assignedChildren.reduce((sum, child) => sum + child.weeklyProgress, 0) / assignedChildren.length)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This week
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#9B59B6' }}>
                <Calendar size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Sessions Today
              </Typography>
              <Typography variant="h2" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled sessions
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#F39C12' }}>
                <AlertCircle size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Needs Attention
              </Typography>
              <Typography variant="h2" sx={{ color: '#F39C12', fontWeight: 'bold' }}>
                1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Children requiring focus
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h4" gutterBottom sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: 3
        }}>
          Assigned Children
        </Typography>

        <Grid container spacing={3} mb={4}>
          {assignedChildren.map((child) => (
            <Grid item xs={12} md={4} key={child.id}>
              <Card className="game-card" sx={{ 
                background: `linear-gradient(135deg, ${getStatusColor(child.status)}15, ${getStatusColor(child.status)}05)`,
                border: `2px solid ${getStatusColor(child.status)}30`
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        mr: 2,
                        fontSize: '2rem',
                        background: getStatusColor(child.status)
                      }}
                    >
                      {child.avatar}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {child.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Age {child.age} • Level {child.level}
                      </Typography>
                      <Chip
                        label={getStatusLabel(child.status)}
                        size="small"
                        sx={{ 
                          background: getStatusColor(child.status),
                          color: 'white',
                          fontWeight: 'bold',
                          mt: 1
                        }}
                      />
                    </Box>
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Weekly Progress</Typography>
                      <Typography variant="body2">{child.weeklyProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={child.weeklyProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(78, 205, 196, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          background: getStatusColor(child.status),
                          borderRadius: 4
                        }
                      }} 
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {child.streak}
                        </Typography>
                        <Typography variant="caption">
                          Day Streak
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {child.totalWords}
                        </Typography>
                        <Typography variant="caption">
                          Words
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {child.averageScore}%
                        </Typography>
                        <Typography variant="caption">
                          Avg Score
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Next session: {new Date(child.nextSession).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    startIcon={<Play size={16} />}
                    sx={{ 
                      color: getStatusColor(child.status),
                      fontWeight: 'bold'
                    }}
                    onClick={() => navigate('/therapist/analytics')}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" gutterBottom sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: 3
        }}>
          Weekly Progress Overview
        </Typography>

        <Card className="game-card" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#2C3E50',
              mb: 3
            }}>
              Daily Scores Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="emma" 
                  stroke="#4ECDC4" 
                  strokeWidth={3}
                  name="Emma"
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="liam" 
                  stroke="#FF6B6B" 
                  strokeWidth={3}
                  name="Liam"
                  dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sophia" 
                  stroke="#9B59B6" 
                  strokeWidth={3}
                  name="Sophia"
                  dot={{ fill: '#9B59B6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Typography variant="h4" gutterBottom sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: 3
        }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3} mb={4}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                className="game-card"
                onClick={action.action}
                sx={{ 
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
                  border: `2px solid ${action.color}30`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    border: `3px solid ${action.color}`,
                    boxShadow: `0 15px 35px ${action.color}30`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box mb={2}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: action.color,
                    fontWeight: 'bold'
                  }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    startIcon={<Play size={16} />}
                    sx={{ 
                      color: action.color,
                      fontWeight: 'bold'
                    }}
                  >
                    Go
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" gutterBottom sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: 3
        }}>
          Recent Activities
        </Typography>

        <Card className="game-card">
          <CardContent>
            <Box>
              {recentActivities.map((activity, index) => (
                <Box 
                  key={index}
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  p={2}
                  mb={1}
                  sx={{ 
                    background: 'rgba(78, 205, 196, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(78, 205, 196, 0.2)'
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      background: activity.child === 'Emma' ? '#4ECDC4' : 
                                 activity.child === 'Liam' ? '#FF6B6B' : '#9B59B6'
                    }}>
                      {activity.child === 'Emma' ? '👧' : 
                       activity.child === 'Liam' ? '👦' : '👧'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#2C3E50' }}>
                        {activity.child}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.activity}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">
                      {activity.time}
                    </Typography>
                    <Chip
                      label={activity.type}
                      size="small"
                      sx={{ 
                        background: activity.type === 'achievement' ? '#4CAF50' :
                                   activity.type === 'concern' ? '#FF9800' : '#2196F3',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default TherapistDashboard;
