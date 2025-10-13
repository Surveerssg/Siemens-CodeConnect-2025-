import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { gamesAPI } from '../../services/api';
import { 
  Mic, 
  Gamepad2, 
  Target, 
  TrendingUp,
  Play,
  Settings,
  LogOut,
  Flame,
  Trophy,
  Sparkles
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
      icon: Mic,
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:shadow-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => navigate('/practice')
    },
    {
      title: 'Lip Sync',
      description: 'Practice speaking with visual lip-sync feedback',
      icon: Mic,
      color: 'from-pink-400 to-pink-600',
      hoverColor: 'hover:shadow-pink-200',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      action: () => navigate('/lipsync')
    },
    {
      title: 'Play Games',
      description: 'Have fun while learning!',
      icon: Gamepad2,
      color: 'from-orange-400 to-orange-600',
      hoverColor: 'hover:shadow-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      action: () => navigate('/games')
    },
    {
      title: 'My Progress',
      description: 'See how well you\'re doing!',
      icon: TrendingUp,
      color: 'from-green-400 to-green-600',
      hoverColor: 'hover:shadow-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      action: () => navigate('/progress')
    },
    {
      title: 'My Goals',
      description: 'Check your daily goals!',
      icon: Target,
      color: 'from-purple-400 to-purple-600',
      hoverColor: 'hover:shadow-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: () => navigate('/goals')
    }
  ];

  const [achievements, setAchievements] = useState([]);
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
        }).slice(0, 4);

        setAchievements(merged);
      } catch (error) {
        console.error('Error loading achievements:', error);
        setAchievements([]);
      }
    };

    loadAchievements();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 flex items-center gap-3">
              Welcome back, {user?.displayName || 'Super Star'}! 
              <span className="text-4xl sm:text-5xl animate-bounce">🌟</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-600 font-medium">
              Ready for another amazing day of learning?
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Level Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-100">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-lg">
                👶
              </div>
              {loading ? (
                <p className="text-2xl sm:text-3xl font-bold text-gray-400">Loading...</p>
              ) : (
                <>
                  <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                    Level {gameProgress.currentLevel}
                  </h3>
                  <p className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
                    {gameProgress.totalXP} XP Total
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(gameProgress.totalXP % 1000) / 10}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    {1000 - (gameProgress.totalXP % 1000)} XP to next level
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">🔥</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Flame size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Current Streak</h3>
              </div>
              {loading ? (
                <p className="text-4xl sm:text-5xl font-bold">...</p>
              ) : (
                <>
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                    {gameProgress.currentStreak}
                  </p>
                  <p className="text-lg sm:text-xl font-semibold mb-4">days in a row!</p>
                  <div className="pt-4 border-t-2 border-white/30">
                    <p className="text-sm sm:text-base font-semibold">
                      Best streak: {gameProgress.bestStreak} days 🏆
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">🏆</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Recent Badges</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4 mt-4">
                {gameProgress.badges.slice(0, 3).map((badge, index) => (
                  <span 
                    key={index}
                    className="px-3 sm:px-4 py-2 bg-white/25 backdrop-blur-sm rounded-xl font-bold text-xs sm:text-sm border border-white/40"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  {gameProgress.badges.length} badges earned ⭐
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Let's Play! 
            <Sparkles className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className={`group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 ${action.hoverColor} border border-gray-100`}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${action.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`${action.iconColor} w-7 h-7 sm:w-8 sm:h-8`} />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center line-clamp-2">
                  {action.description}
                </p>
                <button className={`w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-gradient-to-r ${action.color} text-white rounded-xl font-semibold text-xs sm:text-sm hover:scale-105 transition-transform duration-200`}>
                  <Play size={14} className="sm:w-4 sm:h-4" />
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Your Achievements
            <Trophy className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center ${
                  achievement.earned 
                    ? 'border-2 border-green-400 hover:scale-105' 
                    : 'opacity-60 border border-gray-200'
                }`}
              >
                <div className={`text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
                  {achievement.name}
                </h3>
                <p className={`text-xs sm:text-sm font-semibold ${
                  achievement.earned ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {achievement.earned ? 'Earned! 🎉' : 'Keep trying!'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;