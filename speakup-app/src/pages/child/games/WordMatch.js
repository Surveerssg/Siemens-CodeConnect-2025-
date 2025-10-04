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
  XCircle
} from 'lucide-react';

const WordMatch = () => {
  const { addXP, updateStreak } = useGame();
  const navigate = useNavigate();
  
  const [currentWord, setCurrentWord] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(5);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    const correctWord = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const wrongWords = GAME_WORDS
      .filter(word => word !== correctWord)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const allOptions = [correctWord, ...wrongWords].sort(() => 0.5 - Math.random());
    
    setCurrentWord(correctWord);
    setOptions(allOptions);
    setSelectedOption(null);
    setShowFeedback(false);
    setCorrectAnswer(correctWord);
  };

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
        addXP(25);
        updateStreak(true);
      } else {
        updateStreak(false);
      }
    }, 2000);
  };

  const handleOptionSelect = (option) => {
    if (showFeedback) return;
    
    setSelectedOption(option);
    const isCorrect = option === correctAnswer;
    
    setTimeout(() => {
      setShowFeedback(true);
      
      if (isCorrect) {
        setScore(prev => prev + 1);
        addXP(25);
        updateStreak(true);
      } else {
        updateStreak(false);
      }
    }, 1000);
  };

  const nextRound = () => {
    if (round < maxRounds) {
      setRound(prev => prev + 1);
      generateNewRound();
    } else {
      setGameCompleted(true);
    }
  };

  const restartGame = () => {
    setScore(0);
    setRound(1);
    setGameCompleted(false);
    generateNewRound();
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
    const finalScore = (score / maxRounds) * 100;
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
            background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
            color: 'white'
          }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎉 Game Complete! 🎉
            </Typography>
            
            <Typography variant="h4" gutterBottom>
              Final Score: {score}/{maxRounds}
            </Typography>
            
            <Typography variant="h5" gutterBottom>
              {Math.round(finalScore)}% Accuracy
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={1} mb={3}>
              {renderStars(scoreInfo.stars)}
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {scoreInfo.stars >= 4 ? 'Excellent work!' : scoreInfo.stars >= 3 ? 'Good job!' : 'Keep practicing!'}
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
                Play Again
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
            onClick={() => navigate('/games')}
            sx={{ color: '#4ECDC4', mr: 2 }}
          >
            Back to Games
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold'
          }}>
            Word Match 🎯
          </Typography>
        </Box>

        <Card className="game-card" sx={{ mb: 4, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#2C3E50' }}>
              Round {round} of {maxRounds}
            </Typography>
            <Typography variant="h6" sx={{ color: '#4ECDC4' }}>
              Score: {score}/{maxRounds}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(round / maxRounds) * 100} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(78, 205, 196, 0.2)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #4ECDC4, #44A08D)',
                borderRadius: 5
              }
            }} 
          />
        </Card>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card className="game-card" sx={{ 
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              textAlign: 'center',
              p: 4
            }}>
              <Typography variant="h5" gutterBottom>
                Listen to the word
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
                🎧
              </Avatar>

              <Typography variant="h3" sx={{ 
                fontWeight: 'bold',
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                {currentWord.toUpperCase()}
              </Typography>
              
              <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  startIcon={isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isRecording && !showFeedback}
                  sx={{
                    background: isRecording 
                      ? 'rgba(255,255,255,0.2)' 
                      : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  {isRecording ? 'Stop Recording' : 'Record Word'}
                </Button>
              </Box>

              {isRecording && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    🎤 Recording... Speak now!
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white'
                      }
                    }} 
                  />
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="game-card" sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                textAlign: 'center',
                mb: 3
              }}>
                Choose the correct word
              </Typography>
              
              <Grid container spacing={2}>
                {options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === correctAnswer;
                  const isWrong = isSelected && !isCorrect;
                  
                  return (
                    <Grid item xs={12} key={index}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleOptionSelect(option)}
                        disabled={showFeedback}
                        sx={{
                          height: 60,
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          background: showFeedback 
                            ? (isCorrect ? '#4CAF50' : isWrong ? '#F44336' : '#E0E0E0')
                            : (isSelected ? '#4ECDC4' : '#F5F5F5'),
                          color: showFeedback 
                            ? 'white' 
                            : (isSelected ? 'white' : '#2C3E50'),
                          '&:hover': {
                            background: showFeedback 
                              ? (isCorrect ? '#4CAF50' : isWrong ? '#F44336' : '#E0E0E0')
                              : (isSelected ? '#4ECDC4' : '#4ECDC4'),
                          }
                        }}
                        startIcon={
                          showFeedback && isCorrect ? <CheckCircle size={20} /> :
                          showFeedback && isWrong ? <XCircle size={20} /> :
                          null
                        }
                      >
                        {option.toUpperCase()}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              {showFeedback && (
                <Box mt={3} textAlign="center">
                  <Alert 
                    severity={selectedOption === correctAnswer ? 'success' : 'error'}
                    sx={{ mb: 2, borderRadius: 3 }}
                  >
                    <Typography variant="h6">
                      {selectedOption === correctAnswer ? 'Correct! 🎉' : 'Try again! 😊'}
                    </Typography>
                    <Typography variant="body2">
                      {selectedOption === correctAnswer 
                        ? 'Great job! You got it right!' 
                        : `The correct answer was: ${correctAnswer.toUpperCase()}`
                      }
                    </Typography>
                  </Alert>
                  
                  <Button
                    variant="contained"
                    onClick={nextRound}
                    className="child-friendly-button"
                    sx={{
                      background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #44A08D, #4ECDC4)',
                      }
                    }}
                  >
                    {round < maxRounds ? 'Next Round' : 'Finish Game'}
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default WordMatch;
