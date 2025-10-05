# Frontend-Backend Integration Guide

This guide explains how the frontend now integrates with the backend API for data persistence.

## 🔄 What Changed

The frontend has been updated to use the backend API instead of just local state management. All user data, progress, games, and goals are now saved to the backend.

## 📁 New Files Added

### `src/services/api.js`
- Centralized API service for all backend communication
- Handles authentication tokens automatically
- Provides methods for users, progress, games, and goals

### `src/config/api.js`
- API configuration and endpoints
- Easy to change backend URL

## 🔧 Updated Files

### `src/context/GameContext.js`
- Now loads data from backend on authentication
- All game actions (addXP, updateStreak, etc.) save to backend
- Added `recordPracticeSession` and `endGame` methods

### `src/pages/child/games/WordMatch.js`
- Updated to use backend API for saving game progress
- Records practice sessions and game completions

### `src/pages/child/Progress.js`
- Now loads real progress data from backend
- Displays actual user statistics

## 🚀 How to Use

### 1. Start the Backend
```bash
cd Backend
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 3. Environment Variables
Create a `.env` file in the Frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📊 Data Flow

1. **User Authentication**: Frontend authenticates with Firebase
2. **Data Loading**: GameContext loads user data from backend on login
3. **Game Actions**: All game actions (XP, streaks, etc.) save to backend
4. **Progress Tracking**: Practice sessions and progress are recorded
5. **Real-time Updates**: UI updates reflect backend data

## 🔗 API Endpoints Used

- **Users**: `/api/users/profile` - Get/update user profile
- **Progress**: `/api/progress` - Get/update progress data
- **Games**: `/api/games` - Game data, XP, achievements
- **Goals**: `/api/goals` - Goals and streaks

## 🎯 Key Features

- **Automatic Data Sync**: All user actions are saved to backend
- **Real Progress Tracking**: Actual statistics from backend
- **Game Completion**: Games record completion and XP
- **Practice Sessions**: All practice is tracked and saved
- **Achievement System**: Badges and achievements are saved

## 🛠️ Development

The frontend will automatically connect to the backend when both are running. All data is now persistent and will be saved across sessions.

## 🔒 Authentication

The frontend uses Firebase authentication, and the backend validates the Firebase ID token for all API requests.

## 📈 Benefits

- **Data Persistence**: User progress is saved permanently
- **Real Statistics**: Actual user performance data
- **Cross-Device Sync**: Data syncs across devices
- **Analytics**: Backend can track user engagement
- **Scalability**: Backend can handle multiple users
