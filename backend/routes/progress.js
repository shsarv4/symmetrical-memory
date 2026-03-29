const express = require('express');
const router = express.Router();
const { getFirestore, admin } = require('../firebase/admin');
const { verifyFirebaseToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyFirebaseToken);

const db = getFirestore();

// GET /api/progress - Load user progress
router.get('/', async (req, res) => {
  try {
    const docRef = db.collection('users').doc(req.user.uid);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();
      res.json({
        success: true,
        progress: data.progress || {},
        updatedAt: data.updatedAt
      });
    } else {
      // No progress data yet
      res.json({
        success: true,
        progress: {},
        updatedAt: null
      });
    }
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error loading progress:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// POST /api/progress - Save user progress
router.post('/', async (req, res) => {
  try {
    const { progress } = req.body;

    if (!progress || typeof progress !== 'object') {
      return res.status(400).json({ error: 'Progress data is required' });
    }

    // Validate keys - only allow progress-related keys (t_, s_, e_, notes_)
    const validKeys = Object.keys(progress).filter(key =>
      key.startsWith('t_') ||
      key.startsWith('s_') ||
      key.startsWith('e_') ||
      key.startsWith('notes_')
    );

    const sanitizedProgress = {};
    validKeys.forEach(key => {
      sanitizedProgress[key] = progress[key];
    });

    const docRef = db.collection('users').doc(req.user.uid);

    // Fetch existing progress to avoid overwriting keys not present in this update
    const doc = await docRef.get();
    const existingProgress = doc.exists ? (doc.data().progress || {}) : {};

    // Merge: incoming keys overwrite existing ones, but existing keys not in incoming are preserved
    const mergedProgress = { ...existingProgress, ...sanitizedProgress };

    await docRef.set({
      progress: mergedProgress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error saving progress:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

module.exports = router;
