import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  Trophy, 
  Target,
  Calendar,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Progress = () => {
  const { gameProgress } = useGame();
  const navigate = useNavigate();

  const mockProgressData = [
    { day: 'Mon', score: 75, words: 3 },
    { day: 'Tue', score: 82, words: 4 },
    { day: 'Wed', score: 68, words: 2 },
    { day: 'Thu', score: 91, words: 5 },
    { day: 'Fri', score: 88, words: 4 },
    { day: 'Sat', score: 95, words: 6 },
    { day: 'Sun', score: 78, words: 3 }
  ];

  const weeklyStats = {
    totalWords: 27,
    averageScore: 82,
    bestScore: 95,
    practiceDays: 7
  };

  const achievements = [
    { name: 'First Word Master', description: 'Completed your first word!', icon: '🌟', earned: true, date: '2024-01-15' },
    { name: '3 Day Streak', description: 'Practiced for 3 days in a row!', icon: '🔥', earned: true, date: '2024-01-18' },
    { name: 'Perfect Score', description: 'Got a perfect 100% score!', icon: '⭐', earned: true, date: '2024-01-20' },
    { name: 'Week Warrior', description: 'Practiced every day this week!', icon: '🏆', earned: false, date: null },
    { name: 'Speed Demon', description: 'Completed 10 words in one session!', icon: '⚡', earned: false, date: null },
    { name: 'Consistency King', description: '30 day practice streak!', icon: '👑', earned: false, date: null }
  ];

  const recentActivities = [
    { word: 'Apple', score: 95, time: '2 hours ago', stars: 5 },
    { word: 'Ball', score: 78, time: '1 day ago', stars: 4 },
    { word: 'Cat', score: 88, time: '1 day ago', stars: 4 },
    { word: 'Dog', score: 92, time: '2 days ago', stars: 5 },
    { word: 'Elephant', score: 65, time: '3 days ago', stars: 3 }
  ];

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
          My Progress 📈
        </Typography>
      </Box>

      {/* Rest of your component: stats, charts, recent activities, achievements, level progress */}
      {/* All other code remains unchanged */}
    </Container>
  );
};

export default Progress;
