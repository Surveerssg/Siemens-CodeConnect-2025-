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
  Chip
} from '@mui/material';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Settings,
  LogOut,
  Play,
  Calendar,
  Star,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const children = [
    {
      id: 1,
      name: 'Emma',
      age: 8,
      avatar: '👧',
      level: 3,
      xp: 1250,
      streak: 5,
      lastPractice: '2 hours ago',
      weeklyProgress: 85,
      totalWords: 45,
      averageScore: 78
    },
    {
      id: 2,
      name: 'Liam',
      age: 6,
      avatar: '👦',
      level: 2,
      xp: 890,
      streak: 3,
      lastPractice: '1 day ago',
      weeklyProgress: 72,
      totalWords: 32,
      averageScore: 82
    }
  ];

  const weeklyData = [
    { day: 'Mon', emma: 75, liam: 68 },
    { day: 'Tue', emma: 82, liam: 74 },
    { day: 'Wed', emma: 68, liam: 79 },
    { day: 'Thu', emma: 91, liam: 85 },
    { day: 'Fri', emma: 88, liam: 78 },
    { day: 'Sat', emma: 95, liam: 92 },
    { day: 'Sun', emma: 78, liam: 88 }
  ];

  const recentActivities = [
    { child: 'Emma', activity: 'Completed Word Match game', time: '2 hours ago', xp: 25 },
    { child: 'Liam', activity: 'Practiced 5 words', time: '1 day ago', xp: 50 },
    { child: 'Emma', activity: 'Earned Perfect Score badge', time: '2 days ago', xp: 100 },
    { child: 'Liam', activity: 'Completed Balloon Pop game', time: '3 days ago', xp: 30 },
    { child: 'Emma', activity: 'Achieved 5-day streak', time: '4 days ago', xp: 75 }
  ];

  const quickActions = [
    {
      title: 'View Progress',
      description: 'See detailed progress reports',
      icon: <TrendingUp size={40} color="#4ECDC4" />,
      color: '#4ECDC4',
      action: () => navigate('/parent/progress')
    },
    {
      title: 'Set Goals',
      description: 'Assign practice goals',
      icon: <Target size={40} color="#FF6B6B" />,
      color: '#FF6B6B',
      action: () => navigate('/parent/goals')
    },
    {
      title: 'Add Notes',
      description: 'Record observations',
      icon: <Award size={40} color="#9B59B6" />,
      color: '#9B59B6',
      action: () => navigate('/parent/notes')
    }
  ];

  return (
    <div className="floating-letters">
      {[...Array(12)].map((_, i) => (
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
              Welcome, {user?.displayName || 'Parent'}! 👨‍👩‍👧‍👦
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Track your children's speech progress
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

        <Typography variant="h4" gutterBottom sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: 3
        }}>
          Your Children
        </Typography>

        <Grid container spacing={4} mb={4}>
          {children.map((child) => (
            <Grid item xs={12} md={6} key={child.id}>
              <Card className="game-card" sx={{ 
                background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                color: 'white'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mr: 3,
                        fontSize: '3rem',
                        background: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      {child.avatar}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {child.name}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Age {child.age} • Level {child.level}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Last practice: {child.lastPractice}
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{child.weeklyProgress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={child.weeklyProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
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
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    startIcon={<Play size={16} />}
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                    onClick={() => navigate('/parent/progress')}
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
              Daily Scores
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
                      background: activity.child === 'Emma' ? '#4ECDC4' : '#FF6B6B'
                    }}>
                      {activity.child === 'Emma' ? '👧' : '👦'}
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
                      label={`+${activity.xp} XP`}
                      size="small"
                      sx={{ 
                        background: '#4ECDC4',
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

export default ParentDashboard;
