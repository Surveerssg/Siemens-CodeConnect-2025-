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

const BalloonPop = () => {
  const { addXP, updateStreak } = useGame();
  const navigate = useNavigate();
  
  const [balloons, setBalloons] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [poppedBalloons, setPoppedBalloons] = useState(0);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameCompleted(true);
    }
  }, [timeLeft, gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const interval = setInterval(() => {
        generateNewBalloon();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameCompleted]);

  const generateNewBalloon = () => {
    const word = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const newBalloon = {
      id: Date.now(),
      word: word,
      x: Math.random() * 80 + 10,
      y: 100,
      color: ['#FF6B6B', '#4ECDC4', '#9B59B6', '#F39C12', '#E74C3C'][Math.floor(Math.random() * 5)],
      popped: false
    };
    
    setBalloons(prev => [...prev, newBalloon]);
    
    setTimeout(() => {
      setBalloons(prev => prev.filter(balloon => balloon.id !== newBalloon.id));
    }, 8000);
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(60);
    setScore(0);
    setBalloons([]);
    setPoppedBalloons(0);
    generateNewBalloon();
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
        const targetBalloon = balloons.find(balloon => 
          balloon.word === currentWord && !balloon.popped
        );
        
        if (targetBalloon) {
          popBalloon(targetBalloon.id);
          setScore(prev => prev + 10);
          addXP(10);
          updateStreak(true);
        }
      } else {
        updateStreak(false);
      }
      
      setTimeout(() => {
        setShowFeedback(false);
        setCurrentWord('');
      }, 2000);
    }, 1500);
  };

  const popBalloon = (balloonId) => {
    setBalloons(prev => 
      prev.map(balloon => 
        balloon.id === balloonId 
          ? { ...balloon, popped: true }
          : balloon
      )
    );
    setPoppedBalloons(prev => prev + 1);
    
    setTimeout(() => {
      setBalloons(prev => prev.filter(balloon => balloon.id !== balloonId));
    }, 500);
  };

  const selectWord = (word) => {
    setCurrentWord(word);
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(60);
    setBalloons([]);
    setPoppedBalloons(0);
    setCurrentWord('');
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

  if (!gameStarted) {
    return (
      <div className="floating-letters">
        {[...Array(12)].map((_, i) => (
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
          py: 4,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Card className="game-card" sx={{ 
            width: '100%',
            textAlign: 'center',
            p: 4,
            background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
            color: 'white'
          }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎈 Balloon Pop! 🎈
            </Typography>
            
            <Typography variant="h5" gutterBottom>
              Pop balloons by saying the words correctly!
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Balloons will float up with words on them. Click on a balloon to select it, 
              then record yourself saying the word. If you say it correctly, the balloon will pop!
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                onClick={startGame}
                className="child-friendly-button"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '1.2rem',
                  px: 4,
                  py: 2,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Start Game
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/games')}
                className="child-friendly-button"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '1.2rem',
                  px: 4,
                  py: 2,
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

  if (gameCompleted) {
    const scoreInfo = getScoreInfo((score / 10) * 10);
    
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
              🎉 Time's Up! 🎉
            </Typography>
            
            <Typography variant="h4" gutterBottom>
              Balloons Popped: {poppedBalloons}
            </Typography>
            
            <Typography variant="h5" gutterBottom>
              Final Score: {score}
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={1} mb={3}>
              {renderStars(scoreInfo.stars)}
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {scoreInfo.stars >= 4 ? 'Amazing popping!' : scoreInfo.stars >= 3 ? 'Great job!' : 'Keep practicing!'}
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
      {[...Array(8)].map((_, i) => (
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
            Balloon Pop 🎈
          </Typography>
        </Box>

        <Card className="game-card" sx={{ mb: 4, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#2C3E50' }}>
              Time Left: {timeLeft}s
            </Typography>
            <Typography variant="h6" sx={{ color: '#4ECDC4' }}>
              Score: {score}
            </Typography>
            <Typography variant="h6" sx={{ color: '#FF6B6B' }}>
              Popped: {poppedBalloons}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(timeLeft / 60) * 100} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(255, 107, 107, 0.2)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #FF6B6B, #E55A5A)',
                borderRadius: 5
              }
            }} 
          />
        </Card>

        <Box sx={{ 
          position: 'relative', 
          height: '400px', 
          background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4
        }}>
          {balloons.map((balloon) => (
            <Box
              key={balloon.id}
              onClick={() => selectWord(balloon.word)}
              sx={{
                position: 'absolute',
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                width: 80,
                height: 100,
                background: balloon.color,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textAlign: 'center',
                transform: balloon.popped ? 'scale(0)' : 'scale(1)',
                transition: 'all 0.5s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: balloon.popped ? 'scale(0)' : 'scale(1.1)',
                }
              }}
            >
              {balloon.word.toUpperCase()}
            </Box>
          ))}
        </Box>

        {currentWord && (
          <Card className="game-card" sx={{ 
            background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
            color: 'white',
            textAlign: 'center',
            p: 4
          }}>
            <Typography variant="h5" gutterBottom>
              Selected Word
            </Typography>
            
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {currentWord.toUpperCase()}
            </Typography>
            
            <Button
              variant="contained"
              startIcon={isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isRecording && !showFeedback}
              className="child-friendly-button"
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '1.2rem',
                px: 4,
                py: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {isRecording ? 'Stop Recording' : 'Record Word'}
            </Button>

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

            {showFeedback && (
              <Alert 
                severity="success"
                sx={{ mt: 3, borderRadius: 3 }}
              >
                <Typography variant="h6">
                  Great job! Balloon popped! 🎉
                </Typography>
              </Alert>
            )}
          </Card>
        )}
      </Container>
    </div>
  );
};

export default BalloonPop;
