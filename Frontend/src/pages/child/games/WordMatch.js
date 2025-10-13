import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { GAME_WORDS, SCORING_RANGES } from '../../../constants';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
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
  Star,
  CheckCircle,
  XCircle,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';

const WordMatch = () => {
  const { addXP, updateStreak, recordPracticeSession, endGame } = useGame();
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

  useEffect(() => { generateNewRound(); }, []);

  const generateNewRound = () => {
    const correctWord = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const wrongWords = GAME_WORDS.filter(word => word !== correctWord)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setCurrentWord(correctWord);
    setOptions([correctWord, ...wrongWords].sort(() => 0.5 - Math.random()));
    setSelectedOption(null);
    setShowFeedback(false);
    setCorrectAnswer(correctWord);
  };

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => {
    setIsRecording(false);
    simulateSpeechAnalysis();
  };

  const simulateSpeechAnalysis = async () => {
    const randomScore = Math.floor(Math.random() * 100);
    setTimeout(async () => {
      setShowFeedback(true);
      if (randomScore >= 70) {
        setScore(prev => prev + 1);
        await addXP(25);
        await updateStreak(true);
        await recordPracticeSession(randomScore, 1, 'word-match');
      } else {
        await updateStreak(false);
        await recordPracticeSession(randomScore, 1, 'word-match');
      }
    }, 2000);
  };

  const handleOptionSelect = async (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    const isCorrect = option === correctAnswer;
    setTimeout(async () => {
      setShowFeedback(true);
      if (isCorrect) {
        setScore(prev => prev + 1);
        await addXP(25);
        await updateStreak(true);
        await recordPracticeSession(100, 1, 'word-match');
      } else {
        await updateStreak(false);
        await recordPracticeSession(0, 1, 'word-match');
      }
    }, 1000);
  };

  const nextRound = async () => {
    if (round < maxRounds) {
      setRound(prev => prev + 1);
      generateNewRound();
    } else {
      setGameCompleted(true);
      const finalScore = (score / maxRounds) * 100;
      const xpEarned = Math.floor(finalScore / 10) * 10;
      await endGame(finalScore, xpEarned);
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
      if (score >= range.min && score <= range.max) return range;
    }
    return SCORING_RANGES.NEEDS_WORK;
  };

  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={32}
        fill={i < count ? '#FFD700' : 'none'}
        className={`transition-all duration-300 ${i < count ? 'animate-pulse' : ''}`}
        style={{ color: i < count ? '#FFD700' : '#E0E0E0' }}
      />
    ));

  if (gameCompleted) {
    const finalScore = (score / maxRounds) * 100;
    const scoreInfo = getScoreInfo(finalScore);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif] flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl text-center border-4 border-yellow-400 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-10 left-10 text-9xl">🎉</div>
              <div className="absolute bottom-10 right-10 text-9xl">🏆</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl">⭐</div>
            </div>

            <div className="relative z-10">
              {/* Trophy Icon */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Trophy size={64} className="text-white" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-800 mb-4">
                Game Complete!
              </h1>

              <div className="text-6xl sm:text-7xl mb-6 animate-bounce">
                🎯
              </div>

              {/* Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Final Score
                </p>
                <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {score}/{maxRounds}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-600">
                  {Math.round(finalScore)}% Accuracy
                </p>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-6">
                {renderStars(scoreInfo.stars)}
              </div>

              {/* Feedback Message */}
              <div className="mb-8">
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {scoreInfo.stars >= 4 ? '🌟 Excellent Work!' : scoreInfo.stars >= 3 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                </p>
                <p className="text-lg text-gray-600">
                  {scoreInfo.stars >= 4 
                    ? 'You\'re a word match champion!' 
                    : scoreInfo.stars >= 3 
                    ? 'You\'re doing great!' 
                    : 'Practice makes perfect!'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={restartGame}
                  className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  🎮 Back to Games
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Games</span>
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 flex items-center gap-3">
            Word Match 
            <span className="text-4xl sm:text-5xl">🎯</span>
          </h1>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg mb-8 border-2 border-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {round}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Round</p>
                <p className="text-2xl font-bold text-gray-800">{round} of {maxRounds}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {score}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Score</p>
                <p className="text-2xl font-bold text-gray-800">{score}/{maxRounds}</p>
              </div>
            </div>
          </div>
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${(round / maxRounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Game Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recording Section */}
          <div className="bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-9xl opacity-10 -mt-4 -mr-4">🎧</div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={24} />
                <h2 className="text-2xl sm:text-3xl font-bold">Listen & Speak</h2>
              </div>

              <div className="text-center mb-6">
                <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-lg animate-pulse border-4 border-white/40">
                  🎧
                </div>
                <p className="text-xl sm:text-2xl font-semibold mb-4">Say this word:</p>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-white/40">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider">
                    {currentWord.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isRecording && !showFeedback}
                  className={`flex items-center gap-3 px-6 sm:px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 scale-110' 
                      : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105'
                  } border-2 border-white/40`}
                >
                  {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
              </div>

              {isRecording && (
                <div className="mt-6 animate-pulse">
                  <p className="text-xl font-bold mb-3 text-center">🎤 Recording... Speak now!</p>
                  <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-white rounded-full animate-[pulse_1s_ease-in-out_infinite] w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Target size={24} className="text-blue-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Choose the Word</h2>
            </div>

            <div className="space-y-4">
              {options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === correctAnswer;
                const isWrong = isSelected && !isCorrect;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showFeedback}
                    className={`w-full px-6 py-5 rounded-xl font-bold text-xl transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden ${
                      showFeedback
                        ? isCorrect
                          ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white scale-105'
                          : isWrong
                          ? 'bg-gradient-to-r from-red-400 to-pink-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                        : isSelected
                        ? 'bg-gradient-to-r from-blue-400 to-purple-600 text-white scale-105'
                        : 'bg-gray-100 text-gray-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.toUpperCase()}</span>
                      {showFeedback && isCorrect && (
                        <CheckCircle size={24} className="animate-bounce" />
                      )}
                      {showFeedback && isWrong && (
                        <XCircle size={24} className="animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-6 space-y-4 animate-[fadeIn_0.5s_ease-in]">
                <div className={`p-4 rounded-xl border-2 ${
                  selectedOption === correctAnswer
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}>
                  <p className={`text-2xl font-bold mb-2 ${
                    selectedOption === correctAnswer ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedOption === correctAnswer ? '✅ Correct! Amazing!' : '❌ Not quite right!'}
                  </p>
                  <p className={`text-lg ${
                    selectedOption === correctAnswer ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {selectedOption === correctAnswer 
                      ? 'Great job! You got it right! 🎉' 
                      : `The correct answer was: ${correctAnswer.toUpperCase()} 💡`}
                  </p>
                </div>
                <button
                  onClick={nextRound}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {round < maxRounds ? '➡️ Next Round' : '🏁 Finish Game'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordMatch;