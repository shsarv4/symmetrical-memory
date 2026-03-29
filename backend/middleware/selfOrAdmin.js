const { getFirestore } = require('../firebase/admin');

const db = getFirestore();

/**
 * Middleware to verify that user is either:
 * - Accessing their own profile (uid matches req.params.uid)
 * - OR has admin role (checked from Firestore)
 *
 * This is needed for routes like GET /api/admin/users/:uid where users
 * can view their own profile but only admins can view others.
 */
async function verifySelfOrAdmin(req, res, next) {
  try {
    const requesterUid = req.user?.uid;

    if (!requesterUid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const targetUid = req.params?.uid;

    if (!targetUid) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // If accessing own profile, allow without admin check
    if (requesterUid === targetUid) {
      return next();
    }

    // For other users, verify admin role from Firestore
    const userDoc = await db.collection('users').doc(requesterUid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    const role = userData.role;

    if (role !== 'admin') {
      console.warn(`⛔ Admin access denied for user: ${requesterUid} (role: ${role || 'none'}) - trying to access user ${targetUid}`);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log(`✅ Admin access granted for user: ${requesterUid} - accessing user ${targetUid}`);
    next();
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Self-or-admin verification error:', isProd ? error.message : error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

module.exports = { verifySelfOrAdmin };
