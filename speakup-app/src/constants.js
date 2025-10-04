export const ROLES = {
  CHILD: 'child',
  PARENT: 'parent',
  THERAPIST: 'therapist'
};

export const GAME_WORDS = [
  'apple', 'ball', 'cat', 'dog', 'elephant', 'fish', 'guitar', 'house',
  'ice', 'jump', 'kite', 'lion', 'moon', 'nose', 'orange', 'pizza',
  'queen', 'rabbit', 'sun', 'tree', 'umbrella', 'violin', 'water', 'xylophone'
];

export const SCORING_RANGES = {
  EXCELLENT: { min: 90, max: 100, stars: 5, color: '#4CAF50' },
  GOOD: { min: 70, max: 89, stars: 4, color: '#8BC34A' },
  FAIR: { min: 50, max: 69, stars: 3, color: '#FFC107' },
  POOR: { min: 30, max: 49, stars: 2, color: '#FF9800' },
  NEEDS_WORK: { min: 0, max: 29, stars: 1, color: '#F44336' }
};

export const BADGES = {
  FIRST_WORD: 'first_word',
  STREAK_3: 'streak_3',
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  PERFECT_SCORE: 'perfect_score',
  GAME_MASTER: 'game_master',
  SPEECH_CHAMPION: 'speech_champion'
};

export const AVATAR_EMOTIONS = {
  HAPPY: 'happy',
  SAD: 'sad',
  EXCITED: 'excited',
  THINKING: 'thinking',
  CELEBRATING: 'celebrating'
};
