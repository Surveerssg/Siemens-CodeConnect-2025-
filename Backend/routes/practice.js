const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Helper to convert Firestore timestamp-like values to JS Date (or null)
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
 * POST /api/practice/assign
 * Therapist assigns a word or sentence to a child
 */
router.post('/assign', authenticateToken, checkRole(['therapist']), async (req, res) => {
  try {
    const { childId, type, text } = req.body;
    if (!childId || !type || !text) return res.status(400).json({ error: 'childId, type and text are required' });

    // Verify child exists and is a child account
    const childDoc = await admin.firestore().collection('users').doc(childId).get();
    if (!childDoc.exists) return res.status(404).json({ error: 'Child not found' });
    const childData = childDoc.data();
    if (childData.role !== 'child') return res.status(400).json({ error: 'Provided user is not a child account' });

    const payload = {
      childId,
      assignedBy: req.userId,
      type: type === 'sentence' ? 'sentence' : 'word',
      text: text,
      status: 'active',
      latestScore: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await admin.firestore().collection('practice_assignments').add(payload);
    const saved = await ref.get();

    return res.status(201).json({ success: true, data: { id: ref.id, ...saved.data(), createdAt: toJsDate(saved.data().createdAt) } });
  } catch (error) {
    console.error('Error assigning practice item:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/practice/child/:childId
 * Therapist: list assignments for a specific child
 */
router.get('/child/:childId', authenticateToken, checkRole(['therapist']), async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify therapist is linked to the child (optional) -- simple safety: allow if therapist-children link exists
      const link = await admin.firestore().collection('therapist_children')
        .where('therapistId', '==', req.userId)
        .where('childId', '==', childId)
        .limit(1)
        .get();
      if (link.empty) {
        // If therapist is not linked, allow if this therapist created at least one assignment for this child
        const createdByMe = await admin.firestore().collection('practice_assignments')
          .where('childId', '==', childId)
          .where('assignedBy', '==', req.userId)
          .limit(1)
          .get();
        if (createdByMe.empty) return res.status(403).json({ error: 'Not linked to this child' });
      }

    const snap = await admin.firestore().collection('practice_assignments')
      .where('childId', '==', childId)
      .get();

    const items = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toJsDate(d.data().createdAt) }));
    items.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error listing practice assignments for child:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/practice/assigned
 * Child: list own assigned practice items
 */
router.get('/assigned', authenticateToken, async (req, res) => {
  try {
    const childId = req.userId;
    const snap = await admin.firestore().collection('practice_assignments')
      .where('childId', '==', childId)
      .get();
    if (snap.empty) return res.json({ success: true, data: [] });
    const items = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toJsDate(d.data().createdAt) }));
    // sort descending by createdAt if present
    items.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error listing my practice assignments:', error && error.stack ? error.stack : error);
    // Include message for easier debugging in development
    res.status(500).json({ error: 'Internal server error', detail: error && error.message ? error.message : '' });
  }
});

/**
 * POST /api/practice/:id/attempt
 * Record an attempt for an assignment (child submits score/predicted text)
 */
router.post('/:id/attempt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { score, predicted_text = '' } = req.body;

    const assignRef = admin.firestore().collection('practice_assignments').doc(id);
    const assignDoc = await assignRef.get();
    if (!assignDoc.exists) return res.status(404).json({ error: 'Assignment not found' });
    const assign = assignDoc.data();

    // Only the child assigned or their therapist (for logging) may submit attempts.
    const callerId = req.userId;
    if (assign.childId !== callerId && req.userRole !== 'therapist') {
      return res.status(403).json({ error: 'Not authorized to submit attempt for this assignment' });
    }

    const attemptPayload = {
      assignmentId: id,
      childId: assign.childId,
      submittedBy: callerId,
      score: typeof score === 'number' ? score : null,
      predicted_text: predicted_text || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const attemptRef = await admin.firestore().collection('practice_attempts').add(attemptPayload);
  console.log('Practice attempt saved:', attemptRef.id, { assignmentId: id, childId: assign.childId, submittedBy: callerId, score: attemptPayload.score });

    // Update assignment summary fields
    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (assign.type === 'word') {
      // mark completed when child has practiced once
      if (assign.childId === callerId) updates.status = 'completed';
    } else if (assign.type === 'sentence') {
      if (typeof score === 'number') updates.latestScore = score;
      updates.status = 'attempted';
    }

    await assignRef.update(updates);

    const updatedAssign = await assignRef.get();
    return res.json({ success: true, data: { attemptId: attemptRef.id, assignment: { id: updatedAssign.id, ...updatedAssign.data() } } });
  } catch (error) {
    console.error('Error recording practice attempt:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/practice/:id/complete
 * Child: mark a word assignment completed (no attempt document created)
 */
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const assignRef = admin.firestore().collection('practice_assignments').doc(id);
    const assignDoc = await assignRef.get();
    if (!assignDoc.exists) return res.status(404).json({ error: 'Assignment not found' });
    const assign = assignDoc.data();

    const callerId = req.userId;
    if (assign.childId !== callerId) return res.status(403).json({ error: 'Not authorized' });

    // Only mark completed for words; for sentences this endpoint will still set status if called
    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp(), status: 'completed' };
    await assignRef.update(updates);

    const updated = await assignRef.get();
    return res.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Error marking assignment complete:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/practice/:id/attempts
 * Therapist: fetch attempt history for an assignment
 */
router.get('/:id/attempts', authenticateToken, checkRole(['therapist']), async (req, res) => {
  try {
    const { id } = req.params;
    const assignRef = admin.firestore().collection('practice_assignments').doc(id);
    const assignDoc = await assignRef.get();
    if (!assignDoc.exists) return res.status(404).json({ error: 'Assignment not found' });
    const assign = assignDoc.data();

    // Verify therapist is linked to this child OR is the creator of the assignment
    const link = await admin.firestore().collection('therapist_children')
      .where('therapistId', '==', req.userId)
      .where('childId', '==', assign.childId)
      .limit(1)
      .get();
    if (link.empty && assign.assignedBy !== req.userId) return res.status(403).json({ error: 'Not linked to this child' });

    const snap = await admin.firestore().collection('practice_attempts')
      .where('assignmentId', '==', id)
      .get();

    const attempts = snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: toJsDate(d.data().timestamp) }));
    attempts.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });
    return res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('Error fetching attempts for assignment:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

