const admin = require('firebase-admin');

// Lazy load config only if needed (local dev)
let config = null;
function loadConfig() {
  if (!config) {
    try {
      config = require('../src/config');
    } catch (e) {
      console.warn('Config module not available, running in Cloud Functions mode');
      config = null;
    }
  }
  return config;
}

let _admin = null;

function initializeAdmin() {
  if (_admin) return _admin;

  try {
    const isCloudFunction = process.env.FUNCTIONS_EMULATOR || process.env.K_SERVICE;

    if (isCloudFunction) {
      // Cloud Functions (including emulator): Use default service account
      // The function's service account must have necessary permissions
      _admin = admin.initializeApp();
      console.log('✅ Firebase Admin initialized with default credentials (Cloud Functions)');
    } else {
      // Local development: Use service account from config.json
      const cfg = loadConfig();
      if (!cfg) {
        throw new Error('Config module not found. Make sure you are running from project root.');
      }
      const serviceAccount = cfg.getServiceAccount();

      if (!serviceAccount || !serviceAccount.private_key) {
        throw new Error('Invalid service account configuration. Check config.json');
      }

      _admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });

      console.log('✅ Firebase Admin initialized with service account from config.json');
    }

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
