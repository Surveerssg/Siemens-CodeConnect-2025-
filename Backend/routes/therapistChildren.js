const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Middleware – only therapists can manage their linked children
router.use(authenticateToken, checkRole(['therapist']));

/**
 * Link a child by email to a therapist
 */
router.post('/link-email', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ error: 'email is required' });

    // Lookup child by email - prefer Firestore
    let childUid = null;
    try {
      const userQuery = await admin.firestore()
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();
      if (!userQuery.empty) childUid = userQuery.docs[0].id;
    } catch (e) {
      console.error('Firestore email lookup error:', e);
    }

    if (!childUid) {
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
      .collection('therapist_children')
      .where('therapistId', '==', req.userId)
      .where('childId', '==', childUid)
      .limit(1)
      .get();

    if (!existing.empty)
      return res.json({ success: true, message: 'Already linked', data: { childId: childUid } });

    const linkDoc = {
      therapistId: req.userId,
      childId: childUid,
      childEmail: normalizedEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await admin.firestore().collection('therapist_children').add(linkDoc);

    return res.status(201).json({
      success: true,
      message: 'Child linked successfully',
      data: { id: ref.id, childId: childUid }
    });
  } catch (error) {
    console.error('Error linking child by email:', error);
    const message = error?.message || 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * List children linked to current therapist
 */
router.get('/', async (req, res) => {
  try {
    const linksSnap = await admin.firestore()
      .collection('therapist_children')
      .where('therapistId', '==', req.userId)
      .get();

    if (linksSnap.empty) return res.json({ success: true, data: [] });

    const links = linksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const resolved = await Promise.all(links.map(async link => {
      try {
        const childId = link.childId || null;
        const childEmail = link.childEmail || null;

        if (childId) {
          const userDoc = await admin.firestore().collection('users').doc(childId).get();
          if (userDoc.exists) {
            return {
              linkId: link.id,
              childId,
              childEmail: userDoc.data().email || childEmail,
              user: { id: userDoc.id, ...userDoc.data() }
            };
          }
        }

        if (childEmail) {
          const q = await admin.firestore()
            .collection('users')
            .where('email', '==', childEmail.toLowerCase())
            .limit(1)
            .get();
          if (!q.empty) {
            const u = q.docs[0];
            return { linkId: link.id, childId: u.id, childEmail, user: { id: u.id, ...u.data() } };
          }

          try {
            const userRecord = await admin.auth().getUserByEmail(childEmail);
            const uid = userRecord.uid;
            const uDoc = await admin.firestore().collection('users').doc(uid).get();
            if (uDoc.exists)
              return { linkId: link.id, childId: uid, childEmail, user: { id: uDoc.id, ...uDoc.data() } };
            return { linkId: link.id, childId: uid, childEmail, user: { id: uid, email: childEmail } };
          } catch (authErr) {
            console.warn(`therapist_children: could not resolve link ${link.id} by email ${childEmail}:`, authErr?.message || authErr);
          }
        }

        return null;
      } catch (err) {
        console.error('Error resolving link:', err);
        return null;
      }
    }));

    const children = resolved
      .filter(r => r && r.user)
      .map(r => ({ ...r.user }));

    return res.json({ success: true, data: children });
  } catch (error) {
    console.error('Error listing children:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * Get summary for a specific child (progress + games)
 */
router.get('/:childId/summary', async (req, res) => {
  try {
    const { childId } = req.params;

    if (req.userRole === 'therapist') {
      const link = await admin.firestore()
        .collection('therapist_children')
        .where('therapistId', '==', req.userId)
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
    console.error('Error fetching child summary:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

/**
 * Get parent email for a specific child
 */
router.get('/:childId/parent', async (req, res) => {
  try {
    const { childId } = req.params;

    // Ensure therapist is linked
    const linkSnap = await admin.firestore()
      .collection('therapist_children')
      .where('therapistId', '==', req.userId)
      .where('childId', '==', childId)
      .limit(1)
      .get();

    if (linkSnap.empty) return res.status(403).json({ error: 'Not linked to this child' });

    const childDoc = await admin.firestore().collection('users').doc(childId).get();
    if (!childDoc.exists) return res.status(404).json({ error: 'Child not found' });

    const childData = childDoc.data();
    if (!childData.parentEmail) return res.status(404).json({ error: 'Parent email not found' });

    return res.json({ success: true, data: { parentEmail: childData.parentEmail } });
  } catch (error) {
    console.error('Error fetching parent email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:childId/notes', async (req, res) => {
  try {
    const { childId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Verify therapist is linked to the child
    const linkSnap = await admin.firestore()
      .collection('therapist_children')
      .where('therapistId', '==', req.userId)
      .where('childId', '==', childId)
      .limit(1)
      .get();

    if (linkSnap.empty) return res.status(403).json({ error: 'You are not linked to this child' });

    // Get child document
    const childDoc = await admin.firestore().collection('users').doc(childId).get();
    if (!childDoc.exists) return res.status(404).json({ error: 'Child not found' });

    const childData = childDoc.data();
    if (!childData.parentEmail) return res.status(404).json({ error: 'Parent email not found for this child' });

    // Get therapist email
    let therapistEmail = '';
    try {
      const userRecord = await admin.auth().getUser(req.userId);
      therapistEmail = userRecord.email || '';
    } catch (err) {
      console.warn('Failed to get therapist email:', err.message);
    }

    // Create the note in Firestore
    const noteDoc = {
      child_email: childData.email || '',
      parent_email: childData.parentEmail,
      therapist_email: therapistEmail,
      title,
      notes: content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const noteRef = await admin.firestore().collection('therapist_notes').add(noteDoc);

    return res.status(201).json({
      success: true,
      message: 'Note sent to parent successfully',
      data: { id: noteRef.id, ...noteDoc }
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
