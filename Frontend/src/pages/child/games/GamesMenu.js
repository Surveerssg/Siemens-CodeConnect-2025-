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
  Zap,
  Target,
  Flame
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
      gradient: 'from-red-400 to-pink-600',
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
      gradient: 'from-cyan-400 to-teal-600',
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
      gradient: 'from-purple-400 to-indigo-600',
      difficulty: 'Hard',
      xp: 100,
      unlockXP: 250
    },
    {
      id: 'maingame',
      title: 'Huge Kombat',
      description: 'Arcade-style combat game to be played with your voice',
      icon: '🥋',
      color: '#2ECC71',
      gradient: 'from-green-400 to-emerald-600',
      difficulty: 'Hard',
      xp: 120,
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
      case 'Easy': return 'from-green-400 to-green-600';
      case 'Medium': return 'from-orange-400 to-orange-600';
      case 'Hard': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 mb-8">
          <div className="justify-self-start">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="justify-self-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 text-center">
              Game Center
            </h1>
          </div>

          <div className="justify-self-end" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Total XP */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-5xl sm:text-7xl opacity-8 select-none pointer-events-none hidden sm:block">⚡</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Zap size={20} className="sm:w-6 sm:h-6 text-indigo-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Total XP</h3>
              </div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
                {gameProgress.totalXP}
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium">
                Keep playing to earn more!
              </p>
            </div>
          </div>

          {/* Games Played */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-5xl sm:text-7xl opacity-8 select-none pointer-events-none hidden sm:block">🎮</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Gamepad2 size={20} className="sm:w-6 sm:h-6 text-orange-500" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Games Played</h3>
              </div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
                {loading ? '—' : gamesPlayed}
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium">
                Start playing to increase!
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-5xl sm:text-7xl opacity-8 select-none pointer-events-none hidden sm:block">🏆</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Trophy size={20} className="sm:w-6 sm:h-6 text-green-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Achievements</h3>
              </div>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                {loading ? '—' : achievements.filter(a => a.earned).length}
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium">
                out of {loading ? '—' : achievements.length} total
              </p>
            </div>
          </div>
        </div>

        {/* Available Games */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Available Games
            <Star className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(loading ? [1,2,3,4] : games).map((game, idx) => (
              <div
                key={game.id || idx}
                onClick={() => !loading && game.unlocked && navigate(`/games/${game.id}`)}
                className={`group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 ${
                  !loading && game.unlocked 
          ? 'cursor-pointer hover:-translate-y-1 border border-transparent hover:border-blue-200' 
                    : 'opacity-60 cursor-not-allowed border-2 border-gray-200'
                }`}
              >
                {/* Game Icon */}
                <div className={`text-6xl sm:text-7xl mb-4 text-center ${
                  !loading && game.unlocked ? '' : 'grayscale opacity-50'
                }`}>
                  {loading ? '🎮' : game.icon}
                </div>

                {/* Game Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 text-center">
                  {loading ? 'Loading...' : game.title}
                </h3>

                {/* Game Description */}
                <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center line-clamp-2">
                  {loading ? '' : game.description}
                </p>

                {/* Badges */}
                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-gray-700 bg-gray-100 ${loading ? '' : ''}`}>
                    {loading ? 'Easy' : game.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-gray-700 bg-gray-100">
                    {loading ? '—' : game.xp} XP
                  </span>
                </div>

                {/* Lock/Unlock Status */}
                {!loading && !game.unlocked && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-gray-500">
                    <Lock size={16} />
                    <span className="text-xs font-semibold">
                      Unlock at {game.unlockXP} XP
                    </span>
                  </div>
                )}

                {/* Best Score */}
                {!loading && game.bestScore > 0 && (
                  <div className="text-center mb-4">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Best: {game.bestScore} 🏆
                    </span>
                  </div>
                )}

                {/* Play Button */}
                <button
                  disabled={loading || !game.unlocked}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    loading || !game.unlocked
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${game.gradient} text-white hover:scale-102 shadow-sm`
                  }`}
                >
                  {loading ? (
                    'Loading...'
                  ) : game.unlocked ? (
                    <>
                      <Play size={16} />
                      Play Game
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Locked
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Game Achievements */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Game Achievements
            <Trophy className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {(loading ? [1,2,3,4,5] : achievements).map((achievement, index) => (
              <div
                key={achievement?.key || index}
                className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-transform duration-200 text-center ${
                  achievement?.earned 
                    ? 'border border-yellow-400 hover:scale-105' 
                    : 'opacity-80 border border-gray-100'
                }`}
              >
                {/* Achievement Icon */}
                <div className={`text-3xl sm:text-4xl lg:text-4xl mb-3 sm:mb-4 ${
                  achievement?.earned ? '' : 'grayscale opacity-50'
                }`}>
                  {loading ? '🏆' : achievement.icon}
                </div>

                {/* Achievement Name */}
                <h3 className="text-sm sm:text-sm font-semibold text-gray-800 mb-2">
                  {loading ? 'Loading...' : achievement.name}
                </h3>

                {/* Achievement Status */}
                <p className={`text-xs sm:text-xs font-medium mb-2 ${
                  achievement?.earned ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {loading ? '' : (achievement.earned ? 'Earned! 🎉' : 'Keep trying!')}
                </p>

                {/* Achievement Description/Date */}
                {!loading && (
                  <p className="text-xs text-gray-600">
                    {achievement.earned && achievement.date 
                      ? new Date(achievement.date).toLocaleDateString()
                      : achievement.description
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesMenu;
