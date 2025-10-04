import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { GAME_WORDS, SCORING_RANGES } from '../../../constants';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Avatar,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  RotateCcw,
  Star,
  CheckCircle,
  XCircle,
  MapPin,
  Gift
} from 'lucide-react';

const GiftHunt = () => {
  const { addXP, updateStreak } = useGame();
  const navigate = useNavigate();
  
  const [currentClue, setCurrentClue] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxSteps] = useState(5);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [treasureFound, setGiftFound] = useState(false);

  const treasureMap = [
    {
      step: 1,
      clue: "I'm red and round, and you can eat me. What am I?",
      word: "apple",
      location: "🍎 Garden"
    },
    {
      step: 2,
      clue: "I bounce and you can play with me. What am I?",
      word: "ball",
      location: "⚽ Playground"
    },
    {
      step: 3,
      clue: "I say 'meow' and I'm furry. What am I?",
      word: "cat",
      location: "🐱 Pet Shop"
    },
    {
      step: 4,
      clue: "I'm big and gray with a long trunk. What am I?",
      word: "elephant",
      location: "🐘 Zoo"
    },
    {
      step: 5,
      clue: "I'm shiny and you can wear me on your finger. What am I?",
      word: "ring",
      location: "💍 Gift Chest"
    }
  ];

  useEffect(() => {
    if (currentStep <= maxSteps) {
      const currentGift = treasureMap.find(t => t.step === currentStep);
      setCurrentClue(currentGift.clue);
      setCurrentWord(currentGift.word);
    }
  }, [currentStep]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    simulateSpeechAnalysis();
  };

  const simulateSpeechAnalysis = () => {
    const randomScore = Math.floor(Math.random() * 100);
    
    setTimeout(() => {
      setShowFeedback(true);
      
      if (randomScore >= 70) {
        setScore(prev => prev + 1);
        addXP(20);
        updateStreak(true);
        
        if (currentStep === maxSteps) {
          setGiftFound(true);
          setTimeout(() => {
            setGameCompleted(true);
          }, 2000);
        } else {
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setShowFeedback(false);
          }, 2000);
        }
      } else {
        updateStreak(false);
        setTimeout(() => {
          setShowFeedback(false);
        }, 2000);
      }
    }, 2000);
  };

  const restartGame = () => {
    setCurrentStep(1);
    setScore(0);
    setGameCompleted(false);
    setGiftFound(false);
    setShowFeedback(false);
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
        size={24}
        className={`star ${i < count ? 'filled' : ''}`}
        style={{ color: i < count ? '#FFD700' : '#E0E0E0' }}
      />
    ));
  };

  if (gameCompleted) {
    const finalScore = (score / maxSteps) * 100;
    const scoreInfo = getScoreInfo(finalScore);
    
    return (
      <div className="floating-letters">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="floating-letter"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              fontSize: `${Math.random() * 2 + 1}rem`
            }}
          >
            {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
          </div>
        ))}
        
        <Container maxWidth="md" sx={{ 
          minHeight: '100vh',
          position: 'relative',
          zIndex: 2,
          py: 4,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Card className="game-card" sx={{ 
            width: '100%',
            textAlign: 'center',
            p: 4,
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: 'white'
          }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              🏴‍☠️ Gift Found! 🏴‍☠️
            </Typography>
            
            <Typography variant="h4" gutterBottom>
              Congratulations, Gift Hunter!
            </Typography>
            
            <Typography variant="h5" gutterBottom>
              Steps Completed: {score}/{maxSteps}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {Math.round(finalScore)}% Success Rate
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={1} mb={3}>
              {renderStars(scoreInfo.stars)}
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {scoreInfo.stars >= 4 ? 'Excellent treasure hunting!' : scoreInfo.stars >= 3 ? 'Great adventure!' : 'Keep exploring!'}
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                variant="contained"
                onClick={restartGame}
                className="child-friendly-button"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Hunt Again
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/games')}
                className="child-friendly-button"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Back to Games
              </Button>
            </Box>
          </Card>
        </Container>
      </div>
    );
  }

  const currentGift = treasureMap.find(t => t.step === currentStep);

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
      
      <Container maxWidth="lg" sx={{ 
        minHeight: '100vh',
        position: 'relative',
        zIndex: 2,
        py: 4
      }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/games')}
            sx={{ color: '#4ECDC4', mr: 2 }}
          >
            Back to Games
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold'
          }}>
            Gift Hunt 🏴‍☠️
          </Typography>
        </Box>

        <Card className="game-card" sx={{ mb: 4, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#2C3E50' }}>
              Step {currentStep} of {maxSteps}
            </Typography>
            <Typography variant="h6" sx={{ color: '#4ECDC4' }}>
              Score: {score}/{maxSteps}
            </Typography>
            <Typography variant="h6" sx={{ color: '#9B59B6' }}>
              {currentGift?.location}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(currentStep / maxSteps) * 100} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(155, 89, 182, 0.2)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #9B59B6, #8E44AD)',
                borderRadius: 5
              }
            }} 
          />
        </Card>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card className="game-card" sx={{ 
              background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
              color: 'white',
              textAlign: 'center',
              p: 4
            }}>
              <Typography variant="h5" gutterBottom>
                🗺️ Gift Map Clue
              </Typography>
              
              <Avatar 
                className="avatar"
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 3,
                  fontSize: '4rem',
                  background: 'rgba(255,255,255,0.2)'
                }}
              >
                🗺️
              </Avatar>

              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                lineHeight: 1.4
              }}>
                {currentClue}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                mb: 3,
                opacity: 0.9
              }}>
                Think about the clue and say the word out loud!
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="game-card" sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                textAlign: 'center',
                mb: 3
              }}>
                🎤 Record Your Answer
              </Typography>
              
              <Box textAlign="center" mb={3}>
                <Typography variant="h4" sx={{ 
                  color: '#9B59B6',
                  fontWeight: 'bold',
                  mb: 2
                }}>
                  {currentWord.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Say this word clearly into the microphone
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="center" mb={3}>
                <Button
                  variant="contained"
                  startIcon={isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isRecording && !showFeedback}
                  className="child-friendly-button"
                  sx={{
                    height: 60,
                    fontSize: '1.3rem',
                    background: isRecording 
                      ? 'linear-gradient(45deg, #FF6B6B, #E55A5A)' 
                      : 'linear-gradient(45deg, #9B59B6, #8E44AD)',
                    '&:hover': {
                      background: isRecording 
                        ? 'linear-gradient(45deg, #E55A5A, #FF6B6B)' 
                        : 'linear-gradient(45deg, #8E44AD, #9B59B6)',
                    }
                  }}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
              </Box>

              {isRecording && (
                <Box mb={3}>
                  <Typography variant="h6" color="#9B59B6" gutterBottom>
                    🎤 Recording... Speak now!
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(155, 89, 182, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#9B59B6'
                      }
                    }} 
                  />
                </Box>
              )}

              {showFeedback && (
                <Box>
                  <Alert 
                    severity="success"
                    sx={{ mb: 2, borderRadius: 3 }}
                  >
                    <Typography variant="h6">
                      Excellent! Clue solved! 🎉
                    </Typography>
                    <Typography variant="body2">
                      You found the treasure at {currentGift?.location}!
                    </Typography>
                  </Alert>
                  
                  {currentStep < maxSteps && (
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Moving to the next location...
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        <Card className="game-card" sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            color: '#2C3E50',
            textAlign: 'center',
            mb: 3
          }}>
            🏴‍☠️ Gift Hunt Progress
          </Typography>
          <Grid container spacing={2}>
            {treasureMap.map((treasure, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={treasure.step}>
                <Box 
                  textAlign="center" 
                  p={2}
                  sx={{
                    background: currentStep > treasure.step 
                      ? 'linear-gradient(135deg, #4CAF50, #45A049)'
                      : currentStep === treasure.step
                      ? 'linear-gradient(135deg, #9B59B6, #8E44AD)'
                      : 'linear-gradient(135deg, #E0E0E0, #BDBDBD)',
                    color: 'white',
                    borderRadius: 2,
                    opacity: currentStep >= treasure.step ? 1 : 0.6
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {currentStep > treasure.step ? '✅' : 
                     currentStep === treasure.step ? '🎯' : '🔒'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Step {treasure.step}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {treasure.location}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </div>
  );
};

export default GiftHunt;
