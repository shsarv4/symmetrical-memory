const express = require('express');
const router = express.Router();
const { getFirestore, admin } = require('../firebase/admin');
const { verifyAdmin } = require('../middleware/admin');

const db = getFirestore();

// Note: All routes here require Firebase authentication (verifyFirebaseToken applied at mount in server.js)
// Write routes additionally require admin role

// GET /api/modules - Public read (but requires auth via mount)
router.get('/', async (req, res) => {
  try {
    const modulesSnapshot = await db.collection('modules')
      .orderBy('order', 'asc')
      .get();

    const modules = [];
    modulesSnapshot.forEach(doc => {
      const data = doc.data();
      modules.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });

    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// GET /api/modules/:id - Get single module (requires auth)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('modules').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const data = doc.data();
    res.json({
      success: true,
      module: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// POST /api/modules - Create module (requires Firebase auth + admin role)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const {
      id,
      title,
      subtitle,
      icon,
      accent,
      topics,
      resources,
      exercises,
      order
    } = req.body;

    // Validation
    if (!title || !subtitle || !topics || !Array.isArray(topics)) {
      return res.status(400).json({
        error: 'Missing required fields: title, subtitle, topics (array)'
      });
    }

    // Generate ID if not provided
    const moduleId = id || db.collection('modules').doc().id;

    // Sanitize topics structure
    const sanitizedTopics = topics.map(topic => ({
      id: topic.id || `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: topic.title,
      subtopics: Array.isArray(topic.subtopics) ? topic.subtopics : []
    }));

    const moduleData = {
      id: moduleId,
      title,
      subtitle,
      icon: icon || '📚',
      accent: accent || '#c084fc',
      topics: sanitizedTopics,
      resources: Array.isArray(resources) ? resources : [],
      exercises: Array.isArray(exercises) ? exercises : [],
      order: order || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('modules').doc(moduleId).set(moduleData);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module: { ...moduleData, id: moduleId }
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// PUT /api/modules/:id - Update module (requires Firebase auth + admin role)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if module exists
    const doc = await db.collection('modules').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Build update object (only allow specific fields)
    const allowedFields = [
      'title', 'subtitle', 'icon', 'accent', 'topics',
      'resources', 'exercises', 'order'
    ];

    const update = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // Sanitize topics if present
        if (field === 'topics' && Array.isArray(updateData[field])) {
          update[field] = updateData[field].map(topic => ({
            id: topic.id,
            title: topic.title,
            subtopics: Array.isArray(topic.subtopics) ? topic.subtopics : []
          }));
        } else {
          update[field] = updateData[field];
        }
      }
    });

    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('modules').doc(id).update(update);

    res.json({
      success: true,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// DELETE /api/modules/:id - Delete module (requires Firebase auth + admin role)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if module exists
    const doc = await db.collection('modules').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await db.collection('modules').doc(id).delete();

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

module.exports = router;
