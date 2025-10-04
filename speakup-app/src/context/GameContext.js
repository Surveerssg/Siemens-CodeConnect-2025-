import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameProgress, setGameProgress] = useState({
    currentLevel: 1,
    totalXP: 0,
    currentStreak: 0,
    bestStreak: 0,
    badges: [],
    currentGame: null,
    score: 0
  });

  const [isGameActive, setIsGameActive] = useState(false);

  const updateProgress = (updates) => {
    setGameProgress(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addXP = (amount) => {
    setGameProgress(prev => ({
      ...prev,
      totalXP: prev.totalXP + amount
    }));
  };

  const addBadge = (badgeId) => {
    setGameProgress(prev => ({
      ...prev,
      badges: [...new Set([...prev.badges, badgeId])]
    }));
  };

  const updateStreak = (increment = true) => {
    setGameProgress(prev => {
      const newStreak = increment ? prev.currentStreak + 1 : 0;
      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });
  };

  const startGame = (gameType) => {
    setIsGameActive(true);
    setGameProgress(prev => ({
      ...prev,
      currentGame: gameType,
      score: 0
    }));
  };

  const endGame = () => {
    setIsGameActive(false);
    setGameProgress(prev => ({
      ...prev,
      currentGame: null
    }));
  };

  const value = {
    gameProgress,
    isGameActive,
    updateProgress,
    addXP,
    addBadge,
    updateStreak,
    startGame,
    endGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
