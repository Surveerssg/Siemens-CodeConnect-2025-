import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
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
  Mic, 
  Gamepad2, 
  Target, 
  TrendingUp, 
  Star, 
  Trophy,
  Play,
  Settings,
  LogOut
} from 'lucide-react';

const ChildDashboard = () => {
  const { user, userRole } = useAuth();
  const { gameProgress } = useGame();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Practice Words',
      description: 'Start practicing with fun exercises!',
      icon: <Mic size={40} color="#FF6B6B" />,
      color: '#FF6B6B',
      action: () => navigate('/practice')
    },
    {
      title: 'Play Games',
      description: 'Have fun while learning!',
      icon: <Gamepad2 size={40} color="#4ECDC4" />,
      color: '#4ECDC4',
      action: () => navigate('/games')
    },
    {
      title: 'My Progress',
      description: 'See how well you\'re doing!',
      icon: <TrendingUp size={40} color="#9B59B6" />,
      color: '#9B59B6',
      action: () => navigate('/progress')
    },
    {
      title: 'My Goals',
      description: 'Check your daily goals!',
      icon: <Target size={40} color="#F39C12" />,
      color: '#F39C12',
      action: () => navigate('/goals')
    }
  ];

  const recentAchievements = [
    { name: 'First Word Master', icon: '🌟', earned: true },
    { name: '3 Day Streak', icon: '🔥', earned: true },
    { name: 'Perfect Score', icon: '⭐', earned: false },
    { name: 'Game Champion', icon: '🏆', earned: false }
  ];

  return (
    <div className="floating-letters">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${Math.random() * 2 + 1}rem`
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
              Welcome back, {user?.displayName || 'Super Star'}! 🌟
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Ready for another amazing day of learning?
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
          <Grid item xs={12} md={4}>
            <Card className="game-card" sx={{ 
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              textAlign: 'center'
            }}>
              <CardContent>
                <Avatar 
                  className="avatar excited"
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    fontSize: '4rem',
                    background: 'rgba(255,255,255,0.2)'
                  }}
                >
                  👶
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Level {gameProgress.currentLevel}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {gameProgress.totalXP} XP Total
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(gameProgress.totalXP % 1000) / 10} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white'
                    }
                  }} 
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {1000 - (gameProgress.totalXP % 1000)} XP to next level
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B6B' }}>
                  🔥 Current Streak
                </Typography>
                <Typography variant="h2" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                  {gameProgress.currentStreak}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  days in a row!
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Best streak: {gameProgress.bestStreak} days
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>
                  🏆 Recent Badges
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {gameProgress.badges.slice(0, 3).map((badge, index) => (
                    <Chip
                      key={index}
                      label={badge}
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {gameProgress.badges.length} badges earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h4" gutterBottom sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          mb: 3
        }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3} mb={4}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    Start
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
          Recent Achievements
        </Typography>

        <Grid container spacing={2}>
          {recentAchievements.map((achievement, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    {achievement.icon}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {achievement.name}
                  </Typography>
                  <Typography variant="caption">
                    {achievement.earned ? 'Earned!' : 'Keep trying!'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default ChildDashboard;
