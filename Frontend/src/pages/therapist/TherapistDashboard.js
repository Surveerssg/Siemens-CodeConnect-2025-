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
    { title: 'View All Children', description: 'See all assigned children', icon: <Users size={40} color="#5B7C99" />, color: '#5B7C99', action: () => navigate('/therapist/children') },
    { title: 'Analytics', description: 'View detailed analytics', icon: <TrendingUp size={40} color="#8FA998" />, color: '#8FA998', action: () => navigate('/therapist/analytics') },
    { title: 'Add Notes', description: 'Record session notes', icon: <Award size={40} color="#C67B5C" />, color: '#C67B5C', action: () => navigate('/therapist/notes') }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#8FA998';
      case 'active': return '#5B7C99';
      default: return '#E8E6E1';
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
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh', 
      py: 4,
      backgroundColor: '#FAF8F5'
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ 
            color: '#3A3D42', 
            fontWeight: 'bold',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 1
          }}>
            Welcome, Dr. {user?.displayName || 'Therapist'}! 👩‍⚕️
          </Typography>
          <Typography variant="h6" sx={{
            color: '#5B7C99',
            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            fontWeight: 400
          }}>
            Monitor and guide your patients' speech development
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button 
            startIcon={<Settings size={20} />} 
            onClick={() => navigate('/settings')} 
            variant="outlined"
            sx={{ 
              color: '#5B7C99',
              borderColor: '#E8E6E1',
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#F5F5F5',
                borderColor: '#5B7C99'
              }
            }}
          >
            Settings
          </Button>
          <Button 
            startIcon={<LogOut size={20} />} 
            onClick={handleLogout}
            variant="contained"
            sx={{ 
              backgroundColor: '#5B7C99',
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#4A677F',
                boxShadow: '0 4px 12px rgba(91, 124, 153, 0.3)'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: '#5B7C99', 
            color: 'white', 
            textAlign: 'center', 
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(91, 124, 153, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(91, 124, 153, 0.3)'
            }
          }}>
            <Typography variant="h6" sx={{
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 600,
              mb: 1
            }}>
              Assigned Children
            </Typography>
            <Typography variant="h2" sx={{
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 'bold',
              mb: 1
            }}>
              {assignedChildren.length}
            </Typography>
            <Typography sx={{
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              opacity: 0.9
            }}>
              Active patients
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            border: '1px solid #E8E6E1',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{ 
              color: '#8FA998',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 600,
              mb: 1
            }}>
              Average Progress
            </Typography>
            <Typography variant="h2" sx={{ 
              color: '#8FA998',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 'bold',
              mb: 1
            }}>
              {Math.round(assignedChildren.reduce((sum, c) => sum + c.weeklyProgress, 0) / assignedChildren.length)}%
            </Typography>
            <Typography sx={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              This week
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            border: '1px solid #E8E6E1',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{ 
              color: '#C67B5C',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 600,
              mb: 1
            }}>
              Sessions Today
            </Typography>
            <Typography variant="h2" sx={{ 
              color: '#C67B5C',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 'bold',
              mb: 1
            }}>3</Typography>
            <Typography sx={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Scheduled sessions
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            textAlign: 'center', 
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            border: '1px solid #E8E6E1',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{ 
              color: '#5B7C99',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 600,
              mb: 1
            }}>
              Needs Attention
            </Typography>
            <Typography variant="h2" sx={{ 
              color: '#5B7C99',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 'bold',
              mb: 1
            }}>1</Typography>
            <Typography sx={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Children requiring focus
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} mb={4}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              onClick={action.action} 
              sx={{ 
                cursor: 'pointer', 
                borderRadius: 3, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
                transition: 'all 0.3s ease', 
                backgroundColor: 'white',
                border: '1px solid #E8E6E1',
                '&:hover': { 
                  transform: 'translateY(-6px)', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  width: 70, 
                  height: 70, 
                  mx: 'auto', 
                  mb: 2, 
                  backgroundColor: '#FAF8F5', 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: `2px solid ${action.color}20`,
                  transition: 'transform 0.3s ease', 
                  '&:hover': { 
                    transform: 'scale(1.05)',
                    backgroundColor: `${action.color}10`
                  } 
                }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                  color: '#3A3D42',
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}>
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Weekly Progress Chart */}
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Weekly Progress Overview
      </Typography>
      <Card sx={{ 
        mb: 4,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        backgroundColor: 'white',
        border: '1px solid #E8E6E1'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{
            color: '#3A3D42',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 600,
            mb: 3
          }}>
            Daily Scores Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
              <XAxis 
                dataKey="day" 
                stroke="#5B7C99"
                tick={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', fill: '#5B7C99' }}
              />
              <YAxis 
                stroke="#5B7C99"
                tick={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', fill: '#5B7C99' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 8,
                  border: '1px solid #E8E6E1',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}
              />
              <Line type="monotone" dataKey="emma" stroke="#5B7C99" strokeWidth={3} name="Emma" />
              <Line type="monotone" dataKey="liam" stroke="#8FA998" strokeWidth={3} name="Liam" />
              <Line type="monotone" dataKey="sophia" stroke="#C67B5C" strokeWidth={3} name="Sophia" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Recent Activities
      </Typography>
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        backgroundColor: 'white',
        border: '1px solid #E8E6E1'
      }}>
        <CardContent sx={{ p: 3 }}>
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
                  backgroundColor: '#FAF8F5',
                  borderRadius: 2,
                  border: '1px solid #E8E6E1',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: activity.type === 'concern' ? '#FFE8E8' : 
                                   activity.type === 'achievement' ? '#E8F5E8' : '#E8F0F8',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {activity.type === 'concern' ? '⚠️' : activity.type === 'achievement' ? '⭐' : '📈'}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      color: '#3A3D42',
                      fontFamily: '"Outfit", "Inter", sans-serif',
                      fontWeight: 600
                    }}>
                      {activity.child}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#5B7C99',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      {activity.activity}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{
                  color: '#8FA998',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  fontWeight: 600
                }}>
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TherapistDashboard;