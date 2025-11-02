import React, { useState, useRef, useEffect } from 'react';
import { Mic, Star, Trophy, Volume2, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

const CrosswordGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, complete
  const [recording, setRecording] = useState(false);
  const [currentClue, setCurrentClue] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showWord, setShowWord] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Crossword puzzle data - 5x5 grid
  const [puzzle] = useState({
    grid: [
      ['C', 'A', 'T', '', ''],
      ['', '', 'R', '', ''],
      ['D', 'O', 'G', '', ''],
      ['', '', 'E', '', ''],
      ['', '', 'E', 'G', 'G']
    ],
    clues: [
      { id: 1, word: 'CAT', row: 0, col: 0, direction: 'across', hint: '🐱 Meow! A furry pet', filled: false },
      { id: 2, word: 'DOG', row: 2, col: 0, direction: 'across', hint: '🐕 Woof! Man\'s best friend', filled: false },
      { id: 3, word: 'EGG', row: 4, col: 2, direction: 'across', hint: '🥚 Chickens lay these', filled: false },
      { id: 4, word: 'TREE', row: 0, col: 2, direction: 'down', hint: '🌳 It has leaves and branches', filled: false }
    ]
  });

  const [solvedClues, setSolvedClues] = useState([]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setAttempts(0);
    setSolvedClues([]);
    setCurrentClue(null);
    setFeedback(null);
  };

  const selectClue = (clue) => {
    if (solvedClues.includes(clue.id)) return;
    setCurrentClue(clue);
    setFeedback(null);
    setShowWord(false); // Hide word when selecting new clue
  };

  const startRecording = async () => {
    if (!currentClue) {
      setFeedback({ type: 'error', message: 'Please select a clue first!' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzePronunciation(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Microphone access denied!' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const analyzePronunciation = async (audioBlob) => {
    setAnalyzing(true);
    setAttempts(prev => prev + 1);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('text', currentClue.word);

      const response = await fetch('https://pronunciation-score-final.onrender.com/analyze/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      const pronunciationScore = result.final_score;

      if (pronunciationScore >= 60) {
        // Success!
        setSolvedClues(prev => [...prev, currentClue.id]);
        const earnedScore = Math.round(pronunciationScore);
        setScore(prev => prev + earnedScore);
        setFeedback({
          type: 'success',
          message: `Perfect! +${earnedScore} points! 🎉`,
          score: pronunciationScore
        });

        // Check if game is complete
        if (solvedClues.length + 1 === puzzle.clues.length) {
          setTimeout(() => setGameState('complete'), 2000);
        } else {
          setTimeout(() => {
            setCurrentClue(null);
            setFeedback(null);
            setShowWord(false);
          }, 2000);
        }
      } else {
        setFeedback({
          type: 'retry',
          message: `Score: ${Math.round(pronunciationScore)}%. Try again! Need 60% or higher.`,
          score: pronunciationScore
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Error analyzing speech. Please try again!'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getCellColor = (row, col) => {
    const cell = puzzle.grid[row][col];
    if (!cell) return 'bg-gray-800';

    // Check if this cell is part of any solved clue
    for (const clueId of solvedClues) {
      const clue = puzzle.clues.find(c => c.id === clueId);
      if (clue.direction === 'across' && clue.row === row && col >= clue.col && col < clue.col + clue.word.length) {
        return 'bg-green-400 text-gray-900 font-bold animate-pulse';
      }
      if (clue.direction === 'down' && clue.col === col && row >= clue.row && row < clue.row + clue.word.length) {
        return 'bg-green-400 text-gray-900 font-bold animate-pulse';
      }
    }

    // Highlight current clue
    if (currentClue) {
      if (currentClue.direction === 'across' && currentClue.row === row && col >= currentClue.col && col < currentClue.col + currentClue.word.length) {
        return 'bg-yellow-300 text-gray-900 font-bold';
      }
      if (currentClue.direction === 'down' && currentClue.col === col && row >= currentClue.row && row < currentClue.row + currentClue.word.length) {
        return 'bg-yellow-300 text-gray-900 font-bold';
      }
    }

    return 'bg-white text-gray-400';
  };

  const MenuScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-transform">
        <div className="mb-6">
          <Sparkles className="w-20 h-20 mx-auto text-yellow-500 animate-bounce" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Word Puzzle
        </h1>
        <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Solve the crossword by saying words correctly! 🎤
        </p>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          Start Game! 🚀
        </button>
      </div>
    </div>
  );

  const CompleteScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-6 animate-bounce" />
        <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Amazing! 🎉
        </h1>
        <p className="text-2xl text-gray-600 mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          You solved the puzzle!
        </p>
        <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl p-6 mb-6">
          <p className="text-4xl font-bold text-purple-800 mb-2">{score} Points</p>
          <p className="text-lg text-gray-700">in {attempts} attempts</p>
        </div>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          Play Again! 🔄
        </button>
      </div>
    </div>
  );

  const GameScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Score: {score}
            </span>
          </div>
          <div className="text-lg text-gray-600" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {solvedClues.length}/{puzzle.clues.length} Complete
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Crossword Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Word Puzzle 🧩
            </h2>
            <div className="inline-block mx-auto">
              {puzzle.grid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {row.map((cell, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`w-16 h-16 border-2 border-gray-400 flex items-center justify-center text-2xl font-bold transition-all ${getCellColor(rowIdx, colIdx)}`}
                    >
                      {solvedClues.some(id => {
                        const clue = puzzle.clues.find(c => c.id === id);
                        return (clue.direction === 'across' && clue.row === rowIdx && colIdx >= clue.col && colIdx < clue.col + clue.word.length) ||
                               (clue.direction === 'down' && clue.col === colIdx && rowIdx >= clue.row && rowIdx < clue.row + clue.word.length);
                      }) ? cell : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Clues and Controls */}
          <div className="space-y-4">
            {/* Clues */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Word Clues 📝
              </h3>
              <div className="space-y-2">
                {puzzle.clues.map(clue => (
                  <button
                    key={clue.id}
                    onClick={() => selectClue(clue)}
                    disabled={solvedClues.includes(clue.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all text-lg font-semibold ${
                      solvedClues.includes(clue.id)
                        ? 'bg-green-200 text-green-800 line-through'
                        : currentClue?.id === clue.id
                        ? 'bg-yellow-300 text-gray-800 shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <div className="flex justify-between items-center">
                      <span>{clue.hint}</span>
                      {solvedClues.includes(clue.id) && <Star className="w-6 h-6 text-yellow-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                Say the Word! 🎤
              </h3>
              
              {currentClue && (
                <div className="bg-blue-100 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-600" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {showWord ? 'Say this word:' : 'Click to see the word:'}
                    </p>
                    <button
                      onClick={() => setShowWord(!showWord)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      <Volume2 className="w-5 h-5" />
                      {showWord ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showWord ? (
                    <p className="text-4xl font-bold text-blue-600 animate-bounce" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {currentClue.word}
                    </p>
                  ) : (
                    <p className="text-4xl font-bold text-gray-400" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      ? ? ?
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={!currentClue || analyzing}
                className={`w-full py-6 rounded-2xl text-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 ${
                  recording
                    ? 'bg-red-500 text-white animate-pulse'
                    : analyzing
                    ? 'bg-gray-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:shadow-xl hover:scale-105'
                }`}
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <Mic className={`w-8 h-8 ${recording ? 'animate-bounce' : ''}`} />
                {analyzing ? 'Analyzing...' : recording ? 'Stop Recording' : 'Start Recording'}
              </button>

              {/* Feedback */}
              {feedback && (
                <div className={`mt-4 p-4 rounded-xl text-center text-lg font-bold ${
                  feedback.type === 'success'
                    ? 'bg-green-200 text-green-800'
                    : feedback.type === 'retry'
                    ? 'bg-yellow-200 text-yellow-800'
                    : feedback.type === 'recording'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-red-200 text-red-800'
                }`} style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {feedback.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'menu' && <MenuScreen />}
      {gameState === 'playing' && <GameScreen />}
      {gameState === 'complete' && <CompleteScreen />}
    </>
  );
};

export default CrosswordGame;