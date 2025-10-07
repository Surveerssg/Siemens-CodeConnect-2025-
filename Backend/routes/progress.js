const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');
const { validateProgress } = require('../middleware/validation');

const router = express.Router();

// Get user progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const progressDoc = await admin.firestore()
      .collection('Progress')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (progressDoc.empty) {
      // Create default progress if none exists
      const defaultProgress = {
        userId: req.userId,
        Average_Score: 0,
        Best_Score: 0,
        Best_Streak: 0,
        Practice_Days: 0,
        Words_This_Week: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newProgressRef = await admin.firestore()
        .collection('Progress')
        .add(defaultProgress);

      return res.json({
        success: true,
        data: {
          id: newProgressRef.id,
          ...defaultProgress
        }
      });
    }

    const progressData = progressDoc.docs[0];
    res.json({
      success: true,
      data: {
        id: progressData.id,
        ...progressData.data()
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user progress
router.put('/', authenticateToken, validateProgress, async (req, res) => {
  try {
    const { averageScore, bestScore, bestStreak, practiceDays, wordsThisWeek } = req.body;
    
    const updateData = {
      Average_Score: averageScore,
      Best_Score: bestScore,
      Best_Streak: bestStreak,
      Practice_Days: practiceDays,
      Words_This_Week: wordsThisWeek,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if progress document exists
    const progressQuery = await admin.firestore()
      .collection('Progress')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (progressQuery.empty) {
      // Create new progress document
      const newProgress = {
        userId: req.userId,
        ...updateData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newProgressRef = await admin.firestore()
        .collection('Progress')
        .add(newProgress);

      return res.json({
        success: true,
        message: 'Progress created successfully',
        data: {
          id: newProgressRef.id,
          ...newProgress
        }
      });
    }

    // Update existing progress
    const progressDoc = progressQuery.docs[0];
    await progressDoc.ref.update(updateData);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        id: progressDoc.id,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add practice session
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const { score, wordsPracticed, gameType, currentStreak } = req.body;
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    if (typeof currentStreak === 'number' && currentStreak < 0) {
      return res.status(400).json({ error: 'Current streak must be a non-negative number' });
    }

    // Get current progress
    const progressQuery = await admin.firestore()
      .collection('Progress')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    let progressDoc;
    if (progressQuery.empty) {
      // Create new progress document
      const newProgress = {
        userId: req.userId,
        Average_Score: score,
        Best_Score: score,
        Best_Streak: currentStreak || 0,
        Practice_Days: 1,
        Words_This_Week: wordsPracticed || 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newProgressRef = await admin.firestore()
        .collection('Progress')
        .add(newProgress);
      
      progressDoc = { id: newProgressRef.id, data: () => newProgress };
    } else {
      progressDoc = progressQuery.docs[0];
      const currentData = progressDoc.data();
      
      // Update progress with new session data
      const newAverageScore = ((currentData.Average_Score * currentData.Practice_Days) + score) / (currentData.Practice_Days + 1);
      const newBestScore = Math.max(currentData.Best_Score, score);
      const newWordsThisWeek = currentData.Words_This_Week + (wordsPracticed || 1);
      
      await progressDoc.ref.update({
        Average_Score: Math.round(newAverageScore * 100) / 100,
        Best_Score: newBestScore,
        Practice_Days: currentData.Practice_Days + 1,
        Words_This_Week: newWordsThisWeek,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Log the session
    await admin.firestore()
      .collection('practice_sessions')
      .add({
        userId: req.userId,
        score,
        wordsPracticed: wordsPracticed || 1,
        gameType: gameType || 'general',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'Practice session recorded successfully',
      data: {
        score,
        wordsPracticed: wordsPracticed || 1,
        gameType: gameType || 'general'
      }
    });
  } catch (error) {
    console.error('Error recording practice session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get progress history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    const sessionsQuery = await admin.firestore()
      .collection('practice_sessions')
      .where('userId', '==', req.userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const sessions = [];
    sessionsQuery.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching progress history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get progress for specific user (for parents/therapists)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progressQuery = await admin.firestore()
      .collection('Progress')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (progressQuery.empty) {
      return res.status(404).json({ error: 'Progress not found for this user' });
    }

    const progressData = progressQuery.docs[0];
    res.json({
      success: true,
      data: {
        id: progressData.id,
        ...progressData.data()
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
