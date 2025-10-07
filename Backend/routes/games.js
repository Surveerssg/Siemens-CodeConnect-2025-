const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');
const { validateGame } = require('../middleware/validation');

const router = express.Router();

// Get user game data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const gamesQuery = await admin.firestore()
      .collection('games')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (gamesQuery.empty) {
      // Create default game data if none exists
      const defaultGameData = {
        userId: req.userId,
        Achievements: 0,
        Games_Played: 0,
        Total_XP: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGameRef = await admin.firestore()
        .collection('games')
        .add(defaultGameData);

      return res.json({
        success: true,
        data: {
          id: newGameRef.id,
          ...defaultGameData
        }
      });
    }

    const gameData = gamesQuery.docs[0];
    res.json({
      success: true,
      data: {
        id: gameData.id,
        ...gameData.data()
      }
    });
  } catch (error) {
    console.error('Error fetching game data:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Update user game data
router.put('/', authenticateToken, validateGame, async (req, res) => {
  try {
    const { achievements, gamesPlayed, totalXP } = req.body;
    
    const updateData = {
      Achievements: achievements,
      Games_Played: gamesPlayed,
      Total_XP: totalXP,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if game document exists
    const gamesQuery = await admin.firestore()
      .collection('games')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (gamesQuery.empty) {
      // Create new game document
      const newGameData = {
        userId: req.userId,
        ...updateData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGameRef = await admin.firestore()
        .collection('games')
        .add(newGameData);

      return res.json({
        success: true,
        message: 'Game data created successfully',
        data: {
          id: newGameRef.id,
          ...newGameData
        }
      });
    }

    // Update existing game data
    const gameDoc = gamesQuery.docs[0];
    await gameDoc.ref.update(updateData);

    res.json({
      success: true,
      message: 'Game data updated successfully',
      data: {
        id: gameDoc.id,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating game data:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Add XP to user
router.post('/xp', authenticateToken, async (req, res) => {
  try {
    const { xpAmount, gameType, achievement } = req.body;
    
    if (typeof xpAmount !== 'number' || xpAmount <= 0) {
      return res.status(400).json({ error: 'XP amount must be a positive number' });
    }

    // Get current game data
    const gamesQuery = await admin.firestore()
      .collection('games')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    let gameDoc;
    if (gamesQuery.empty) {
      // Create new game document
      const newGameData = {
        userId: req.userId,
        Achievements: achievement ? 1 : 0,
        Games_Played: 1,
        Total_XP: xpAmount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGameRef = await admin.firestore()
        .collection('games')
        .add(newGameData);
      
      gameDoc = { id: newGameRef.id, data: () => newGameData };
    } else {
      gameDoc = gamesQuery.docs[0];
      const currentData = gameDoc.data();
      
      // Update game data
      const updateData = {
        Total_XP: currentData.Total_XP + xpAmount,
        Games_Played: currentData.Games_Played + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (achievement) {
        updateData.Achievements = currentData.Achievements + 1;
      }

      await gameDoc.ref.update(updateData);
    }

    // Log the XP gain
    await admin.firestore()
      .collection('xp_logs')
      .add({
        userId: req.userId,
        xpAmount,
        gameType: gameType || 'general',
        achievement: achievement || false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'XP added successfully',
      data: {
        xpAmount,
        gameType: gameType || 'general',
        achievement: achievement || false
      }
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Mark a game attempt as started (increments Games_Played by 1)
router.post('/started', authenticateToken, async (req, res) => {
  try {
    const { gameType } = req.body;

    const gamesQuery = await admin.firestore()
      .collection('games')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (gamesQuery.empty) {
      const newGameData = {
        userId: req.userId,
        Achievements: 0,
        Games_Played: 1,
        Total_XP: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await admin.firestore().collection('games').add(newGameData);
    } else {
      const gameDoc = gamesQuery.docs[0];
      const currentData = gameDoc.data();
      await gameDoc.ref.update({
        Games_Played: (currentData.Games_Played || 0) + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Log the start event (optional analytics)
    await admin.firestore().collection('game_starts').add({
      userId: req.userId,
      gameType: gameType || 'general',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Game start recorded' });
  } catch (error) {
    console.error('Error recording game start:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Record game completion (does NOT increment Games_Played; that happens on /started)
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { gameType, score, xpEarned, achievements } = req.body;
    
    if (!gameType) {
      return res.status(400).json({ error: 'Game type is required' });
    }

    // Get current game data
    const gamesQuery = await admin.firestore()
      .collection('games')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    let gameDoc;
    if (gamesQuery.empty) {
      // Create new game document (Games_Played will be handled via /started)
      const newGameData = {
        userId: req.userId,
        Achievements: achievements || 0,
        Games_Played: 0,
        Total_XP: xpEarned || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGameRef = await admin.firestore()
        .collection('games')
        .add(newGameData);
      
      gameDoc = { id: newGameRef.id, data: () => newGameData };
    } else {
      gameDoc = gamesQuery.docs[0];
      const currentData = gameDoc.data();
      
      // Update XP and achievements only
      const updateData = {
        Total_XP: (currentData.Total_XP || 0) + (xpEarned || 0),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (achievements) {
        updateData.Achievements = (currentData.Achievements || 0) + achievements;
      }

      await gameDoc.ref.update(updateData);
    }

    // Log the game completion
    await admin.firestore()
      .collection('game_completions')
      .add({
        userId: req.userId,
        gameType,
        score: score || 0,
        xpEarned: xpEarned || 0,
        achievements: achievements || 0,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'Game completion recorded successfully',
      data: {
        gameType,
        score: score || 0,
        xpEarned: xpEarned || 0,
        achievements: achievements || 0
      }
    });
  } catch (error) {
    console.error('Error recording game completion:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Get game history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Firestore requires a composite index for a where + orderBy on different fields.
    // To avoid forcing immediate index creation while developing locally,
    // fetch the matching documents and sort them in-memory by timestamp.
    const completionsQuery = await admin.firestore()
      .collection('game_completions')
      .where('userId', '==', req.userId)
      .limit(parseInt(limit) + parseInt(offset))
      .get();

    const completions = [];
    completionsQuery.forEach(doc => {
      completions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by timestamp descending (robust to Timestamp or Date)
    completions.sort((a, b) => {
      const aTs = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const bTs = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return bTs - aTs;
    });

    // Apply offset & limit in-memory
    const start = parseInt(offset) || 0;
    const end = start + (parseInt(limit) || 50);
    const page = completions.slice(start, end);

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Get achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    // Fetch user's achievements and sort in-memory to avoid creating a composite index
    const achievementsQuery = await admin.firestore()
      .collection('achievements')
      .where('userId', '==', req.userId)
      .get();

    const achievements = [];
    achievementsQuery.forEach(doc => {
      achievements.push({
        id: doc.id,
        ...doc.data()
      });
    });

    achievements.sort((a, b) => {
      const aTs = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const bTs = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return bTs - aTs;
    });

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Add achievement
router.post('/achievements', authenticateToken, async (req, res) => {
  try {
    const { achievementType, description, xpReward } = req.body;
    
    if (!achievementType) {
      return res.status(400).json({ error: 'Achievement type is required' });
    }

    const achievementData = {
      userId: req.userId,
      achievementType,
      description: description || `${achievementType} achievement earned!`,
      xpReward: xpReward || 0,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const achievementRef = await admin.firestore()
      .collection('achievements')
      .add(achievementData);

    // Add XP reward to user's total if specified
    if (xpReward > 0) {
      const gamesQuery = await admin.firestore()
        .collection('games')
        .where('userId', '==', req.userId)
        .limit(1)
        .get();

      if (!gamesQuery.empty) {
        const gameDoc = gamesQuery.docs[0];
        const currentData = gameDoc.data();
        await gameDoc.ref.update({
          Total_XP: currentData.Total_XP + xpReward,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    res.json({
      success: true,
      message: 'Achievement added successfully',
      data: {
        id: achievementRef.id,
        ...achievementData
      }
    });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

module.exports = router;
