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
      icon: <Mic size={40} color="#FF6B6B" />,
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      action: () => navigate('/practice')
    },
    {
      title: 'Play Games',
      description: 'Have fun while learning!',
      icon: <Gamepad2 size={40} color="#4ECDC4" />,
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => navigate('/games')
    },
    {
      title: 'My Progress',
      description: 'See how well you\'re doing!',
      icon: <TrendingUp size={40} color="#9B59B6" />,
      color: '#9B59B6',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      action: () => navigate('/progress')
    },
    {
      title: 'My Goals',
      description: 'Check your daily goals!',
      icon: <Target size={40} color="#F39C12" />,
      color: '#F39C12',
      gradient: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative'
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 5 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              color: 'white',
              fontWeight: 800,
              mb: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              Welcome back, {user?.displayName || 'Super Star'}! 🌟
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)' }}>
              Ready for another amazing day of learning?
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<Settings size={20} />}
              onClick={() => navigate('/settings')}
              variant="contained"
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' }
              }}
            >
              Settings
            </Button>
            <Button
              startIcon={<LogOut size={20} />}
              onClick={handleLogout}
              variant="contained"
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' }
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
            <Card sx={{ borderRadius: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', textAlign: 'center', transition: 'all 0.3s ease', background: 'white', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 15px 50px rgba(0,0,0,0.25)' }}}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ width: 110, height: 110, mx: 'auto', mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)' }}>
                  👶
                </Box>
                {loading ? (
                  <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#667eea' }}>
                    Loading...
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Level {gameProgress.currentLevel}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3} fontWeight={600}>
                      {gameProgress.totalXP} XP Total
                    </Typography>
                    <LinearProgress variant="determinate" value={(gameProgress.totalXP % 1000) / 10} sx={{ height: 12, borderRadius: 10, backgroundColor: 'rgba(102, 126, 234, 0.15)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', borderRadius: 10 }}} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
                      {1000 - (gameProgress.totalXP % 1000)} XP to next level
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Streak Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 15px 50px rgba(0,0,0,0.25)' }}}>
              <CardContent sx={{ p: 4, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, fontSize: '10rem', opacity: 0.12, transform: 'rotate(-15deg)' }}>🔥</Box>
                <Box sx={{ position: 'relative' }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Flame size={28} />
                    <Typography variant="h5" fontWeight="700">Current Streak</Typography>
                  </Box>
                  {loading ? (
                    <Typography variant="h1" fontWeight="bold" mb={1} sx={{ fontSize: '4rem' }}>...</Typography>
                  ) : (
                    <>
                      <Typography variant="h1" fontWeight="bold" mb={1} sx={{ fontSize: '4rem' }}>{gameProgress.currentStreak}</Typography>
                      <Typography variant="h6" sx={{ opacity: 0.95, mb: 3 }}>days in a row!</Typography>
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
            <Card sx={{ borderRadius: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 15px 50px rgba(0,0,0,0.25)' }}}>
              <CardContent sx={{ p: 4, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, fontSize: '10rem', opacity: 0.12, transform: 'rotate(15deg)' }}>🏆</Box>
                <Box sx={{ position: 'relative' }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Trophy size={28} />
                    <Typography variant="h5" fontWeight="700">Recent Badges</Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1.5} mb={3} mt={3}>
                    {gameProgress.badges.slice(0, 3).map((badge, index) => (
                      <Chip key={index} label={badge} sx={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', fontSize: '0.875rem', py: 2.5 }} />
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
        <Typography variant="h4" fontWeight="bold" gutterBottom mb={3} sx={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          Let's Play!
        </Typography>
        <Grid container spacing={3} mb={5}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card onClick={action.action} sx={{ cursor: 'pointer', borderRadius: 5, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', transition: 'all 0.3s ease', background: 'white', '&:hover': { transform: 'translateY(-12px) scale(1.02)', boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}}>
                <CardContent sx={{ textAlign: 'center', p: 3.5 }}>
                  <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 2.5, background: action.gradient, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${action.color}40`, transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1) rotate(5deg)' } }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: action.color }}>{action.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{action.description}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2.5 }}>
                  <Button startIcon={<Play size={18} />} sx={{ color: action.color, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}>Start</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Achievements */}
        <Typography variant="h4" fontWeight="bold" gutterBottom mb={3} sx={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          Your Achievements
        </Typography>
        <Grid container spacing={3}>
          {recentAchievements.map((achievement, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card sx={{ borderRadius: 5, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', opacity: achievement.earned ? 1 : 0.7, background: achievement.earned ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' : 'rgba(255,255,255,0.9)', color: achievement.earned ? '#8B4513' : '#999', textAlign: 'center', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.08) rotate(2deg)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h1" sx={{ mb: 2, fontSize: '4rem', filter: achievement.earned ? 'none' : 'grayscale(100%)', opacity: achievement.earned ? 1 : 0.4 }}>
                    {achievement.icon}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>{achievement.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600 }}>
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
