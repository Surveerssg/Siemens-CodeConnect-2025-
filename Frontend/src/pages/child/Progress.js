import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { progressAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  Target,
  Calendar,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

const Progress = () => {
  const { gameProgress } = useGame();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const [currentProgress, history] = await Promise.all([
        progressAPI.getProgress(),
        progressAPI.getHistory(7, 0)
      ]);

      setProgressData(currentProgress.data);
      setProgressHistory(history.data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyStats = progressData ? {
    totalWords: progressData.Words_This_Week || 0,
    averageScore: Math.round(progressData.Average_Score || 0),
    bestScore: Math.round(progressData.Best_Score || 0),
    practiceDays: progressData.Practice_Days || 0
  } : {
    totalWords: 0,
    averageScore: 0,
    bestScore: 0,
    practiceDays: 0
  };

  // Convert history data to chart format
  const mockProgressData = progressHistory.slice(0, 7).map((session, index) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index] || `Day ${index + 1}`,
    score: session.score || 0,
    words: session.wordsPracticed || 0
  }));

  const achievements = [
    { name: 'First Word Master', description: 'Completed your first word!', icon: '🌟', earned: true, date: '2024-01-15' },
    { name: '3 Day Streak', description: 'Practiced for 3 days in a row!', icon: '🔥', earned: true, date: '2024-01-18' },
    { name: 'Perfect Score', description: 'Got a perfect 100% score!', icon: '⭐', earned: true, date: '2024-01-20' },
    { name: 'Week Warrior', description: 'Practiced every day this week!', icon: '🏆', earned: false, date: null },
    { name: 'Speed Demon', description: 'Completed 10 words in one session!', icon: '⚡', earned: false, date: null },
    { name: 'Consistency King', description: '30 day practice streak!', icon: '👑', earned: false, date: null }
  ];

  const recentActivities = [
    { word: 'Apple', score: 95, time: '2 hours ago', stars: 5 },
    { word: 'Ball', score: 78, time: '1 day ago', stars: 4 },
    { word: 'Cat', score: 88, time: '1 day ago', stars: 4 },
    { word: 'Dog', score: 92, time: '2 days ago', stars: 5 },
    { word: 'Elephant', score: 65, time: '3 days ago', stars: 3 }
  ];

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/dashboard')}
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
            My Progress 📈
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
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
              <Target size={32} color="#5B7C99" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#5B7C99',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600
              }}>
                Words This Week
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#5B7C99', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {weeklyStats.totalWords}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                Great job!
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
              <TrendingUp size={32} color="#8FA998" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#8FA998',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600
              }}>
                Average Score
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#8FA998', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {weeklyStats.averageScore}%
              </Typography>
              <Typography variant="body2" sx={{
                color: '#8FA998',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                Keep it up!
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
              <Star size={32} color="#C67B5C" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#C67B5C',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600
              }}>
                Best Score
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#C67B5C', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {weeklyStats.bestScore}%
              </Typography>
              <Typography variant="body2" sx={{
                color: '#C67B5C',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                Amazing!
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
              <Calendar size={32} color="#5B7C99" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#5B7C99',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600
              }}>
                Practice Days
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#5B7C99', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {weeklyStats.practiceDays}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                This week
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backgroundColor: 'white',
              border: '1px solid #E8E6E1'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#3A3D42',
                  fontWeight: 'bold',
                  mb: 3,
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}>
                  Weekly Progress
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockProgressData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8FA998" 
                      strokeWidth={3}
                      dot={{ fill: '#8FA998', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#C67B5C' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backgroundColor: 'white',
              border: '1px solid #E8E6E1'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#3A3D42',
                  fontWeight: 'bold',
                  mb: 3,
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}>
                  Words Per Day
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockProgressData}>
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
                    <Bar 
                      dataKey="words" 
                      fill="#C67B5C" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activities & Achievements */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backgroundColor: 'white',
              border: '1px solid #E8E6E1'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#3A3D42',
                  fontWeight: 'bold',
                  mb: 3,
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}>
                  Recent Activities
                </Typography>
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
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: '#3A3D42',
                          fontFamily: '"Outfit", "Inter", sans-serif',
                          fontWeight: 600
                        }}>
                          {activity.word}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: '#5B7C99',
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                        }}>
                          {activity.time}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" sx={{ 
                          color: '#8FA998',
                          fontFamily: '"Outfit", "Inter", sans-serif',
                          fontWeight: 600
                        }}>
                          {activity.score}%
                        </Typography>
                        <Box display="flex" gap={0.5}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              style={{ 
                                color: i < activity.stars ? '#C67B5C' : '#E8E6E1',
                                fill: i < activity.stars ? '#C67B5C' : 'none'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backgroundColor: 'white',
              border: '1px solid #E8E6E1'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#3A3D42',
                  fontWeight: 'bold',
                  mb: 3,
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}>
                  Achievements
                </Typography>
                <Box>
                  {achievements.map((achievement, index) => (
                    <Box 
                      key={index}
                      display="flex" 
                      alignItems="center"
                      p={2}
                      mb={1}
                      sx={{ 
                        backgroundColor: achievement.earned ? '#FAF8F5' : '#F8F8F8',
                        borderRadius: 2,
                        border: `2px solid ${achievement.earned ? '#8FA998' : '#E8E6E1'}`,
                        opacity: achievement.earned ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Typography variant="h4" sx={{ mr: 2, fontSize: '2.5rem' }}>
                        {achievement.icon}
                      </Typography>
                      <Box flexGrow={1}>
                        <Typography variant="h6" sx={{ 
                          color: achievement.earned ? '#3A3D42' : '#5B7C99',
                          fontFamily: '"Outfit", "Inter", sans-serif',
                          fontWeight: 600
                        }}>
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: achievement.earned ? '#5B7C99' : '#8FA998',
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                        }}>
                          {achievement.description}
                        </Typography>
                        {achievement.earned && achievement.date && (
                          <Typography variant="caption" sx={{
                            color: '#C67B5C',
                            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                            fontWeight: 600
                          }}>
                            Earned on {new Date(achievement.date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      {achievement.earned && (
                        <Award size={20} color="#8FA998" />
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Level Progress */}
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: '#3A3D42',
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center',
              fontFamily: '"Outfit", "Inter", sans-serif'
            }}>
              Level Progress
            </Typography>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6" sx={{
                  color: '#5B7C99',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 600
                }}>
                  Level {gameProgress.currentLevel}
                </Typography>
                <Typography variant="h6" sx={{
                  color: '#5B7C99',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 600
                }}>
                  {gameProgress.totalXP} XP
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(gameProgress.totalXP % 1000) / 10} 
                sx={{ 
                  height: 16, 
                  borderRadius: 8,
                  backgroundColor: '#E8E6E1',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#8FA998',
                    borderRadius: 8
                  }
                }} 
              />
              <Typography variant="body2" sx={{ 
                mt: 1, 
                textAlign: 'center',
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 600
              }}>
                {1000 - (gameProgress.totalXP % 1000)} XP to Level {gameProgress.currentLevel + 1}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Progress;