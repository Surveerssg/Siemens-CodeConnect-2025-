import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { gamesAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  Mic, 
  Gamepad2, 
  Target, 
  TrendingUp,
  Play,
  Settings,
  LogOut,
  Flame,
  Trophy
} from 'lucide-react';

const getAchievementIcon = (type) => {
  const icons = {
    'FIRST_WORD': '🌟',
    'STREAK_3': '🔥',
    'PERFECT_SCORE': '⭐',
    'GAME_CHAMPION': '🏆',
    'PRACTICE_MASTER': '📚',
    'WORD_COLLECTOR': '🎯',
    'SUPER_LEARNER': '🎓',
    'DAILY_HERO': '💪',
    default: '🎉'
  };
  return icons[type] || icons.default;
};

const ChildDashboard = () => {
  const { user, userRole, logout } = useAuth();
  const { gameProgress, loading, refreshData } = useGame();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logout successful, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const quickActions = [
    {
      title: 'Practice Words',
      description: 'Start practicing with fun exercises!',
      icon: <Mic size={40} color="#5B7C99" />,
      color: '#5B7C99',
      action: () => navigate('/practice')
    },
    {
      title: 'Lip Sync',
      description: 'Practice speaking with visual lip-sync feedback',
      icon: <Mic size={40} color="#D26FA6" />,
      color: '#D26FA6',
      action: () => navigate('/lipsync')
    },
    {
      title: 'Play Games',
      description: 'Have fun while learning!',
      icon: <Gamepad2 size={40} color="#C67B5C" />,
      color: '#C67B5C',
      action: () => navigate('/games')
    },
    {
      title: 'My Progress',
      description: 'See how well you\'re doing!',
      icon: <TrendingUp size={40} color="#8FA998" />,
      color: '#8FA998',
      action: () => navigate('/progress')
    },
    {
      title: 'My Goals',
      description: 'Check your daily goals!',
      icon: <Target size={40} color="#5B7C99" />,
      color: '#5B7C99',
      action: () => navigate('/goals')
    }
  ];

  const [achievements, setAchievements] = useState([]);
  // Achievement templates (show locked ones as goals)
  const achievementTemplates = [
    { key: 'FIRST_GAME', name: 'First Game', description: 'Play your first game', icon: '🎮', condition: (ctx) => (ctx.gamesPlayed || 0) >= 1 },
    { key: 'SPEED_DEMON', name: 'Speed Demon', description: 'Complete 10 words in one session', icon: '⚡', condition: (ctx) => (ctx.history || []).some(h => (h.wordsPracticed || 0) >= 10) },
    { key: 'WEEK_WARRIOR', name: 'Week Warrior', description: 'Practiced every day this week', icon: '🏆', condition: (ctx) => (ctx.streakDays || 0) >= 7 },
    { key: 'CONSISTENCY_KING', name: 'Consistency King', description: '30 day practice streak', icon: '👑', condition: (ctx) => (ctx.streakDays || 0) >= 30 },
    { key: 'GAME_CHAMPION', name: 'Game Champion', description: 'Complete all games', icon: '🏆', condition: (ctx) => (ctx.completedGamesCount || 0) >= 3 }
  ];

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        // Fetch achievements and supporting data to evaluate locked goals
        const [achResp, historyResp, userGameResp] = await Promise.all([
          gamesAPI.getAchievements(),
          gamesAPI.getHistory(50, 0),
          gamesAPI.getGameData()
        ]);

        const existing = (achResp?.data || []);
        const history = (historyResp?.data || []);
        const userGame = userGameResp?.data || {};

        const existingMap = existing.reduce((acc, a) => {
          const key = a.achievementType || a.name;
          acc[key] = a;
          return acc;
        }, {});

        // helper context
        const completedGamesCount = history.reduce((count, h) => {
          if (h.score && h.score > 0) return count + 1;
          return count;
        }, 0);

        const ctx = {
          gamesPlayed: userGame.Games_Played || history.length || 0,
          history,
          streakDays: userGame.Longest_Streak || 0,
          completedGamesCount
        };

        const merged = achievementTemplates.map(t => {
          const exists = existingMap[t.key];
          const earned = !!exists || Boolean(t.condition(ctx));
          return {
            key: t.key,
            name: t.name,
            description: t.description,
            icon: getAchievementIcon(t.key) || t.icon,
            earned,
            date: exists?.timestamp || null
          };
        }).slice(0,4);

        setAchievements(merged);
      } catch (error) {
        console.error('Error loading achievements:', error);
        setAchievements([]);
      }
    };

    loadAchievements();
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#FAF8F5',
      position: 'relative'
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 5 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              color: '#3A3D42',
              fontWeight: 700,
              mb: 1,
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              Welcome back, {user?.displayName || 'Super Star'}! 🌟
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              fontWeight: 400
            }}>
              Ready for another amazing day of learning?
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<Settings size={20} />}
              onClick={() => navigate('/settings')}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: 'white',
                color: '#5B7C99',
                border: '1px solid #E8E6E1',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                px: 3,
                py: 1,
                '&:hover': { 
                  backgroundColor: '#F5F5F5',
                  borderColor: '#5B7C99',
                  boxShadow: '0 2px 8px rgba(91, 124, 153, 0.15)'
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
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                px: 3,
                py: 1,
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
        <Grid container spacing={3} mb={5}>
          {/* Level Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
              textAlign: 'center', 
              transition: 'all 0.3s ease', 
              backgroundColor: 'white',
              border: '1px solid #E8E6E1',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 3, 
                  backgroundColor: '#5B7C99', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '3rem',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(91, 124, 153, 0.2)'
                }}>
                  👶
                </Box>
                {loading ? (
                  <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#5B7C99' }}>
                    Loading...
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
                      color: '#5B7C99',
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      Level {gameProgress.currentLevel}
                    </Typography>
                    <Typography variant="body1" color="#3A3D42" mb={3} fontWeight={600} sx={{
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      {gameProgress.totalXP} XP Total
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(gameProgress.totalXP % 1000) / 10} 
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
                    <Typography variant="body2" color="#5B7C99" sx={{ mt: 2, fontWeight: 600 }}>
                      {1000 - (gameProgress.totalXP % 1000)} XP to next level
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Streak Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              backgroundColor: '#C67B5C', 
              color: 'white', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 24px rgba(198, 123, 92, 0.3)'
              }
            }}>
              <CardContent sx={{ p: 4, position: 'relative' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  fontSize: '6rem', 
                  opacity: 0.15
                }}>
                  🔥
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Flame size={28} color="white" />
                    <Typography variant="h5" fontWeight="700" sx={{
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      Current Streak
                    </Typography>
                  </Box>
                  {loading ? (
                    <Typography variant="h1" fontWeight="bold" mb={1} sx={{ fontSize: '3.5rem' }}>
                      ...
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h1" fontWeight="bold" mb={1} sx={{ 
                        fontSize: '3.5rem',
                        fontFamily: '"Outfit", "Inter", sans-serif'
                      }}>
                        {gameProgress.currentStreak}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.95, mb: 3 }}>
                        days in a row!
                      </Typography>
                      <Box sx={{ pt: 2.5, borderTop: '2px solid rgba(255,255,255,0.25)' }}>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                          Best streak: {gameProgress.bestStreak} days 🏆
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Badges Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              backgroundColor: '#8FA998', 
              color: 'white', 
              transition: 'all 0.3s ease', 
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 24px rgba(143, 169, 152, 0.3)'
              }
            }}>
              <CardContent sx={{ p: 4, position: 'relative' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  fontSize: '6rem', 
                  opacity: 0.15
                }}>
                  🏆
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Trophy size={28} color="white" />
                    <Typography variant="h5" fontWeight="700" sx={{
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      Recent Badges
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1.5} mb={3} mt={3}>
                    {gameProgress.badges.slice(0, 3).map((badge, index) => (
                      <Chip 
                        key={index} 
                        label={badge} 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.25)', 
                          color: 'white', 
                          fontWeight: 700, 
                          border: '1px solid rgba(255,255,255,0.4)', 
                          fontSize: '0.875rem',
                          py: 2.5,
                          borderRadius: 2
                        }} 
                      />
                    ))}
                  </Box>
                  <Box sx={{ pt: 2.5, borderTop: '2px solid rgba(255,255,255,0.25)' }}>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      {gameProgress.badges.length} badges earned ⭐
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h4" fontWeight="bold" gutterBottom mb={3} sx={{ 
          color: '#3A3D42',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}>
          Let's Play!
        </Typography>
        <Grid container spacing={3} mb={5}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                  <Typography variant="body2" color="#5B7C99" mb={2} sx={{
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2.5 }}>
                  <Button 
                    startIcon={<Play size={18} />} 
                    sx={{ 
                      color: action.color, 
                      fontWeight: 700, 
                      textTransform: 'none', 
                      fontSize: '1rem',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '&:hover': {
                        backgroundColor: `${action.color}10`
                      }
                    }}
                  >
                    Start
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Achievements */}
        <Typography variant="h4" fontWeight="bold" gutterBottom mb={3} sx={{ 
          color: '#3A3D42',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}>
          Your Achievements
        </Typography>
        <Grid container spacing={3}>
          {achievements.map((achievement, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
                opacity: achievement.earned ? 1 : 0.6, 
                backgroundColor: 'white', 
                color: achievement.earned ? '#3A3D42' : '#8FA998', 
                textAlign: 'center', 
                transition: 'all 0.3s ease',
                border: achievement.earned ? '2px solid #8FA998' : '1px solid #E8E6E1',
                '&:hover': { 
                  transform: 'scale(1.05)', 
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h1" sx={{ 
                    mb: 2, 
                    fontSize: '3rem', 
                    filter: achievement.earned ? 'none' : 'grayscale(100%)',
                    opacity: achievement.earned ? 1 : 0.5
                  }}>
                    {achievement.icon}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom sx={{
                    fontFamily: '"Outfit", "Inter", sans-serif'
                  }}>
                    {achievement.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8, 
                    fontWeight: 600,
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                    color: achievement.earned ? '#C67B5C' : '#8FA998'
                  }}>
                    {achievement.earned ? 'Earned!' : 'Keep trying!'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ChildDashboard;