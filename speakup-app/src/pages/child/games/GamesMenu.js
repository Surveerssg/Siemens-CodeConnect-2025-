import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import { 
  ArrowLeft, 
  Gamepad2, 
  Play,
  Star,
  Lock,
  Trophy,
  Zap
} from 'lucide-react';

const GamesMenu = () => {
  const { gameProgress } = useGame();
  const navigate = useNavigate();

  const games = [
    {
      id: 'word-match',
      title: 'Word Match',
      description: 'Match the spoken word with the correct picture!',
      icon: '🎯',
      color: '#FF6B6B',
      difficulty: 'Easy',
      xp: 25,
      unlocked: true,
      completed: false,
      bestScore: 0
    },
    {
      id: 'balloon-pop',
      title: 'Balloon Pop',
      description: 'Pop balloons by saying the words correctly!',
      icon: '🎈',
      color: '#4ECDC4',
      difficulty: 'Medium',
      xp: 50,
      unlocked: gameProgress.totalXP >= 100,
      completed: false,
      bestScore: 0
    },
    {
      id: 'treasure-hunt',
      title: 'Treasure Hunt',
      description: 'Find the treasure by speaking the magic words!',
      icon: '🏴‍☠️',
      color: '#9B59B6',
      difficulty: 'Hard',
      xp: 100,
      unlocked: gameProgress.totalXP >= 250,
      completed: false,
      bestScore: 0
    }
  ];

  const achievements = [
    { name: 'First Game', description: 'Play your first game', icon: '🎮', earned: true },
    { name: 'Word Master', description: 'Complete 10 words in Word Match', icon: '🎯', earned: false },
    { name: 'Balloon Popper', description: 'Pop 20 balloons', icon: '🎈', earned: false },
    { name: 'Treasure Hunter', description: 'Find 5 treasures', icon: '🏴‍☠️', earned: false },
    { name: 'Game Champion', description: 'Complete all games', icon: '🏆', earned: false }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 2,
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
          Game Center 🎮
        </Typography>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={4} mb={4}>
        {/* Total XP */}
        <Grid item xs={12} md={4}>
          <Card className="game-card" sx={{ 
            background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
            color: 'white',
            textAlign: 'center',
            p: 3
          }}>
            <Typography variant="h6" gutterBottom>
              <Gamepad2 size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Total XP
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
              {gameProgress.totalXP}
            </Typography>
            <Typography variant="body2">
              Keep playing to earn more!
            </Typography>
          </Card>
        </Grid>

        {/* Games Played */}
        <Grid item xs={12} md={4}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>
              <Trophy size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Games Played
            </Typography>
            <Typography variant="h2" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start playing to increase!
            </Typography>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9B59B6' }}>
              <Star size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Achievements
            </Typography>
            <Typography variant="h2" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
              {achievements.filter(a => a.earned).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              out of {achievements.length} total
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Available Games */}
      <Typography variant="h5" gutterBottom sx={{ 
        color: '#2C3E50',
        fontWeight: 'bold',
        mb: 3
      }}>
        Available Games
      </Typography>

      <Grid container spacing={3} mb={4}>
        {games.map((game) => (
          <Grid item xs={12} md={4} key={game.id}>
            <Card 
              className="game-card"
              sx={{ 
                cursor: game.unlocked ? 'pointer' : 'not-allowed',
                opacity: game.unlocked ? 1 : 0.6,
                background: game.unlocked 
                  ? `linear-gradient(135deg, ${game.color}15, ${game.color}05)`
                  : 'linear-gradient(135deg, #E0E0E0, #BDBDBD)',
                border: `2px solid ${game.unlocked ? `${game.color}30` : '#E0E0E0'}`,
                '&:hover': game.unlocked ? {
                  transform: 'translateY(-8px) scale(1.02)',
                  border: `3px solid ${game.color}`,
                  boxShadow: `0 20px 40px ${game.color}30`
                } : {}
              }}
              onClick={() => game.unlocked && navigate(`/games/${game.id}`)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h1" sx={{ mb: 2, fontSize: '4rem' }}>
                  {game.icon}
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: game.unlocked ? game.color : '#9E9E9E',
                  fontWeight: 'bold'
                }}>
                  {game.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {game.description}
                </Typography>

                <Box display="flex" justifyContent="center" gap={1} mb={2}>
                  <Chip
                    label={game.difficulty}
                    size="small"
                    sx={{ 
                      background: getDifficultyColor(game.difficulty),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                  <Chip
                    label={`${game.xp} XP`}
                    size="small"
                    sx={{ 
                      background: '#4ECDC4',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                {!game.unlocked && (
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Lock size={20} color="#9E9E9E" style={{ marginRight: 8 }} />
                    <Typography variant="body2" color="text.secondary">
                      Unlock at {game.id === 'balloon-pop' ? '100' : '250'} XP
                    </Typography>
                  </Box>
                )}

                {game.bestScore > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Best Score: {game.bestScore}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  startIcon={game.unlocked ? <Play size={16} /> : <Lock size={16} />}
                  disabled={!game.unlocked}
                  sx={{ 
                    color: game.unlocked ? game.color : '#9E9E9E',
                    fontWeight: 'bold'
                  }}
                >
                  {game.unlocked ? 'Play Game' : 'Locked'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Game Achievements */}
      <Typography variant="h5" gutterBottom sx={{ 
        color: '#2C3E50',
        fontWeight: 'bold',
        mb: 3
      }}>
        Game Achievements
      </Typography>

      <Grid container spacing={2}>
        {achievements.map((achievement, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {achievement.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  {achievement.description}
                </Typography>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  mt: 1,
                  fontWeight: 'bold'
                }}>
                  {achievement.earned ? '✅ Earned!' : '🔒 Locked'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GamesMenu;
