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

  // For child: fetch own assigned goals and update progress
  listMyAssigned: () => apiRequest('/goals/assigned'),
  updateMyAssignedProgress: (goalId, data) => apiRequest(`/goals/assigned/${goalId}/progress`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Parent Goals API - UPDATED TO MATCH SERVER.JS
export const parentGoalsAPI = {
  // Create a new parent goal and assign to child
  create: (data) => apiRequest('/parent/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Get all parent goals for the current parent
  list: () => apiRequest('/parent/goals'),
  
  // Get a specific parent goal by ID
  get: (id) => apiRequest(`/parent/goals/${id}`),
  
  // Update a parent goal
  update: (id, data) => apiRequest(`/parent/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete a parent goal
  delete: (id) => apiRequest(`/parent/goals/${id}`, { 
    method: 'DELETE' 
  }),
};

// Parent API
export const parentAPI = {
  linkChild: (childId) => apiRequest('/parent/children/link', {
    method: 'POST',
    body: JSON.stringify({ childId }),
  }),
  linkChildByEmail: (email) => apiRequest('/parent/children/link-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  listChildren: () => apiRequest('/parent/children'),
  getChildSummary: (childId) => apiRequest(`/parent/children/${childId}/summary`),
  // Fetch all notes for a parent
  getNotes: (parentEmail) => {
    if (!parentEmail) throw new Error('Parent email is required');
    
    console.log(`📤 Fetching notes for parent email: ${parentEmail}`);
    const encodedEmail = encodeURIComponent(parentEmail.trim().toLowerCase());

    return apiRequest(`/parent/children/parent-notes?email=${encodedEmail}`);
  },
};

// Therapist API
export const therapistAPI = {
  linkChild: (childId) => apiRequest('/therapist/children/link', {
    method: 'POST',
    body: JSON.stringify({ childId }),
  }),
  linkChildByEmail: (email) => apiRequest('/therapist/children/link-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  listChildren: () => apiRequest('/therapist/children'),
  getParentEmail: (childId) => apiRequest(`/therapist/children/${childId}/parent`),
  getChildSummary: (childId) => apiRequest(`/therapist/children/${childId}/summary`),

  // NEW: Send note to parent
  sendNote: (childId, title, content) => apiRequest(`/therapist/children/${childId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  }),
  // Practice assignment endpoints (therapist)
  assignPractice: (data) => apiRequest('/practice/assign', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  listChildPractice: (childId) => apiRequest(`/practice/child/${childId}`),
  getAssignmentAttempts: (assignmentId) => apiRequest(`/practice/${assignmentId}/attempts`),
};

export default {
  user: userAPI,
  therapist: therapistAPI,
  progress: progressAPI,
  games: gamesAPI,
  goals: goalsAPI,
  parentGoals: parentGoalsAPI,
  parent: parentAPI,
  practice: {
    listAssigned: () => apiRequest('/practice/assigned'),
    submitAttempt: (assignmentId, data) => apiRequest(`/practice/${assignmentId}/attempt`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    markComplete: (assignmentId) => apiRequest(`/practice/${assignmentId}/complete`, {
      method: 'POST'
    })
  },
};