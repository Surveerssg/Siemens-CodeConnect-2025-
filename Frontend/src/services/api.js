import { auth } from '../firebase';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return await user.getIdToken();
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    const token = await getAuthToken();
    console.log('Auth token obtained:', token ? 'Yes' : 'No');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: () => apiRequest('/users/profile'),
  
  // Update user profile
  updateProfile: (data) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Register new user
  register: (data) => apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get all users (for therapists/parents)
  getAllUsers: () => apiRequest('/users'),
  
  // Get user by ID
  getUserById: (userId) => apiRequest(`/users/${userId}`),
};

// Progress API
export const progressAPI = {
  // Get user progress
  getProgress: () => apiRequest('/progress'),
  
  // Update user progress
  updateProgress: (data) => apiRequest('/progress', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Record practice session
  recordSession: (data) => apiRequest('/progress/session', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get progress history
  getHistory: (limit = 30, offset = 0) => 
    apiRequest(`/progress/history?limit=${limit}&offset=${offset}`),
  
  // Get user progress by ID
  getUserProgress: (userId) => apiRequest(`/progress/user/${userId}`),
};

// Games API
export const gamesAPI = {
  // Get user game data
  getGameData: () => apiRequest('/games'),
  
  // Mark game as started (increments Games_Played by 1)
  startGame: (data) => apiRequest('/games/started', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update game data
  updateGameData: (data) => apiRequest('/games', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Add XP
  addXP: (data) => apiRequest('/games/xp', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Record game completion
  recordCompletion: (data) => apiRequest('/games/complete', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get game history
  getHistory: (limit = 50, offset = 0) => 
    apiRequest(`/games/history?limit=${limit}&offset=${offset}`),
  
  // Get achievements
  getAchievements: () => apiRequest('/games/achievements'),
  
  // Add achievement
  addAchievement: (data) => apiRequest('/games/achievements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Goals API
export const goalsAPI = {
  // Get user goals data
  getGoalsData: () => apiRequest('/goals'),
  
  // Update goals data
  updateGoalsData: (data) => apiRequest('/goals', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Complete a goal
  completeGoal: (data) => apiRequest('/goals/complete', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Reset streak
  resetStreak: () => apiRequest('/goals/reset-streak', {
    method: 'POST',
  }),

  // Touch streak by day (increments once per day, handles gaps)
  touchStreak: () => apiRequest('/goals/touch', {
    method: 'POST',
  }),
  
  // Get goal history
  getHistory: (limit = 30, offset = 0) => 
    apiRequest(`/goals/history?limit=${limit}&offset=${offset}`),
  
  // Create new goal
  createGoal: (data) => apiRequest('/goals/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get active goals
  getActiveGoals: () => apiRequest('/goals/active'),
  
  // Update goal progress
  updateGoalProgress: (goalId, data) => apiRequest(`/goals/${goalId}/progress`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Assigned goals (parent -> child)
  assignToChild: (data) => apiRequest('/parent/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAssigned: (goalId, data) => apiRequest(`/parent/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAssigned: (goalId) => apiRequest(`/parent/goals/${goalId}`, { method: 'DELETE' }),
  listChildAssigned: (childId) => apiRequest(`/parent/goals/child/${childId}`),
  
  // For child: fetch own assigned goals and update progress
  listMyAssigned: () => apiRequest('/goals/assigned'),
  updateMyAssignedProgress: (goalId, data) => apiRequest(`/goals/assigned/${goalId}/progress`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export default {
  user: userAPI,
  progress: progressAPI,
  games: gamesAPI,
  goals: goalsAPI,
};
