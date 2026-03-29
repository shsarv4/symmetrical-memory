let firebaseApp = null;
let auth = null;

/**
 * Initialize Firebase with config
 * @param {Object} firebaseConfig - Firebase configuration object
 * @returns {Object} { app, auth }
 */
export function initializeFirebase(firebaseConfig) {
  if (firebaseApp) {
    return { app: firebaseApp, auth: auth };
  }

  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('Invalid Firebase configuration');
  }

  // Initialize Firebase app
  firebaseApp = firebase.initializeApp(firebaseConfig);
  auth = firebaseApp.auth();

  // Configure persistence
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

  console.log('✅ Firebase initialized');
  return { app: firebaseApp, auth };
}

export function getAuth() {
  return auth;
}

export function getFirebaseApp() {
  return firebaseApp;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized() {
  return !!firebaseApp;
}
