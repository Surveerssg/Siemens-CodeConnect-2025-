const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Middleware: only parents and therapists can manage assigned goals
router.use(authenticateToken, checkRole(['parent', 'therapist']));

// Helper to validate child ownership for parents (therapists can assign to any)
const ensureParentChildRelation = async (parentUserId, childUserId) => {
  // Optional: implement parent-child relation check here when you add linkage
  // For now, allow all for demo; in production, verify a relation exists
  return true;
};

// Create/assign a goal to a child
router.post('/', async (req, res) => {
  try {
    const { childId, title, description, targetValue, xpReward, dueDate } = req.body;

    if (!childId || !title) {
      return res.status(400).json({ error: 'childId and title are required' });
    }

    if (req.userRole === 'parent') {
      const ok = await ensureParentChildRelation(req.userId, childId);
      if (!ok) return res.status(403).json({ error: 'Not authorized for this child' });
    }

    const goal = {
      childId,
      assignedBy: req.userId,
      assignedByRole: req.userRole,
      title,
      description: description || '',
      targetValue: typeof targetValue === 'number' ? targetValue : 1,
      xpReward: typeof xpReward === 'number' ? xpReward : 10,
      dueDate: dueDate || null,
      status: 'active',
      progress: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await admin.firestore().collection('assigned_goals').add(goal);
    return res.status(201).json({ success: true, data: { id: ref.id, ...goal } });
  } catch (error) {
    console.error('Error assigning goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an assigned goal (title/description/target/xp/dueDate/status)
router.put('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const updates = {};
    const allowed = ['title', 'description', 'targetValue', 'xpReward', 'dueDate', 'status'];
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const docRef = admin.firestore().collection('assigned_goals').doc(goalId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Assigned goal not found' });

    const data = doc.data();
    if (req.userRole === 'parent' && data.assignedBy !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to modify this goal' });
    }

    await docRef.update(updates);
    return res.json({ success: true, message: 'Assigned goal updated' });
  } catch (error) {
    console.error('Error updating assigned goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List assigned goals for a child
router.get('/child/:childId', async (req, res) => {
  try {
    const { childId } = req.params;

    if (req.userRole === 'parent') {
      const ok = await ensureParentChildRelation(req.userId, childId);
      if (!ok) return res.status(403).json({ error: 'Not authorized for this child' });
    }

    const snap = await admin.firestore()
      .collection('assigned_goals')
      .where('childId', '==', childId)
      .orderBy('createdAt', 'desc')
      .get();

    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error listing child assigned goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parent/therapist can delete an assigned goal they created
router.delete('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const docRef = admin.firestore().collection('assigned_goals').doc(goalId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Assigned goal not found' });
    const data = doc.data();
    if (req.userRole === 'parent' && data.assignedBy !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this goal' });
    }
    await docRef.delete();
    return res.json({ success: true, message: 'Assigned goal deleted' });
  } catch (error) {
    console.error('Error deleting assigned goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


