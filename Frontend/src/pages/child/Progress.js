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
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      position: 'relative',
      py: 4
    }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold'
        }}>
          My Progress 📈
        </Typography>
      </Box>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FF6B6B' }}>
              <Target size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Words This Week
            </Typography>
            <Typography variant="h2" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
              {weeklyStats.totalWords}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Great job!
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>
              <TrendingUp size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Average Score
            </Typography>
            <Typography variant="h2" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              {weeklyStats.averageScore}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep it up!
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9B59B6' }}>
              <Star size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Best Score
            </Typography>
            <Typography variant="h2" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
              {weeklyStats.bestScore}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amazing!
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#F39C12' }}>
              <Calendar size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Practice Days
            </Typography>
            <Typography variant="h2" sx={{ color: '#F39C12', fontWeight: 'bold' }}>
              {weeklyStats.practiceDays}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This week
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
              }}>
                Weekly Progress
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
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
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
              }}>
                Words Per Day
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="words" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
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
                      background: 'rgba(78, 205, 196, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(78, 205, 196, 0.2)'
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ color: '#2C3E50' }}>
                        {activity.word}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" sx={{ color: '#4ECDC4' }}>
                        {activity.score}%
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            style={{ 
                              color: i < activity.stars ? '#FFD700' : '#E0E0E0' 
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
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
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
                      background: achievement.earned 
                        ? 'rgba(255, 215, 0, 0.1)' 
                        : 'rgba(224, 224, 224, 0.1)',
                      borderRadius: 2,
                      border: `1px solid ${achievement.earned 
                        ? 'rgba(255, 215, 0, 0.3)' 
                        : 'rgba(224, 224, 224, 0.3)'}`,
                      opacity: achievement.earned ? 1 : 0.6
                    }}
                  >
                    <Typography variant="h4" sx={{ mr: 2 }}>
                      {achievement.icon}
                    </Typography>
                    <Box flexGrow={1}>
                      <Typography variant="h6" sx={{ 
                        color: achievement.earned ? '#2C3E50' : '#9E9E9E'
                      }}>
                        {achievement.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                      {achievement.earned && achievement.date && (
                        <Typography variant="caption" color="text.secondary">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    {achievement.earned && (
                      <Award size={20} color="#FFD700" />
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold',
            mb: 3,
            textAlign: 'center'
          }}>
            Level Progress
          </Typography>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Level {gameProgress.currentLevel}</Typography>
              <Typography variant="h6">{gameProgress.totalXP} XP</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(gameProgress.totalXP % 1000) / 10} 
              sx={{ 
                height: 20, 
                borderRadius: 10,
                backgroundColor: 'rgba(78, 205, 196, 0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4ECDC4, #44A08D)',
                  borderRadius: 10
                }
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {1000 - (gameProgress.totalXP % 1000)} XP to Level {gameProgress.currentLevel + 1}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Progress;