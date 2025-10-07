import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { gamesAPI, progressAPI, goalsAPI } from '../services/api';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
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
  const [loading, setLoading] = useState(false);

  // Load user data from backend on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('Loading user data from backend...');
      
      const [gameData, progressData, goalsData] = await Promise.all([
        gamesAPI.getGameData(),
        progressAPI.getProgress(),
        goalsAPI.getGoalsData()
      ]);

      console.log('Backend data received:', { gameData, progressData, goalsData });

      // Calculate current level based on XP
      const totalXP = gameData.data?.Total_XP || 0;
      const currentLevel = Math.floor(totalXP / 1000) + 1;

      const newGameProgress = {
        currentLevel,
        totalXP: totalXP,
        currentStreak: goalsData.data?.Current_Streak || 0,
        bestStreak: Math.max(progressData.data?.Best_Streak || 0, goalsData.data?.Current_Streak || 0),
        badges: [], // Will be loaded from achievements
        currentGame: null,
        score: 0
      };

      console.log('Setting game progress:', newGameProgress);
      setGameProgress(newGameProgress);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default values if backend fails
      setGameProgress({
        currentLevel: 1,
        totalXP: 0,
        currentStreak: 0,
        bestStreak: 0,
        badges: [],
        currentGame: null,
        score: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates) => {
    try {
      setGameProgress(prev => ({
        ...prev,
        ...updates
      }));

      // Update backend
      await progressAPI.updateProgress({
        averageScore: updates.averageScore || gameProgress.averageScore,
        bestScore: updates.bestScore || gameProgress.bestScore,
        practiceDays: updates.practiceDays || gameProgress.practiceDays,
        wordsThisWeek: updates.wordsThisWeek || gameProgress.wordsThisWeek
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const addXP = async (amount) => {
    try {
      console.log(`Adding ${amount} XP to user`);
      
      // Update backend first
      await gamesAPI.addXP({
        xpAmount: amount,
        gameType: gameProgress.currentGame || 'general'
      });

      // Update local state
      setGameProgress(prev => {
        const newTotalXP = prev.totalXP + amount;
        const newLevel = Math.floor(newTotalXP / 1000) + 1;
        return {
          ...prev,
          totalXP: newTotalXP,
          currentLevel: newLevel
        };
      });

      console.log(`XP added successfully. New total: ${gameProgress.totalXP + amount}`);
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const addBadge = async (badgeId) => {
    try {
      setGameProgress(prev => ({
        ...prev,
        badges: [...new Set([...prev.badges, badgeId])]
      }));

      // Add achievement to backend
      await gamesAPI.addAchievement({
        achievementType: badgeId,
        description: `${badgeId} achievement earned!`,
        xpReward: 50
      });
    } catch (error) {
      console.error('Error adding badge:', error);
    }
  };

  // Day-wise streak update: increments once per calendar day; resets on gaps; no-op if already counted today
  const updateStreak = async () => {
    try {
      const res = await goalsAPI.touchStreak();
      const { Current_Streak, Best_Streak } = res.data || {};
      setGameProgress(prev => ({
        ...prev,
        currentStreak: typeof Current_Streak === 'number' ? Current_Streak : prev.currentStreak,
        bestStreak: typeof Best_Streak === 'number' ? Best_Streak : prev.bestStreak
      }));
      console.log('Streak touched (day-wise):', res.data);
    } catch (error) {
      console.error('Error touching streak:', error);
    }
  };

  const startGame = async (gameType) => {
    try {
      // Inform backend a game attempt has started (increments Games_Played)
      await gamesAPI.startGame({ gameType: gameType || 'general' });
    } catch (e) {
      console.warn('Failed to record game start, proceeding locally:', e?.message);
    }
    setIsGameActive(true);
    setGameProgress(prev => ({
      ...prev,
      currentGame: gameType,
      score: 0
    }));
  };

  const endGame = async (finalScore, xpEarned = 0) => {
    try {
      console.log(`Ending game with score: ${finalScore}, XP: ${xpEarned}`);
      
      // Record game completion in backend
      await gamesAPI.recordCompletion({
        gameType: gameProgress.currentGame,
        score: finalScore,
        xpEarned,
        achievements: 0
      });

      // Update local state
      setGameProgress(prev => {
        const newTotalXP = prev.totalXP + xpEarned;
        const newLevel = Math.floor(newTotalXP / 1000) + 1;
        return {
          ...prev,
          currentGame: null,
          totalXP: newTotalXP,
          currentLevel: newLevel
        };
      });

      console.log(`Game ended successfully. New total XP: ${gameProgress.totalXP + xpEarned}`);
    } catch (error) {
      console.error('Error ending game:', error);
    } finally {
      setIsGameActive(false);
    }
  };

  const recordPracticeSession = async (score, wordsPracticed = 1, gameType = 'general') => {
    try {
      console.log(`Recording practice session: score=${score}, words=${wordsPracticed}, type=${gameType}`);
      
      // Update best streak if current streak is higher
      const bestStreak = Math.max(gameProgress.bestStreak, gameProgress.currentStreak);
      
      await progressAPI.recordSession({
        score,
        wordsPracticed,
        gameType,
        currentStreak: gameProgress.currentStreak
      });
      console.log('Practice session recorded successfully');
    } catch (error) {
      console.error('Error recording practice session:', error);
    }
  };

  const refreshData = async () => {
    console.log('Refreshing user data from backend...');
    await loadUserData();
  };

  const value = {
    gameProgress,
    isGameActive,
    loading,
    updateProgress,
    addXP,
    addBadge,
    updateStreak,
    startGame,
    endGame,
    recordPracticeSession,
    loadUserData,
    refreshData
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
