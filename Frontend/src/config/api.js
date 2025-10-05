// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Environment variables for API
export const API_ENDPOINTS = {
  USERS: '/users',
  PROGRESS: '/progress',
  GAMES: '/games',
  GOALS: '/goals',
};

export default API_CONFIG;
