const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(req.userId)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      success: true,
      data: {
        userId: req.userId,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateUser, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    
    const updateData = {
      name,
      email,
      phone,
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore()
      .collection('users')
      .doc(req.userId)
      .update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (for registration)
router.post('/register', async (req, res) => {
  try {
    const { userId, name, email, phone, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userData = {
      userId,
      name,
      email,
      phone,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if user already exists
    const existingUser = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (existingUser.exists) {
      return res.status(409).json({ error: 'User already exists' });
    }

    await admin.firestore()
      .collection('users')
      .doc(userId)
      .set(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (for therapists/parents)
router.get('/', authenticateToken, checkRole(['therapist', 'parent']), async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticateToken, checkRole(['therapist']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .delete();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
