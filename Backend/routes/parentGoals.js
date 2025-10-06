// routes/parentGoals.js
const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Middleware: only parents and therapists can manage parent goals
router.use(authenticateToken, checkRole(['parent', 'therapist']));

/**
 * Helper: robustly derive user id & role from request because different auth middlewares
 * might set different properties on req (req.userId, req.user.uid, req.user.id, etc).
 */
const getRequestUser = (req) => {
  const userId = req.userId || req.user?.uid || req.user?.id || req.uid || (req.user && req.user.uid);
  const userRole = req.userRole || req.user?.role || req.role || (req.user && req.user.role);
  return { userId, userRole };
};

/**
 * Helper to validate child ownership for parents.
 * Checks parent_children collection for a link parentId -> childEmail.
 */
const ensureParentChildRelation = async (parentUserId, childEmail) => {
  try {
    console.log(`Checking parent-child relation: ${parentUserId} -> ${childEmail}`);
    const parentChildDoc = await admin.firestore()
      .collection('parent_children')
      .where('parentId', '==', parentUserId)
      .where('childEmail', '==', childEmail)
      .limit(1)
      .get();
    
    const exists = !parentChildDoc.empty;
    console.log(`Parent-child relation exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error checking parent-child relation:', error);
    return false;
  }
};

/**
 * Helper to get child user ID by email from users collection.
 */
const getChildUserIdByEmail = async (childEmail) => {
  try {
    console.log(`Looking up child user by email: ${childEmail}`);
    const userDoc = await admin.firestore()
      .collection('users')
      .where('email', '==', childEmail)
      .limit(1)
      .get();
    
    if (!userDoc.empty) {
      const userId = userDoc.docs[0].id;
      console.log(`Found child user: ${userId}`);
      return userId;
    }
    console.log(`No child user found with email: ${childEmail}`);
    return null;
  } catch (error) {
    console.error('Error getting child user ID:', error);
    return null;
  }
};

/**
 * Utility to convert various timestamp representations to milliseconds for sorting.
 */
const tsToMillis = (v) => {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (v.toMillis) return v.toMillis();
  if (v.seconds) return v.seconds * 1000;
  if (v._seconds) return v._seconds * 1000;
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

/**
 * GET /api/parent/goals
 * Get all parent goals for the current parent (or therapist)
 */
router.get('/', async (req, res) => {
  try {
    const { userId: parentId, userRole } = getRequestUser(req);
    console.log(`Fetching parent goals. derived parentId=${parentId}, role=${userRole}`);
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    // Avoid using orderBy with where to prevent requiring composite indexes;
    // fetch and sort client-side.
    const snap = await admin.firestore()
      .collection('parent_goals')
      .where('parentId', '==', parentId)
      .get();

    console.log(`Found ${snap.size} parent goals (raw)`);

    const items = snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      };
    });

    // Sort by createdAt desc
    items.sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt));

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching parent goals:', error.stack || error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * POST /api/parent/goals
 * Create a parent goal and assign to a child (by email).
 *
 * Behavior:
 * - Look up child user by email.
 * - If caller is a parent and no parent_children link exists, auto-create the link.
 * - Create parent_goals doc and assigned_goals doc.
 * - Read back saved docs and return them (so createdAt/updatedAt are real Date values).
 */
router.post('/', async (req, res) => {
  try {
    const { userId: parentId, userRole } = getRequestUser(req);
    console.log('Creating parent goal with data:', req.body, 'by user:', parentId, 'role:', userRole);
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, target, xp_reward, children_email } = req.body;
    if (!title || !children_email) {
      return res.status(400).json({ error: 'Title and children_email are required' });
    }

    // Get child user ID from email
    const childUserId = await getChildUserIdByEmail(children_email);
    if (!childUserId) {
      return res.status(404).json({ error: 'Child user not found with provided email' });
    }

    // If parent role, ensure parent-child relation exists; if not, auto-link
    if (userRole === 'parent') {
      const isAuthorized = await ensureParentChildRelation(parentId, children_email);
      if (!isAuthorized) {
        console.log(`No existing parent_children link for parent=${parentId} childEmail=${children_email}. Creating link.`);
        try {
          await admin.firestore().collection('parent_children').add({
            parentId,
            childEmail: children_email,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log('Auto-created parent_children link.');
        } catch (linkErr) {
          console.error('Failed to auto-create parent_children link:', linkErr);
          return res.status(500).json({ error: 'Failed to link parent and child' });
        }
      }
    }

    // Build parent goal payload
    const parentGoalPayload = {
      parentId,
      title,
      description: description || '',
      target: parseInt(target) || 1,
      xp_reward: parseInt(xp_reward) || 10,
      children_email: children_email,
      childUserId: childUserId,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save parent goal
    const parentGoalRef = await admin.firestore().collection('parent_goals').add(parentGoalPayload);
    const savedParentGoalDoc = await parentGoalRef.get();
    const savedParentGoal = {
      id: savedParentGoalDoc.id,
      ...savedParentGoalDoc.data(),
      createdAt: savedParentGoalDoc.data().createdAt?.toDate?.() || savedParentGoalDoc.data().createdAt,
      updatedAt: savedParentGoalDoc.data().updatedAt?.toDate?.() || savedParentGoalDoc.data().updatedAt
    };

    // Create assigned goal for child
    const assignedGoalPayload = {
      childId: childUserId,
      parentGoalId: parentGoalRef.id,
      assignedBy: parentId,
      assignedByRole: userRole,
      title,
      description: description || '',
      targetValue: parseInt(target) || 1,
      xpReward: parseInt(xp_reward) || 10,
      status: 'active',
      progress: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const assignedGoalRef = await admin.firestore().collection('assigned_goals').add(assignedGoalPayload);
    const savedAssignedGoalDoc = await assignedGoalRef.get();
    const savedAssignedGoal = {
      id: savedAssignedGoalDoc.id,
      ...savedAssignedGoalDoc.data(),
      createdAt: savedAssignedGoalDoc.data().createdAt?.toDate?.() || savedAssignedGoalDoc.data().createdAt,
      updatedAt: savedAssignedGoalDoc.data().updatedAt?.toDate?.() || savedAssignedGoalDoc.data().updatedAt
    };

    // Return saved objects (with timestamps) so frontend shows server times
    return res.status(201).json({
      success: true,
      data: {
        parentGoal: savedParentGoal,
        assignedGoal: savedAssignedGoal
      }
    });
  } catch (error) {
    console.error('Error creating parent goal:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * PUT /api/parent/goals/:goalId
 * Update a parent goal and sync with child's assigned goal
 */
router.put('/:goalId', async (req, res) => {
  try {
    const { userId: parentId, userRole } = getRequestUser(req);
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalId } = req.params;
    const { title, description, target, xp_reward, status } = req.body;

    const parentGoalRef = admin.firestore().collection('parent_goals').doc(goalId);
    const parentGoalDoc = await parentGoalRef.get();
    
    if (!parentGoalDoc.exists) {
      return res.status(404).json({ error: 'Parent goal not found' });
    }

    const parentGoalData = parentGoalDoc.data();
    
    // Check authorization
    if (userRole === 'parent' && parentGoalData.parentId !== parentId) {
      return res.status(403).json({ error: 'Not authorized to modify this goal' });
    }

    // Update parent goal
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (target) updates.target = parseInt(target);
    if (xp_reward) updates.xp_reward = parseInt(xp_reward);
    if (status) updates.status = status;

    await parentGoalRef.update(updates);

    // Find and update corresponding assigned goal
    const assignedGoalsSnap = await admin.firestore()
      .collection('assigned_goals')
      .where('parentGoalId', '==', goalId)
      .limit(1)
      .get();

    if (!assignedGoalsSnap.empty) {
      const assignedGoalRef = assignedGoalsSnap.docs[0].ref;
      const assignedUpdates = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (title) assignedUpdates.title = title;
      if (description !== undefined) assignedUpdates.description = description;
      if (target) assignedUpdates.targetValue = parseInt(target);
      if (xp_reward) assignedUpdates.xpReward = parseInt(xp_reward);
      if (status) assignedUpdates.status = status;

      await assignedGoalRef.update(assignedUpdates);
    }

    return res.json({ success: true, message: 'Goal updated successfully' });
  } catch (error) {
    console.error('Error updating parent goal:', error.stack || error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * DELETE /api/parent/goals/:goalId
 * Delete a parent goal and corresponding assigned goals
 */
router.delete('/:goalId', async (req, res) => {
  try {
    const { userId: parentId, userRole } = getRequestUser(req);
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalId } = req.params;

    const parentGoalRef = admin.firestore().collection('parent_goals').doc(goalId);
    const parentGoalDoc = await parentGoalRef.get();
    
    if (!parentGoalDoc.exists) {
      return res.status(404).json({ error: 'Parent goal not found' });
    }

    const parentGoalData = parentGoalDoc.data();
    
    // Check authorization
    if (userRole === 'parent' && parentGoalData.parentId !== parentId) {
      return res.status(403).json({ error: 'Not authorized to delete this goal' });
    }

    // Delete parent goal
    await parentGoalRef.delete();

    // Find and delete corresponding assigned goals
    const assignedGoalsSnap = await admin.firestore()
      .collection('assigned_goals')
      .where('parentGoalId', '==', goalId)
      .get();

    const deletePromises = assignedGoalsSnap.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting parent goal:', error.stack || error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * GET /api/parent/goals/:goalId
 * Get a specific parent goal by ID (with authorization)
 */
router.get('/:goalId', async (req, res) => {
  try {
    const { userId: parentId, userRole } = getRequestUser(req);
    if (!parentId) return res.status(401).json({ error: 'Unauthorized' });

    const { goalId } = req.params;

    const parentGoalDoc = await admin.firestore()
      .collection('parent_goals')
      .doc(goalId)
      .get();

    if (!parentGoalDoc.exists) {
      return res.status(404).json({ error: 'Parent goal not found' });
    }

    const parentGoalData = parentGoalDoc.data();
    
    // Check authorization
    if (userRole === 'parent' && parentGoalData.parentId !== parentId) {
      return res.status(403).json({ error: 'Not authorized to view this goal' });
    }

    const goalData = {
      id: parentGoalDoc.id,
      ...parentGoalData,
      createdAt: parentGoalData.createdAt?.toDate?.() || parentGoalData.createdAt,
      updatedAt: parentGoalData.updatedAt?.toDate?.() || parentGoalData.updatedAt
    };

    return res.json({ success: true, data: goalData });
  } catch (error) {
    console.error('Error fetching parent goal:', error.stack || error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

module.exports = router;
