const express = require('express');
const router = express.Router();
const { getFirestore, admin } = require('../firebase/admin');
const { verifyAdmin } = require('../middleware/admin');

const db = getFirestore();

// Note: All routes require Firebase authentication (verifyFirebaseToken applied at mount in server.js)
// Admin routes additionally require admin role (verifyAdmin middleware)

// GET /api/announcements - Get active announcements (any authenticated user)
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    const snapshot = await db.collection('announcements')
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const announcements = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter by startDate and endDate if present
      const startDate = data.startDate?.toDate?.();
      const endDate = data.endDate?.toDate?.();

      const isInRange = (!startDate || startDate <= now) &&
                        (!endDate || endDate >= now);

      if (isInRange) {
        announcements.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate?.()?.toISOString() || data.startDate,
          endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        });
      }
    });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error fetching announcements:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// GET /api/announcements/all - Get all announcements (admin only, requires Firebase auth + admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('announcements')
      .orderBy('createdAt', 'desc')
      .get();

    const announcements = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      announcements.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate?.()?.toISOString() || data.startDate,
        endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error fetching all announcements:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST /api/announcements - Create announcement (admin only, requires Firebase auth + admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      active = true,
      startDate,
      endDate
    } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        error: 'Missing required fields: title, message'
      });
    }

    if (!['info', 'warning', 'success', 'update'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be one of: info, warning, success, update'
      });
    }

    const announcementData = {
      title,
      message,
      type,
      active: Boolean(active),
      startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null,
      endDate: endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('announcements').add(announcementData);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcementId: docRef.id,
      announcement: { ...announcementData, id: docRef.id }
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error creating announcement:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// PUT /api/announcements/:id - Update announcement (admin only, requires Firebase auth + admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if announcement exists
    const doc = await db.collection('announcements').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Build update object
    const allowedFields = ['title', 'message', 'type', 'active', 'startDate', 'endDate'];
    const update = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'startDate' && updateData[field]) {
          update[field] = admin.firestore.Timestamp.fromDate(new Date(updateData[field]));
        } else if (field === 'endDate' && updateData[field]) {
          update[field] = admin.firestore.Timestamp.fromDate(new Date(updateData[field]));
        } else if (field === 'active') {
          update[field] = Boolean(updateData[field]);
        } else if (field === 'type') {
          if (['info', 'warning', 'success', 'update'].includes(updateData[field])) {
            update[field] = updateData[field];
          }
        } else {
          update[field] = updateData[field];
        }
      }
    });

    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('announcements').doc(id).update(update);

    res.json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error updating announcement:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// DELETE /api/announcements/:id - Delete announcement (admin only, requires Firebase auth + admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const doc = await db.collection('announcements').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await db.collection('announcements').doc(id).delete();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Error deleting announcement:', isProd ? error.message : error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;
