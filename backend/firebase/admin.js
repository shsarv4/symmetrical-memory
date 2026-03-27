const admin = require('firebase-admin');
const config = require('../src/config');

let _admin = null;

function initializeAdmin() {
  if (_admin) return _admin;

  try {
    const serviceAccount = config.getServiceAccount();

    if (!serviceAccount || !serviceAccount.private_key) {
      throw new Error('Invalid service account configuration');
    }

    _admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log('✅ Firebase Admin initialized with service account from config.json');
    return _admin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    throw error;
  }
}

function getAuth() {
  return initializeAdmin().auth();
}

function getFirestore() {
  return initializeAdmin().firestore();
}

module.exports = {
  initializeAdmin,
  getAuth,
  getFirestore,
  admin // Export admin for FieldValue and other constants
};
