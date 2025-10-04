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
    { step: 1, clue: "I'm red and round, and you can eat me. What am I?", word: "apple", location: "🍎 Garden" },
    { step: 2, clue: "I bounce and you can play with me. What am I?", word: "ball", location: "⚽ Playground" },
    { step: 3, clue: "I say 'meow' and I'm furry. What am I?", word: "cat", location: "🐱 Pet Shop" },
    { step: 4, clue: "I'm big and gray with a long trunk. What am I?", word: "elephant", location: "🐘 Zoo" },
    { step: 5, clue: "I'm shiny and you can wear me on your finger. What am I?", word: "ring", location: "💍 Gift Chest" }
  ];

  useEffect(() => {
    if (currentStep <= maxSteps) {
      const currentGift = treasureMap.find(t => t.step === currentStep);
      setCurrentClue(currentGift.clue);
      setCurrentWord(currentGift.word);
    }
  }, [currentStep]);

  const startRecording = () => setIsRecording(true);
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
          setTimeout(() => setGameCompleted(true), 2000);
        } else {
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setShowFeedback(false);
          }, 2000);
        }
      } else {
        updateStreak(false);
        setTimeout(() => setShowFeedback(false), 2000);
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
      if (score >= range.min && score <= range.max) return range;
    }
    return SCORING_RANGES.NEEDS_WORK;
  };

  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={24}
        className={`star ${i < count ? 'filled' : ''}`}
        style={{ color: i < count ? '#FFD700' : '#E0E0E0' }}
      />
    ));

  if (gameCompleted) {
    const finalScore = (score / maxSteps) * 100;
    const scoreInfo = getScoreInfo(finalScore);
    
    return (
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
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
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
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              Back to Games
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  const currentGift = treasureMap.find(t => t.step === currentStep);

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 2,
      py: 4
    }}>
      {/* ...rest of the main game UI unchanged... */}
      {/* Box, Cards, Recording buttons, Alerts, Progress cards remain the same */}
    </Container>
  );
};

export default GiftHunt;
