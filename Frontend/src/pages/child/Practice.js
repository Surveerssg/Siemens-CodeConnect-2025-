import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { GAME_WORDS, SCORING_RANGES, AVATAR_EMOTIONS } from '../../constants';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Avatar,
  LinearProgress,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  ArrowLeft, 
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';

const Practice = () => {
  const { addXP, updateStreak, addBadge } = useGame();
  const navigate = useNavigate();
  
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [avatarEmotion, setAvatarEmotion] = useState(AVATAR_EMOTIONS.THINKING);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateNewWord();
  }, []);

  const generateNewWord = () => {
    const randomWord = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    setCurrentWord(randomWord);
    setScore(null);
    setShowFeedback(false);
    setAvatarEmotion(AVATAR_EMOTIONS.THINKING);
  };

  const startRecording = () => {
    setIsRecording(true);
    setAvatarEmotion(AVATAR_EMOTIONS.THINKING);
  };

  const stopRecording = () => {
    setIsRecording(false);
    simulateSpeechAnalysis();
  };

  const simulateSpeechAnalysis = () => {
    const randomScore = Math.floor(Math.random() * 100);
    setScore(randomScore);
    setAttempts(prev => prev + 1);
    
    setTimeout(() => {
      setShowFeedback(true);
      if (randomScore >= 70) {
        setAvatarEmotion(AVATAR_EMOTIONS.HAPPY);
        setStreak(prev => prev + 1);
        addXP(50);
        updateStreak(true);
        if (randomScore >= 90) addBadge('perfect_score');
      } else {
        setAvatarEmotion(AVATAR_EMOTIONS.SAD);
        setStreak(0);
        updateStreak(false);
      }
    }, 2000);
  };

  const playWord = () => {
    setIsPlaying(true);
    setAvatarEmotion(AVATAR_EMOTIONS.EXCITED);
    setTimeout(() => {
      setIsPlaying(false);
      setAvatarEmotion(AVATAR_EMOTIONS.THINKING);
    }, 2000);
  };

  const getScoreInfo = (score) => {
    for (const [key, range] of Object.entries(SCORING_RANGES)) {
      if (score >= range.min && score <= range.max) return range;
    }
    return SCORING_RANGES.NEEDS_WORK;
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={30}
        className={`star ${i < count ? 'filled' : ''}`}
        style={{ color: i < count ? '#FFD700' : '#E0E0E0' }}
      />
    ));
  };

  const scoreInfo = score ? getScoreInfo(score) : null;

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', position: 'relative', zIndex: 2, py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          Practice Time! 🎤
        </Typography>
      </Box>

      {/* Rest of your Practice component UI */}
      {/* Cards, buttons, avatar, feedback, tips... */}
      {/* All logic remains unchanged */}
    </Container>
  );
};

export default Practice;
