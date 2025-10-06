import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parentAPI, goalsAPI } from '../../services/api';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Button, LinearProgress, CardActions 
} from '@mui/material';
import { ArrowLeft, TrendingUp, Target, Award, Play, Calendar, Star, Users } from 'lucide-react';

const ChildDetail = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.getChildSummary(childId);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId]);

  // Mock data for recent activities and progress
  const recentActivities = [
    { activity: 'Completed vowel exercises', time: '2 hours ago', score: 95, type: 'practice' },
    { activity: 'Played Word Match game', time: '1 day ago', score: 88, type: 'game' },
    { activity: 'Achieved 3-day streak', time: '2 days ago', score: 100, type: 'achievement' },
    { activity: 'Practiced consonant blends', time: '3 days ago', score: 78, type: 'practice' }
  ];

  const progressData = [
    { day: 'Mon', score: 75, words: 12 },
    { day: 'Tue', score: 82, words: 15 },
    { day: 'Wed', score: 68, words: 10 },
    { day: 'Thu', score: 91, words: 18 },
    { day: 'Fri', score: 88, words: 16 },
    { day: 'Sat', score: 95, words: 20 },
    { day: 'Sun', score: 78, words: 14 }
  ];

  const quickActions = [
    { 
      title: 'View Progress', 
      description: 'See detailed progress reports', 
      icon: <TrendingUp size={32} color="#5B7C99" />, 
      color: '#5B7C99', 
      action: () => navigate('/parent/progress') 
    },
    { 
      title: 'Set Goals', 
      description: 'Assign practice goals', 
      icon: <Target size={32} color="#8FA998" />, 
      color: '#8FA998', 
      action: () => navigate('/parent/goals') 
    },
    { 
      title: 'Add Notes', 
      description: 'Record observations', 
      icon: <Award size={32} color="#C67B5C" />, 
      color: '#C67B5C', 
      action: () => navigate('/parent/notes') 
    }
  ];

  // Calculate stats from summary data
  const totalXP = Number(summary?.games?.Total_XP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;

  return (
   <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
  <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Button 
          startIcon={<ArrowLeft size={20} />} 
          onClick={() => navigate('/parent')} 
          sx={{ 
            color: '#5B7C99', 
            mr: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            '&:hover': {
              backgroundColor: '#E8E6E1'
            }
          }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ 
          color: '#3A3D42', 
          fontWeight: 'bold',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}>
          Child Overview
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Typography variant="h5" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Weekly Progress Overview
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        {/* Level Progress Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
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
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2, 
                backgroundColor: '#5B7C99', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                {currentLevel}
              </Box>
              <Typography variant="h6" sx={{ 
                color: '#5B7C99',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600,
                mb: 1
              }}>
                Level {currentLevel}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                mb: 2
              }}>
                {totalXP} XP Total
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={levelProgress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: '#E8E6E1',
                  '& .MuiLinearProgress-bar': { 
                    backgroundColor: '#8FA998',
                    borderRadius: 4
                  }
                }} 
              />
              <Typography variant="body2" sx={{ 
                mt: 1, 
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 600
              }}>
                {1000 - (totalXP % 1000)} XP to next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 2,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                backgroundColor: 'white',
                border: '1px solid #E8E6E1',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }
              }}>
                <TrendingUp size={24} color="#8FA998" style={{ margin: '0 auto 8px' }} />
                <Typography variant="body2" sx={{
                  color: '#8FA998',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Average Score
                </Typography>
                <Typography variant="h4" sx={{ 
                  color: '#8FA998',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 'bold'
                }}>
                  {avgScore}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 2,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                backgroundColor: 'white',
                border: '1px solid #E8E6E1',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }
              }}>
                <Star size={24} color="#C67B5C" style={{ margin: '0 auto 8px' }} />
                <Typography variant="body2" sx={{
                  color: '#C67B5C',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Best Score
                </Typography>
                <Typography variant="h4" sx={{ 
                  color: '#C67B5C',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 'bold'
                }}>
                  {bestScore}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 2,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                backgroundColor: 'white',
                border: '1px solid #E8E6E1',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }
              }}>
                <Calendar size={24} color="#5B7C99" style={{ margin: '0 auto 8px' }} />
                <Typography variant="body2" sx={{
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Practice Days
                </Typography>
                <Typography variant="h4" sx={{ 
                  color: '#5B7C99',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 'bold'
                }}>
                  {practiceDays}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} mb={4}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              onClick={action.action} 
              sx={{ 
                cursor: 'pointer', 
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                backgroundColor: 'white',
                border: '1px solid #E8E6E1',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-6px)', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
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
                    transform: 'scale(1.1)',
                    backgroundColor: `${action.color}10`
                  } 
                }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" sx={{ 
                  color: '#3A3D42',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 600,
                  mb: 1
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

      {/* Recent Activities */}
      <Typography variant="h5" gutterBottom sx={{ 
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
          {recentActivities.length === 0 ? (
            <Typography variant="body2" sx={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              textAlign: 'center',
              py: 2
            }}>
              No recent activities yet.
            </Typography>
          ) : (
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
                      backgroundColor: activity.type === 'achievement' ? '#E8F5E8' : 
                                     activity.type === 'game' ? '#E8F0F8' : '#FFE8E8',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {activity.type === 'achievement' ? '⭐' : activity.type === 'game' ? '🎮' : '📝'}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        color: '#3A3D42',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}>
                        {activity.activity}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#5B7C99',
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                      }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: '#8FA998',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontWeight: 600
                  }}>
                    {activity.score}%
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
    </Box>
  );
};

export default ChildDetail;