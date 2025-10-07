import React, { useEffect, useState } from 'react';
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
import { gamesAPI } from '../../../services/api';

const GamesMenu = () => {
  const { gameProgress } = useGame();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Static game templates (definitions live on the frontend)
  const gameTemplates = [
    {
      id: 'word-match',
      title: 'Word Match',
      description: 'Match the spoken word with the correct picture!',
      icon: '🎯',
      color: '#FF6B6B',
      difficulty: 'Easy',
      xp: 25,
      unlockXP: 0
    },
    {
      id: 'balloon-pop',
      title: 'Balloon Pop',
      description: 'Pop balloons by saying the words correctly!',
      icon: '🎈',
      color: '#4ECDC4',
      difficulty: 'Medium',
      xp: 50,
      unlockXP: 100
    },
    {
      id: 'treasure-hunt',
      title: 'Treasure Hunt',
      description: 'Find the treasure by speaking the magic words!',
      icon: '🏴‍☠️',
      color: '#9B59B6',
      difficulty: 'Hard',
      xp: 100,
      unlockXP: 250
    }
  ];

  // Achievement templates (show locked ones as goals)
  const achievementTemplates = [
    { key: 'FIRST_GAME', name: 'First Game', description: 'Play your first game', icon: '🎮', condition: (ctx) => (ctx.gamesPlayed || 0) >= 1 },
    { key: 'SPEED_DEMON', name: 'Speed Demon', description: 'Complete 10 words in one session', icon: '⚡', condition: (ctx) => (ctx.history || []).some(h => (h.wordsPracticed || 0) >= 10) },
    { key: 'WEEK_WARRIOR', name: 'Week Warrior', description: 'Practiced every day this week', icon: '🏆', condition: (ctx) => (ctx.streakDays || 0) >= 7 },
    { key: 'CONSISTENCY_KING', name: 'Consistency King', description: '30 day practice streak', icon: '👑', condition: (ctx) => (ctx.streakDays || 0) >= 30 },
    { key: 'GAME_CHAMPION', name: 'Game Champion', description: 'Complete all games', icon: '🏆', condition: (ctx) => (ctx.completedGamesCount || 0) >= gameTemplates.length }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch user-specific game data, achievements, and history
        const [userGameResp, achievementsResp, historyResp] = await Promise.all([
          gamesAPI.getGameData(),
          gamesAPI.getAchievements(),
          gamesAPI.getHistory(50, 0),
        ]);

        const userGame = userGameResp?.data || {};
        const history = historyResp?.data || [];

        // Compute best scores per game type from history
        const bestScores = {};
        history.forEach(h => {
          const type = h.gameType || h.game || 'unknown';
          const score = typeof h.score === 'number' ? h.score : parseFloat(h.score) || 0;
          bestScores[type] = Math.max(bestScores[type] || 0, score);
        });

        // Merge static templates with user-specific info
        const gamesData = gameTemplates.map(t => ({
          ...t,
          unlocked: gameProgress.totalXP >= (t.unlockXP || 0),
          completed: false,
          bestScore: bestScores[t.id] || 0
        }));

        setGames(gamesData);

        // Map existing achievements by type/key
        const existingAchievements = (achievementsResp?.data || []).reduce((acc, a) => {
          const key = a.achievementType || a.name;
          acc[key] = a;
          return acc;
        }, {});

        // Compute some helper values for conditions
        const completedGamesCount = gamesData.filter(g => g.bestScore > 0).length;
        const ctx = {
          gamesPlayed: userGame.Games_Played || history.length || 0,
          history,
          streakDays: userGame.Longest_Streak || 0,
          completedGamesCount
        };

        const mergedAchievements = achievementTemplates.map(t => {
          const exists = existingAchievements[t.key];
          const earned = !!exists || Boolean(t.condition(ctx));
          return {
            key: t.key,
            name: t.name,
            description: t.description,
            icon: t.icon,
            earned,
            date: exists?.timestamp || null
          };
        });

        setAchievements(mergedAchievements);

        setGamesPlayed(userGame.Games_Played || history.length || 0);
      } catch (err) {
        console.error('Error loading games menu data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [gameProgress.totalXP]);

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
              {loading ? '—' : gamesPlayed}
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
              {loading ? '—' : (achievements.filter(a => a.earned).length)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              out of {loading ? '—' : achievements.length} total
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
        {(loading ? [1,2,3] : games).map((game, idx) => (
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
                  {loading ? '🎮' : game.icon}
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
                    label={`${loading ? '—' : game.xp} XP`}
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

                {!loading && game.bestScore > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Best Score: {game.bestScore}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  startIcon={(!loading && game.unlocked) ? <Play size={16} /> : <Lock size={16} />}
                  disabled={loading ? true : !game.unlocked}
                  sx={{ 
                    color: (!loading && game.unlocked) ? game.color : '#9E9E9E',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Loading' : (game.unlocked ? 'Play Game' : 'Locked')}
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
        {(loading ? [1,2,3] : achievements).map((achievement, index) => (
          <Grid item xs={12} sm={6} md={4} key={achievement?.name || index}>
            <Card 
              className="game-card"
              sx={{ 
                opacity: achievement?.earned ? 1 : 0.6,
                background: achievement?.earned 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : 'linear-gradient(135deg, #E0E0E0, #BDBDBD)',
                color: 'white'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {loading ? '🏆' : achievement.icon}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {loading ? 'Loading...' : achievement.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  {loading ? '' : achievement.description}
                </Typography>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  mt: 1,
                  fontWeight: 'bold'
                }}>
                  {loading ? '' : (achievement.earned ? `✅ Earned${achievement.date ? ' on ' + new Date(achievement.date).toLocaleDateString() : '!'}` : '🔒 Locked — Goal: ' + achievement.description)}
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
