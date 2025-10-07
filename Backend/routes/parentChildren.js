// routes/parentChildren.js
const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// All routes here require parent or therapist role
router.use(authenticateToken, checkRole(['parent', 'therapist']));

/**
 * Helper - normalize email
 */
const normalizeEmail = (email) => {
  if (!email) return null;
  return String(email).trim().toLowerCase();
};

/**
 * Helper - given an identifier (uid or email), try to resolve to a user doc
 * Returns { uid, userDoc } or null
 */
const resolveChildByIdOrEmail = async ({ childId, childEmail }) => {
  try {
    // If we have a childId (uid) try direct lookup
    if (childId) {
      const userDoc = await admin.firestore().collection('users').doc(childId).get();
      if (userDoc.exists) return { uid: childId, userDoc };
      // if doc doesn't exist, fallthrough to try email if provided
      console.warn(`resolveChild: childId provided but no users doc found for uid=${childId}`);
    }

    // If we have an email, try Firestore users collection first
    if (childEmail) {
      const normalized = normalizeEmail(childEmail);
      const query = await admin.firestore()
        .collection('users')
        .where('email', '==', normalized)
        .limit(1)
        .get();
      if (!query.empty) {
        const doc = query.docs[0];
        return { uid: doc.id, userDoc: doc };
      }

      // Fallback to Firebase Auth lookup (less preferred but works)
      try {
        const userRecord = await admin.auth().getUserByEmail(normalized);
        const uid = userRecord.uid;
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (userDoc.exists) return { uid, userDoc };
        // If auth has user but Firestore does not, return uid with null userDoc to allow caller to handle
        return { uid, userDoc: null };
      } catch (authErr) {
        if (authErr && authErr.code === 'auth/user-not-found') {
          console.warn(`resolveChild: no auth user for email=${normalized}`);
        } else {
          console.error('resolveChild auth lookup error:', authErr);
        }
      }
    }

    return null;
  } catch (err) {
    console.error('resolveChildByIdOrEmail error:', err);
    return null;
  }
};

/**
 * Link a child to the parent by childId (uid)
 */
router.post('/link', async (req, res) => {
  try {
    const { childId } = req.body;
    if (!childId) return res.status(400).json({ error: 'childId is required' });

    // Validate child user exists and is role 'child'
    const childDoc = await admin.firestore().collection('users').doc(childId).get();
    if (!childDoc.exists) return res.status(404).json({ error: 'Child user not found' });
    const childData = childDoc.data();
    if (childData.role !== 'child') return res.status(400).json({ error: 'Provided user is not a child account' });

    // Check if link already exists (either by childId or childEmail)
    const existing = await admin.firestore()
      .collection('parent_children')
      .where('parentId', '==', req.userId)
      .where('childId', '==', childId)
      .limit(1)
      .get();
    if (!existing.empty) return res.json({ success: true, message: 'Already linked', data: { childId } });

    // Save link with both id and email to avoid ambiguity later
    const linkData = {
      parentId: req.userId,
      childId,
      childEmail: childData.email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await admin.firestore().collection('parent_children').add(linkData);

    return res.status(201).json({ success: true, message: 'Child linked successfully', data: { id: ref.id, ...linkData } });
  } catch (error) {
    console.error('Error linking child:', error);
    res.status(500).json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

/**
 * Link by child's email (preferred; no password needed)
 */
router.post('/link-email', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return res.status(400).json({ error: 'email is required' });

    // Lookup child by email - prefer Firestore (users collection)
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

    const linkDoc = {
      parentId: req.userId,
      childId: childUid,
      childEmail: normalizedEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await admin.firestore().collection('parent_children').add(linkDoc);

    return res.status(201).json({ success: true, message: 'Child linked successfully', data: { id: ref.id, childId: childUid } });
  } catch (error) {
    console.error('Error linking child by email:', error);
    const message = error?.message || 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * List children linked to current parent
 *
 * This is fixed to tolerate older links that only have childEmail
 * It resolves each link to a users doc (if possible) and returns an array
 */
router.get('/', async (req, res) => {
  try {
    const linksSnap = await admin.firestore()
      .collection('parent_children')
      .where('parentId', '==', req.userId)
      .get();

    if (linksSnap.empty) return res.json({ success: true, data: [] });

    const links = linksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Resolve each link to a user doc (if possible). Do it concurrently.
    const resolved = await Promise.all(links.map(async link => {
      try {
        const childId = link.childId || null;
        const childEmail = link.childEmail || null;

        // If we already have a childId, try to load the Firestore user doc
        if (childId) {
          const userDoc = await admin.firestore().collection('users').doc(childId).get();
          if (userDoc.exists) {
            return { linkId: link.id, childId, childEmail: userDoc.data().email || childEmail, user: { id: userDoc.id, ...userDoc.data() } };
          }
          // If docs missing although childId present, try to recover through email if present
          console.warn(`parent_children: link ${link.id} had childId=${childId} but no users doc found`);
        }

        // If no childId or not found, but email exists try resolve via users collection
        if (childEmail) {
          const normalized = normalizeEmail(childEmail);
          const q = await admin.firestore().collection('users').where('email', '==', normalized).limit(1).get();
          if (!q.empty) {
            const u = q.docs[0];
            return { linkId: link.id, childId: u.id, childEmail: normalized, user: { id: u.id, ...u.data() } };
          }

          // fallback to auth lookup to get uid then try Firestore doc
          try {
            const userRecord = await admin.auth().getUserByEmail(normalized);
            const uid = userRecord.uid;
            const uDoc = await admin.firestore().collection('users').doc(uid).get();
            if (uDoc.exists) return { linkId: link.id, childId: uid, childEmail: normalized, user: { id: uDoc.id, ...uDoc.data() } };
            // if auth user exists but no firestore profile, return minimal info
            return { linkId: link.id, childId: uid, childEmail: normalized, user: { id: uid, email: normalized } };
          } catch (authErr) {
            console.warn(`parent_children: could not resolve link ${link.id} by email ${childEmail}:`, authErr?.message || authErr);
          }
        }

        // If we reach here we couldn't resolve this link
        console.warn(`parent_children: unable to resolve link id=${link.id} (childId=${childId} childEmail=${childEmail})`);
        return null;
      } catch (err) {
        console.error('Error resolving link:', err);
        return null;
      }
    }));

    // Filter out unresolved links and map to the children payload expected by frontend
    const children = resolved
      .filter(r => r && r.user)
      .map(r => {
        // keep shape similar to old behavior: { id: uid, ...userData }
        return { ...r.user };
      });

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
    console.error('Error fetching child summary:', error.stack || error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
    });
  }
});

// GET /parent/children/parent-notes
router.get('/parent-notes', async (req, res) => {
  try {
    const parentEmail = req.query.email?.toLowerCase().trim();

    if (!parentEmail) {
      return res.status(400).json({ success: false, error: 'Parent email is required' });
    }

    // Fetch all notes where parent_email matches (case-insensitive)
    const notesSnap = await admin.firestore()
      .collection('therapist_notes')
      .where('parent_email', '==', parentEmail) // make sure field matches Firestore exactly
      .get();

    const notes = notesSnap.empty
      ? []
      : notesSnap.docs.map(doc => {
          const data = doc.data();

          // Normalize Firestore Timestamp fields to ISO strings for the client
          const toISO = (ts) => {
            if (!ts) return null;
            // Firestore Timestamp has toDate()
            if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
            // If already a Date or string/number, try to convert
            try {
              return new Date(ts).toISOString();
            } catch {
              return null;
            }
          };

          return {
            id: doc.id,
            ...data,
            createdAt: toISO(data.createdAt),
            updatedAt: toISO(data.updatedAt)
          };
        });

    return res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching parent notes:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


module.exports = router;
