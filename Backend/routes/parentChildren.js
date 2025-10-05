const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// All routes here require parent or therapist role
router.use(authenticateToken, checkRole(['parent', 'therapist']));

// Link a child to the parent by childId (uid)
router.post('/link', async (req, res) => {
  try {
    const { childId } = req.body;
    if (!childId) return res.status(400).json({ error: 'childId is required' });

    // Validate child user exists and is role 'child'
    const childDoc = await admin.firestore().collection('users').doc(childId).get();
    if (!childDoc.exists) return res.status(404).json({ error: 'Child user not found' });
    const childData = childDoc.data();
    if (childData.role !== 'child') return res.status(400).json({ error: 'Provided user is not a child account' });

    // Check if link already exists
    const existing = await admin.firestore()
      .collection('parent_children')
      .where('parentId', '==', req.userId)
      .where('childId', '==', childId)
      .limit(1)
      .get();
    if (!existing.empty) return res.json({ success: true, message: 'Already linked' });

    const linkData = {
      parentId: req.userId,
      childId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await admin.firestore().collection('parent_children').add(linkData);

    return res.status(201).json({ success: true, message: 'Child linked successfully' });
  } catch (error) {
    console.error('Error linking child:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Link by child's email (preferred; no password needed)
router.post('/link-email', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ error: 'email is required' });

    // Lookup child by email - prefer Firestore (users collection), fallback to Auth
    let childUid = null;
    try {
      const userQuery = await admin.firestore()
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();
      if (!userQuery.empty) {
        childUid = userQuery.docs[0].id;
      }
    } catch (e) {
      console.error('Firestore email lookup error:', e);
    }

    if (!childUid) {
      // Fallback to Firebase Auth if Firestore query returned nothing
      try {
        const userRecord = await admin.auth().getUserByEmail(normalizedEmail);
        childUid = userRecord?.uid || null;
      } catch (e) {
        if (e && e.code === 'auth/user-not-found') {
          return res.status(404).json({ error: 'No user found with this email' });
        }
        console.error('Firebase getUserByEmail error:', e);
        return res.status(500).json({ error: 'Failed to lookup user by email' });
      }
    }

    if (!childUid) return res.status(404).json({ error: 'Child user not found' });

    // Verify the user is a child in Firestore
    const childDoc = await admin.firestore().collection('users').doc(childUid).get();
    if (!childDoc.exists) return res.status(404).json({ error: 'Child profile not found' });
    const childData = childDoc.data();
    if (childData.role !== 'child') return res.status(400).json({ error: 'Provided user is not a child account' });

    // Check if link already exists
    const existing = await admin.firestore()
      .collection('parent_children')
      .where('parentId', '==', req.userId)
      .where('childId', '==', childUid)
      .limit(1)
      .get();
    if (!existing.empty) return res.json({ success: true, message: 'Already linked', data: { childId: childUid } });

    await admin.firestore().collection('parent_children').add({
      parentId: req.userId,
      childId: childUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({ success: true, message: 'Child linked successfully', data: { childId: childUid } });
  } catch (error) {
    console.error('Error linking child by email:', error);
    const message = error?.message || 'Internal server error';
    res.status(500).json({ error: message });
  }
});

// List children linked to current parent
router.get('/', async (req, res) => {
  try {
    const links = await admin.firestore()
      .collection('parent_children')
      .where('parentId', '==', req.userId)
      .get();

    const childIds = links.docs.map(d => d.data().childId);
    if (childIds.length === 0) return res.json({ success: true, data: [] });

    // Fetch user docs for children
    const batch = await Promise.all(childIds.map(id => admin.firestore().collection('users').doc(id).get()));
    const children = batch.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, data: children });
  } catch (error) {
    console.error('Error listing children:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get summary for a specific child (progress + games)
router.get('/:childId/summary', async (req, res) => {
  try {
    const { childId } = req.params;

    // Ensure linked (therapist can view any)
    if (req.userRole === 'parent') {
      const link = await admin.firestore()
        .collection('parent_children')
        .where('parentId', '==', req.userId)
        .where('childId', '==', childId)
        .limit(1)
        .get();
      if (link.empty) return res.status(403).json({ error: 'Not linked to this child' });
    }

    const [progressSnap, gamesSnap] = await Promise.all([
      admin.firestore().collection('Progress').where('userId', '==', childId).limit(1).get(),
      admin.firestore().collection('games').where('userId', '==', childId).limit(1).get(),
    ]);

    const progress = progressSnap.empty ? null : { id: progressSnap.docs[0].id, ...progressSnap.docs[0].data() };
    const games = gamesSnap.empty ? null : { id: gamesSnap.docs[0].id, ...gamesSnap.docs[0].data() };

    return res.json({ success: true, data: { progress, games } });
  } catch (error) {
    console.error('Error fetching child summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


