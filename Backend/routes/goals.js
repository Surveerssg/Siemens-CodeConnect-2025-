// routes/goals.js
const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');
const { validateGoals } = require('../middleware/validation');

const router = express.Router();

/**
 * Robust user derivation (works with different auth middlewares)
 */
const getRequestUser = (req) => {
  const userId = req.userId || req.user?.uid || req.user?.id || req.uid || (req.user && req.user.uid);
  const userRole = req.userRole || req.user?.role || req.role || (req.user && req.user.role);
  return { userId, userRole };
};

/**
 * Convert various Firestore timestamp-like values to JS Date (or null)
 */
const toJsDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number' || typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v.toDate === 'function') return v.toDate();
  if (v.seconds) return new Date(v.seconds * 1000);
  if (v._seconds) return new Date(v._seconds * 1000);
  return null;
};

/**
 * Convert a Firestore document snapshot to plain object with id and JS Date fields
 */
const convertDoc = (docSnap) => {
  if (!docSnap) return null;
  const data = docSnap.data ? docSnap.data() : docSnap;
  const result = {
    id: docSnap.id || data.id || null,
    ...(data || {})
  };

  // convert common timestamp fields
  if (result.createdAt) result.createdAt = toJsDate(result.createdAt);
  if (result.updatedAt) result.updatedAt = toJsDate(result.updatedAt);
  if (result.completedAt) result.completedAt = toJsDate(result.completedAt);
  if (result.timestamp) result.timestamp = toJsDate(result.timestamp);
  if (result.dueDate) result.dueDate = toJsDate(result.dueDate);
  return result;
};

/**
 * GET /api/goals
 * Get user goals data (creates default doc if not exists)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      // Create default goals data if none exists
      const defaultGoalsData = {
        userId,
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

      // Read back to get resolved timestamps
      const saved = await newGoalsRef.get();
      return res.json({
        success: true,
        data: convertDoc(saved)
      });
    }

    const goalsDoc = goalsQuery.docs[0];
    return res.json({
      success: true,
      data: convertDoc(goalsDoc)
    });
  } catch (error) {
    console.error('Error fetching goals data:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * PUT /api/goals
 * Update user goals data (create if missing)
 */
router.put('/', authenticateToken, validateGoals, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { currentStreak, goalsCompleted, totalXPEarned, bestStreak } = req.body;
    
    // Build update data object
    const updateData = {
      Current_Streak: currentStreak,
      Goals_Completed: goalsCompleted,
      Total_XP_Earned: totalXPEarned,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (typeof bestStreak === 'number') {
      updateData.Best_Streak = bestStreak;
    }

    // Check if goals document exists
    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      // Create new goals document
      const newGoalsData = {
        userId,
        ...updateData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newGoalsRef = await admin.firestore()
        .collection('goals')
        .add(newGoalsData);

      const saved = await newGoalsRef.get();
      return res.json({
        success: true,
        message: 'Goals data created successfully',
        data: convertDoc(saved)
      });
    }

    // Update existing goals data
    const goalsDoc = goalsQuery.docs[0];
    await goalsDoc.ref.update(updateData);

    // Read back updated doc
    const updatedDoc = await goalsDoc.ref.get();
    return res.json({
      success: true,
      message: 'Goals data updated successfully',
      data: convertDoc(updatedDoc)
    });
  } catch (error) {
    console.error('Error updating goals data:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * POST /api/goals/complete
 * Complete a goal (log completion and update user goals)
 */
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalType, xpReward = 0, description = `${goalType} goal completed!` } = req.body;
    if (!goalType) {
      return res.status(400).json({ error: 'Goal type is required' });
    }

    // Get current goals data
    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    let goalsDocRef;
    if (goalsQuery.empty) {
      // Create new goals document
      const newGoalsData = {
        userId,
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

      goalsDocRef = newGoalsRef;
    } else {
      const goalsDoc = goalsQuery.docs[0];
      goalsDocRef = goalsDoc.ref;
      const currentData = goalsDoc.data();
      
      // Update goals data
      const updatedData = {
        Current_Streak: (currentData.Current_Streak || 0) + 1,
        Best_Streak: Math.max(currentData.Best_Streak || 0, (currentData.Current_Streak || 0) + 1),
        Goals_Completed: (currentData.Goals_Completed || 0) + 1,
        Total_XP_Earned: (currentData.Total_XP_Earned || 0) + (xpReward || 0),
        Last_Practice_Date: new Date().toISOString().slice(0,10),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await goalsDoc.ref.update(updatedData);
    }

    // Log the goal completion
    const completionRef = await admin.firestore()
      .collection('goal_completions')
      .add({
        userId,
        goalType,
        xpReward: xpReward || 0,
        description,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    // Return created completion and updated goals doc
    const completionSaved = await completionRef.get();
    const updatedGoalsSaved = await goalsDocRef.get();

    return res.json({
      success: true,
      message: 'Goal completed successfully',
      data: {
        completion: convertDoc(completionSaved),
        goals: convertDoc(updatedGoalsSaved)
      }
    });
  } catch (error) {
    console.error('Error completing goal:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * POST /api/goals/reset-streak
 */
router.post('/reset-streak', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', userId)
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

    const updatedDoc = await goalsDoc.ref.get();
    res.json({
      success: true,
      message: 'Streak reset successfully',
      data: convertDoc(updatedDoc)
    });
  } catch (error) {
    console.error('Error resetting streak:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * POST /api/goals/touch
 * Touch streak by day: increments if practiced today following previous day,
 * resets on gaps, no-ops if already counted today
 */
router.post('/touch', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date();
    const todayStr = today.toISOString().slice(0,10); // YYYY-MM-DD

    const goalsQuery = await admin.firestore()
      .collection('goals')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (goalsQuery.empty) {
      const newGoals = {
        userId,
        Current_Streak: 1,
        Best_Streak: 1,
        Goals_Completed: 0,
        Total_XP_Earned: 0,
        Last_Practice_Date: todayStr,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const ref = await admin.firestore().collection('goals').add(newGoals);
      const saved = await ref.get();
      return res.json({ success: true, data: convertDoc(saved) });
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

    const updated = await docSnap.ref.get();
    return res.json({ success: true, data: convertDoc(updated) });
  } catch (error) {
    console.error('Error touching streak:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * GET /api/goals/assigned
 * Return assigned goals for the authenticated child.
 * Tries both 'childId' and 'childUserId' for compatibility.
 */
router.get('/assigned', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    console.log(`[GET /api/goals/assigned] userId=${userId}`);

    // Query assigned_goals by childId
    const byChildIdSnap = await admin.firestore()
      .collection('assigned_goals')
      .where('childId', '==', userId)
      .get();

    let docs = [...byChildIdSnap.docs];

    // If nothing found by childId, try childUserId (compatibility)
    if (docs.length === 0) {
      const byChildUserIdSnap = await admin.firestore()
        .collection('assigned_goals')
        .where('childUserId', '==', userId)
        .get();
      docs = [...byChildUserIdSnap.docs];
    }

    if (!docs || docs.length === 0) {
      // No assigned goals — not an error
      return res.json({ success: true, data: [] });
    }

    const items = docs.map(d => convertDoc(d));

    // Sort by createdAt desc if present
    items.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching assigned goals for child:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * PUT /api/goals/assigned/:goalId/progress
 * Update progress/status for an assigned goal (child)
 */
router.put('/assigned/:goalId/progress', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalId } = req.params;
    const { progress, status } = req.body;

    const assignedRef = admin.firestore().collection('assigned_goals').doc(goalId);
    const assignedDoc = await assignedRef.get();
    if (!assignedDoc.exists) return res.status(404).json({ error: 'Assigned goal not found' });

    const assignedData = assignedDoc.data();
    const ownerId = assignedData.childId || assignedData.childUserId;
    if (ownerId !== userId) return res.status(403).json({ error: 'Not authorized to modify this assigned goal' });

    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (typeof progress !== 'undefined') updates.progress = Number(progress) || 0;
    if (typeof status !== 'undefined') updates.status = status;

    await assignedRef.update(updates);

    // If completed and xpReward exists, update games.Total_XP for the child
    if (status === 'completed' && typeof assignedData.xpReward === 'number' && assignedData.xpReward > 0) {
      const gamesQuery = await admin.firestore()
        .collection('games')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (gamesQuery.empty) {
        // create games doc with initial XP
        const gRef = await admin.firestore().collection('games').add({
          userId,
          Achievements: 0,
          Games_Played: 0,
          Total_XP: assignedData.xpReward,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // read back not strictly necessary, but left out to keep code simple
      } else {
        const gDoc = gamesQuery.docs[0];
        await gDoc.ref.update({
          Total_XP: (gDoc.data().Total_XP || 0) + assignedData.xpReward,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    const updatedAssigned = await assignedRef.get();
    return res.json({ success: true, data: convertDoc(updatedAssigned) });
  } catch (error) {
    console.error('Error updating assigned goal progress:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * GET /api/goals/history
 * Get goal completion history for the user
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { limit = 30, offset = 0 } = req.query;

    const completionsQuery = await admin.firestore()
      .collection('goal_completions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const completions = completionsQuery.docs.map(doc => convertDoc(doc));

    return res.json({ success: true, data: completions });
  } catch (error) {
    console.error('Error fetching goal history:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * POST /api/goals/create
 * Create a new user goal (non-parent-assigned)
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalType, description, targetValue = 1, xpReward = 10 } = req.body;
    if (!goalType || !description) {
      return res.status(400).json({ error: 'Goal type and description are required' });
    }

    const goalData = {
      userId,
      goalType,
      description,
      targetValue,
      xpReward,
      status: 'active',
      progress: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const goalRef = await admin.firestore()
      .collection('user_goals')
      .add(goalData);

    const saved = await goalRef.get();
    return res.json({
      success: true,
      message: 'Goal created successfully',
      data: convertDoc(saved)
    });
  } catch (error) {
    console.error('Error creating goal:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * GET /api/goals/active
 * Get user's active user_goals
 */
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const goalsQuery = await admin.firestore()
      .collection('user_goals')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const goals = goalsQuery.docs.map(doc => convertDoc(doc));
    return res.json({ success: true, data: goals });
  } catch (error) {
    console.error('Error fetching active goals:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * PUT /api/goals/:goalId/progress
 * Update a user's own goal progress
 */
router.put('/:goalId/progress', authenticateToken, async (req, res) => {
  try {
    const { userId } = getRequestUser(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalId } = req.params;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0) {
      return res.status(400).json({ error: 'Progress must be a non-negative number' });
    }

    const goalDocRef = admin.firestore()
      .collection('user_goals')
      .doc(goalId);

    const goalDoc = await goalDocRef.get();
    if (!goalDoc.exists) return res.status(404).json({ error: 'Goal not found' });

    const goalData = goalDoc.data();
    if (goalData.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    const updateData = {
      progress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if goal is completed
    if (progress >= (goalData.targetValue || 1)) {
      updateData.status = 'completed';
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await goalDocRef.update(updateData);

    const updated = await goalDocRef.get();
    return res.json({
      success: true,
      message: 'Goal progress updated successfully',
      data: convertDoc(updated)
    });
  } catch (error) {
    console.error('Error updating goal progress:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

module.exports = router;
