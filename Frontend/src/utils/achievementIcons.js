export const getAchievementIcon = (type) => {
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