const { getFirestore } = require('../firebase/admin');

const db = getFirestore();

/**
 * Middleware to verify user has admin role
 * Checks Firestore users collection for role field
 */
async function verifyAdmin(req, res, next) {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    const role = userData.role;

    if (role !== 'admin') {
      console.warn(`⛔ Admin access denied for user: ${uid} (role: ${role || 'none'})`);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log(`✅ Admin access granted for user: ${uid}`);
    next();
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    console.error('Admin verification error:', isProd ? error.message : error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

module.exports = { verifyAdmin };
