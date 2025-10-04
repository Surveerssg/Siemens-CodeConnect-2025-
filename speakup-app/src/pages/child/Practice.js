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
  Star,
  CheckCircle,
  XCircle
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
        
        if (randomScore >= 90) {
          addBadge('perfect_score');
        }
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
      if (score >= range.min && score <= range.max) {
        return range;
      }
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
    <div className="floating-letters">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${Math.random() * 1.5 + 0.8}rem`
          }}
        >
          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
        </div>
      ))}
      
      <Container maxWidth="md" sx={{ 
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
            Practice Time! 🎤
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card className="game-card" sx={{ 
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              textAlign: 'center',
              p: 4
            }}>
              <Typography variant="h5" gutterBottom>
                Current Word
              </Typography>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold',
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                {currentWord.toUpperCase()}
              </Typography>
              
              <Box display="flex" justifyContent="center" gap={2} mb={3}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  onClick={playWord}
                  disabled={isPlaying}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  {isPlaying ? 'Playing...' : 'Hear Word'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RotateCcw size={20} />}
                  onClick={generateNewWord}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  New Word
                </Button>
              </Box>

              <Typography variant="h6" gutterBottom>
                Streak: {streak} 🔥
              </Typography>
              <Typography variant="body2">
                Attempts: {attempts}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="game-card" sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50' }}>
                Your Avatar
              </Typography>
              
              <Avatar 
                className={`avatar ${avatarEmotion}`}
                sx={{ 
                  width: 150, 
                  height: 150, 
                  mx: 'auto', 
                  mb: 3,
                  fontSize: '5rem',
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
                }}
              >
                {avatarEmotion === AVATAR_EMOTIONS.HAPPY && '😊'}
                {avatarEmotion === AVATAR_EMOTIONS.SAD && '😢'}
                {avatarEmotion === AVATAR_EMOTIONS.EXCITED && '🤩'}
                {avatarEmotion === AVATAR_EMOTIONS.THINKING && '🤔'}
                {avatarEmotion === AVATAR_EMOTIONS.CELEBRATING && '🎉'}
              </Avatar>

              <Box mb={3}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isRecording && !showFeedback}
                  className="child-friendly-button"
                  sx={{
                    height: 60,
                    fontSize: '1.3rem',
                    background: isRecording 
                      ? 'linear-gradient(45deg, #FF6B6B, #E55A5A)' 
                      : 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                    '&:hover': {
                      background: isRecording 
                        ? 'linear-gradient(45deg, #E55A5A, #FF6B6B)' 
                        : 'linear-gradient(45deg, #44A08D, #4ECDC4)',
                    }
                  }}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
              </Box>

              {isRecording && (
                <Box mb={3}>
                  <Typography variant="h6" color="#FF6B6B" gutterBottom>
                    🎤 Recording... Speak now!
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,107,107,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#FF6B6B'
                      }
                    }} 
                  />
                </Box>
              )}

              {showFeedback && score !== null && (
                <Box>
                  <Alert 
                    severity={score >= 70 ? 'success' : 'warning'}
                    sx={{ mb: 2, borderRadius: 3 }}
                  >
                    <Typography variant="h6">
                      {score >= 70 ? 'Great job!' : 'Keep practicing!'}
                    </Typography>
                    <Typography variant="body2">
                      Score: {score}%
                    </Typography>
                  </Alert>

                  <Box mb={2}>
                    <Typography variant="h6" gutterBottom>
                      Your Rating:
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={1}>
                      {renderStars(scoreInfo.stars)}
                    </Box>
                  </Box>

                  <Chip
                    label={scoreInfo.stars >= 4 ? 'Excellent!' : scoreInfo.stars >= 3 ? 'Good!' : 'Keep trying!'}
                    color={score >= 70 ? 'success' : 'warning'}
                    sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                  />
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        {showFeedback && (
          <Card className="game-card" sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: '#2C3E50',
              textAlign: 'center',
              mb: 3
            }}>
              Practice Tips
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" sx={{ mb: 1 }}>👄</Typography>
                  <Typography variant="h6" gutterBottom>Mouth Position</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Make sure your mouth is in the right shape for each sound
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" sx={{ mb: 1 }}>🔊</Typography>
                  <Typography variant="h6" gutterBottom>Volume</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Speak clearly and at a good volume
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" sx={{ mb: 1 }}>⏱️</Typography>
                  <Typography variant="h6" gutterBottom>Timing</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Take your time and don't rush the words
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Practice;
