const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');
const { validateGoals } = require('../middleware/validation');

const router = express.Router();

// Get user goals data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      // Create default goals data if none exists
      const defaultGoalsData = {
        userId: req.userId,
        Current_Streak: 0,
        Best_Streak: 0,
        Goals_Completed: 0,
        Total_XP_Earned: 0,
        Last_Practice_Date: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGoalsRef = await admin.firestore()
        .collection('goals')
        .add(defaultGoalsData);

      return res.json({
        success: true,
        data: {
          id: newGoalsRef.id,
          ...defaultGoalsData
        }
      });
    }

    const goalsData = goalsQuery.docs[0];
    res.json({
      success: true,
      data: {
        id: goalsData.id,
        ...goalsData.data()
      }
    });
  } catch (error) {
    console.error('Error fetching goals data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user goals data
router.put('/', authenticateToken, validateGoals, async (req, res) => {
  try {
    const { currentStreak, goalsCompleted, totalXPEarned, bestStreak } = req.body;
    
    const updateData = {
      Current_Streak: currentStreak,
      Best_Streak: typeof bestStreak === 'number' ? bestStreak : admin.firestore.FieldValue.delete(),
      Goals_Completed: goalsCompleted,
      Total_XP_Earned: totalXPEarned,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if goals document exists
    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      // Create new goals document
      const newGoalsData = {
        userId: req.userId,
        ...updateData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGoalsRef = await admin.firestore()
        .collection('goals')
        .add(newGoalsData);

      return res.json({
        success: true,
        message: 'Goals data created successfully',
        data: {
          id: newGoalsRef.id,
          ...newGoalsData
        }
      });
    }

    // Update existing goals data
    const goalsDoc = goalsQuery.docs[0];
    await goalsDoc.ref.update(updateData);

    res.json({
      success: true,
      message: 'Goals data updated successfully',
      data: {
        id: goalsDoc.id,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating goals data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete a goal
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { goalType, xpReward, description } = req.body;
    
    if (!goalType) {
      return res.status(400).json({ error: 'Goal type is required' });
    }

    // Get current goals data
    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    let goalsDoc;
    if (goalsQuery.empty) {
      // Create new goals document
      const newGoalsData = {
        userId: req.userId,
        Current_Streak: 1,
        Best_Streak: 1,
        Goals_Completed: 1,
        Total_XP_Earned: xpReward || 0,
        Last_Practice_Date: new Date().toISOString().slice(0,10),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGoalsRef = await admin.firestore()
        .collection('goals')
        .add(newGoalsData);
      
      goalsDoc = { id: newGoalsRef.id, data: () => newGoalsData };
    } else {
      goalsDoc = goalsQuery.docs[0];
      const currentData = goalsDoc.data();
      
      // Update goals data
      const updateData = {
        Current_Streak: (currentData.Current_Streak || 0) + 1,
        Best_Streak: Math.max(currentData.Best_Streak || 0, (currentData.Current_Streak || 0) + 1),
        Goals_Completed: currentData.Goals_Completed + 1,
        Total_XP_Earned: currentData.Total_XP_Earned + (xpReward || 0),
        Last_Practice_Date: new Date().toISOString().slice(0,10),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await goalsDoc.ref.update(updateData);
    }

    // Log the goal completion
    await admin.firestore()
      .collection('goal_completions')
      .add({
        userId: req.userId,
        goalType,
        xpReward: xpReward || 0,
        description: description || `${goalType} goal completed!`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'Goal completed successfully',
      data: {
        goalType,
        xpReward: xpReward || 0,
        description: description || `${goalType} goal completed!`
      }
    });
  } catch (error) {
    console.error('Error completing goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset streak (when user misses a day)
router.post('/reset-streak', authenticateToken, async (req, res) => {
  try {
    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      return res.status(404).json({ error: 'Goals data not found' });
    }

    const goalsDoc = goalsQuery.docs[0];
    await goalsDoc.ref.update({
      Current_Streak: 0,
      Best_Streak: goalsDoc.data().Best_Streak || 0,
      Last_Practice_Date: new Date().toISOString().slice(0,10),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Streak reset successfully',
      data: {
        Current_Streak: 0
      }
    });
  } catch (error) {
    console.error('Error resetting streak:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Touch streak by day: increments if practiced today following a consecutive day, resets on gaps, no-ops if already counted today
router.post('/touch', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().slice(0,10); // YYYY-MM-DD

    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      const newGoals = {
        userId: req.userId,
        Current_Streak: 1,
        Best_Streak: 1,
        Goals_Completed: 0,
        Total_XP_Earned: 0,
        Last_Practice_Date: todayStr,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const ref = await admin.firestore().collection('goals').add(newGoals);
      return res.json({ success: true, data: { id: ref.id, ...newGoals } });
    }

    const docSnap = goalsQuery.docs[0];
    const data = docSnap.data();
    const last = data.Last_Practice_Date; // YYYY-MM-DD

    // Compute yesterday string
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toISOString().slice(0,10);

    let current = data.Current_Streak || 0;
    let best = data.Best_Streak || 0;

    if (last === todayStr) {
      // already counted today -> no-op
    } else if (last === yesterdayStr) {
      current = current + 1;
      best = Math.max(best, current);
    } else {
      // gap or first time
      current = 1;
      best = Math.max(best, current);
    }

    await docSnap.ref.update({
      Current_Streak: current,
      Best_Streak: best,
      Last_Practice_Date: todayStr,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ success: true, data: { Current_Streak: current, Best_Streak: best, Last_Practice_Date: todayStr } });
  } catch (error) {
    console.error('Error touching streak:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get goals assigned to the current (child) user
router.get('/assigned', authenticateToken, async (req, res) => {
  try {
    const snap = await admin.firestore()
      .collection('assigned_goals')
      .where('childId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching assigned goals for child:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update progress for an assigned goal (child marks progress)
router.put('/assigned/:goalId/progress', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress, status } = req.body;

    const docRef = admin.firestore().collection('assigned_goals').doc(goalId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Assigned goal not found' });
    const data = doc.data();
    // Only the child who owns it can update progress
    if (data.childId !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (typeof progress === 'number') updates.progress = progress;
    if (status) updates.status = status;

    // if completed, award XP to games.Total_XP
    if (status === 'completed' && typeof data.xpReward === 'number' && data.xpReward > 0) {
      const gamesQuery = await admin.firestore()
        .collection('games')
        .where('userId', '==', req.userId)
        .limit(1)
        .get();
      if (gamesQuery.empty) {
        await admin.firestore().collection('games').add({
          userId: req.userId,
          Achievements: 0,
          Games_Played: 0,
          Total_XP: data.xpReward,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const gameDoc = gamesQuery.docs[0];
        const current = gameDoc.data();
        await gameDoc.ref.update({
          Total_XP: (current.Total_XP || 0) + data.xpReward,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    await docRef.update(updates);
    return res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    console.error('Error updating assigned goal progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get goal completion history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    const completionsQuery = await admin.firestore()
      .collection('goal_completions')
      .where('userId', '==', req.userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const completions = [];
    completionsQuery.forEach(doc => {
      completions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: completions
    });
  } catch (error) {
    console.error('Error fetching goal history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new goal
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { goalType, description, targetValue, xpReward } = req.body;
    
    if (!goalType || !description) {
      return res.status(400).json({ error: 'Goal type and description are required' });
    }

    const goalData = {
      userId: req.userId,
      goalType,
      description,
      targetValue: targetValue || 1,
      xpReward: xpReward || 10,
      status: 'active',
      progress: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const goalRef = await admin.firestore()
      .collection('user_goals')
      .add(goalData);

    res.json({
      success: true,
      message: 'Goal created successfully',
      data: {
        id: goalRef.id,
        ...goalData
      }
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's active goals
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const goalsQuery = await admin.firestore()
      .collection('user_goals')
      .where('userId', '==', req.userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const goals = [];
    goalsQuery.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Error fetching active goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update goal progress
router.put('/:goalId/progress', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0) {
      return res.status(400).json({ error: 'Progress must be a non-negative number' });
    }

    const goalDoc = await admin.firestore()
      .collection('user_goals')
      .doc(goalId)
      .get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goalData = goalDoc.data();
    if (goalData.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      progress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if goal is completed
    if (progress >= goalData.targetValue) {
      updateData.status = 'completed';
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await goalDoc.ref.update(updateData);

    res.json({
      success: true,
      message: 'Goal progress updated successfully',
      data: {
        id: goalId,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
