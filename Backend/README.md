# SpeakUp Backend API

A comprehensive backend API for the SpeakUp speech therapy application, built with Node.js, Express, and Firebase Admin SDK.

## Features

- **User Management**: Complete CRUD operations for user profiles
- **Progress Tracking**: Record and monitor user progress and statistics
- **Game Integration**: Handle game data, XP, achievements, and completions
- **Goals System**: Manage user goals, streaks, and completions
- **Authentication**: Firebase-based authentication with role-based access control
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: Rate limiting, CORS, helmet security headers

## API Endpoints

### Authentication
All endpoints (except health check) require Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### User Management (`/api/users`)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update current user profile
- `POST /register` - Create new user
- `GET /` - Get all users (therapist/parent only)
- `GET /:userId` - Get specific user
- `DELETE /:userId` - Delete user (therapist only)

### Progress Tracking (`/api/progress`)
- `GET /` - Get user progress data
- `PUT /` - Update user progress
- `POST /session` - Record practice session
- `GET /history` - Get progress history
- `GET /user/:userId` - Get specific user's progress

### Game Data (`/api/games`)
- `GET /` - Get user game data
- `PUT /` - Update game data
- `POST /xp` - Add XP to user
- `POST /complete` - Record game completion
- `GET /history` - Get game history
- `GET /achievements` - Get user achievements
- `POST /achievements` - Add achievement

### Goals Management (`/api/goals`)
- `GET /` - Get user goals data
- `PUT /` - Update goals data
- `POST /complete` - Complete a goal
- `POST /reset-streak` - Reset user streak
- `GET /history` - Get goal completion history
- `POST /create` - Create new goal
- `GET /active` - Get active goals
- `PUT /:goalId/progress` - Update goal progress

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the Backend directory with the following variables:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Database Schema

The API works with the following Firestore collections:

### Users Collection
```javascript
{
  userId: string,
  name: string,
  email: string,
  phone: string,
  role: 'child' | 'parent' | 'therapist',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Progress Collection
```javascript
{
  userId: string,
  Average_Score: number,
  Best_Score: number,
  Practice_Days: number,
  Words_This_Week: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Games Collection
```javascript
{
  userId: string,
  Achievements: number,
  Games_Played: number,
  Total_XP: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Goals Collection
```javascript
{
  userId: string,
  Current_Streak: number,
  Goals_Completed: number,
  Total_XP_Earned: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation for all inputs
- **Authentication**: Firebase ID token verification
- **Role-based Access**: Different permissions for different user roles

## Error Handling

The API provides consistent error responses:
```javascript
{
  success: false,
  error: "Error message",
  details: [] // For validation errors
}
```

## Development

- **Hot Reload**: Use `npm run dev` for development with nodemon
- **Logging**: Morgan for HTTP request logging
- **Compression**: Gzip compression for responses
- **Environment**: Development and production configurations

## Testing

```bash
npm test
```

## Deployment

1. Set environment variables in your deployment platform
2. Ensure Firebase service account has proper permissions
3. Configure CORS for your production frontend URL
4. Set up monitoring and logging

## License

MIT License - Siemens CodeConnect 2025
