const express = require('express');
const router = express.Router();
const { getFirestore, admin } = require('../firebase/admin');
const { verifyAdmin } = require('../middleware/admin');

const db = getFirestore();

// Collection name for app settings
const SETTINGS_COLLECTION = 'appSettings';

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    // Count total users (from Firestore users collection)
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Count modules
    const modulesSnapshot = await db.collection('modules').get();
    const totalModules = modulesSnapshot.size;

    // Count active announcements
    const announcementsSnapshot = await db.collection('announcements')
      .where('active', '==', true)
      .get();
    const activeAnnouncements = announcementsSnapshot.size;

    // Count total progress entries (users with progress)
    const progressSnapshot = await db.collection('users')
      .where('progress', '!=', null)
      .get();
    const usersWithProgress = progressSnapshot.size;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalModules,
        activeAnnouncements,
        usersWithProgress
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email,
        role: data.role || 'user',
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin
      });
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:uid/role - Update user role
router.put('/users/:uid/role', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be one of: admin, user'
      });
    }

    // Check if user exists
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    await db.collection('users').doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// GET /api/admin/users/:uid - Get single user details
// Users can view their own profile, but admins can view any user
router.get('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // If requesting own profile, allow without admin check
    if (req.user.uid === uid) {
      const doc = await db.collection('users').doc(uid).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const data = doc.data();
      return res.json({
        success: true,
        user: {
          uid: doc.id,
          email: data.email,
          role: data.role || 'user',
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
          progress: data.progress || {}
        }
      });
    }

    // For other users, require admin role
    if (req.user.role !== 'admin') {
      // Need to check admin status from Firestore
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
    }

    // If we get here, user is admin viewing another user's profile
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const data = doc.data();
    res.json({
      success: true,
      user: {
        uid: doc.id,
        email: data.email,
        role: data.role || 'user',
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
        progress: data.progress || {}
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/admin/ai-model - Get current AI model setting (any authenticated user, admin panel is already protected)
router.get('/ai-model', async (req, res) => {
  try {
    // Read from config.json as fallback
    const config = require('../src/config');
    const openrouterConfig = config.getOpenRouterConfig() || {};

    const defaultModel = openrouterConfig.model || 'mistralai/mixtral-8x7b-instruct';

    // Try to read from Firestore settings
    let currentModel = defaultModel;
    try {
      const settingsDoc = await db.collection(SETTINGS_COLLECTION).doc('aiModel').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        if (data.model) {
          currentModel = data.model;
        }
      }
    } catch (firestoreError) {
      console.error('Failed to read AI model from Firestore:', firestoreError);
      // Use default model
    }

    res.json({
      success: true,
      model: currentModel,
      // List of available free/paid models for reference
      availableModels: [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', type: 'free' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', type: 'free' },
        { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B Instruct', provider: 'Mistral AI', type: 'free' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', provider: 'Meta', type: 'free' },
        { id: 'google/gemma-7b-it', name: 'Gemma 7B IT', provider: 'Google', type: 'free' },
        { id: 'microsoft/phi-3-mini-4k-instruct', name: 'Phi-3 Mini 4K Instruct', provider: 'Microsoft', type: 'free' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'paid' },
        { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'paid' },
        { id: 'stepfun/step-3.5-flash:free', name: 'Step-3.5 Flash (Free)', provider: 'StepFun', type: 'free' },
        { id: 'stepfun/step-3.5-flash', name: 'Step-3.5 Flash', provider: 'StepFun', type: 'free' }
      ]
    });
  } catch (error) {
    console.error('Error fetching AI model:', error);
    res.status(500).json({ error: 'Failed to fetch AI model setting' });
  }
});

// PUT /api/admin/ai-model - Update AI model setting (admin only)
router.put('/ai-model', verifyAdmin, async (req, res) => {
  try {
    const { model } = req.body;

    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    // Save to Firestore (accept any valid OpenRouter model ID)
    await db.collection(SETTINGS_COLLECTION).doc('aiModel').set({
      model,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: `AI model updated to ${model}`
    });
  } catch (error) {
    console.error('Error updating AI model:', error);
    res.status(500).json({ error: 'Failed to update AI model' });
  }
});

module.exports = router;
