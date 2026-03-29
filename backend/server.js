const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const config = require('./src/config');

const { initializeAdmin } = require('./firebase/admin');
const { verifyFirebaseToken } = require('./middleware/auth');
const progressRoutes = require('./routes/progress');
const modulesRoutes = require('./routes/modules');
const announcementsRoutes = require('./routes/announcements');
const adminRoutes = require('./routes/admin');

const app = express();
const backendConfig = config.getBackendConfig();
const PORT = backendConfig.port || 3000;

// CORS configuration - allow same-origin by default (since frontend served from backend)
const corsOrigins = backendConfig.corsOrigins || ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin
try {
  initializeAdmin();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public config endpoint (no rate limit, no auth)
app.get('/api/config', (req, res) => {
  const appConfig = config.getAppConfig();
  let apiBaseUrl = appConfig.apiBaseUrl;
  // Default to empty string (same origin) if not set
  if (apiBaseUrl === undefined || apiBaseUrl === null) {
    apiBaseUrl = '';
  }
  const openrouterConfig = config.getOpenRouterConfig() || {};
  res.json({
    firebase: config.getFirebaseConfig(),
    apiBaseUrl: apiBaseUrl,
    gemini: {
      enabled: !!openrouterConfig.apiKey, // Show as enabled if OpenRouter key exists
      provider: 'openrouter'
    }
  });
});

// Public API routes (no auth required)
// Note: announcements has mixed - GET / is public, but admin routes need auth
// We apply Firebase auth at mount, then admin routes additionally check role
app.use('/api/announcements', verifyFirebaseToken, announcementsRoutes);
app.use('/api/modules', verifyFirebaseToken, modulesRoutes);
app.use('/api/progress', verifyFirebaseToken, progressRoutes);

// Rate limiting for Gemini AI endpoints (disabled for development)
// const rateLimitConfig = backendConfig.rateLimit || { windowMs: 15 * 60 * 1000, max: 100 };
// const limiter = rateLimit({
//   windowMs: rateLimitConfig.windowMs,
//   max: rateLimitConfig.max,
//   message: { error: 'Too many requests, please try again later.' }
// });

// app.use('/api/gemini', limiter, require('./routes/gemini'));
app.use('/api/gemini', require('./routes/gemini')); // No rate limit for now

// Admin routes (require both Firebase auth AND admin role)
app.use('/api/admin', verifyFirebaseToken, require('./routes/admin'));

// Serve static frontend files - ONLY when running locally (not in Cloud Functions)
const isCloudFunction = process.env.FUNCTIONS_EMULATOR || process.env.K_SERVICE;
if (!isCloudFunction) {
  // Local development: serve built frontend from backend
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

  // Check if build exists, otherwise fall back to development static serving
  const staticPath = fs.existsSync(frontendBuildPath) ? frontendBuildPath : path.join(__dirname, '..', 'frontend');

  app.use(express.static(staticPath));

  // SPA fallback: serve index.html for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(); // Let 404 handler handle unknown API routes
    }
    const indexPath = path.join(staticPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Failed to serve index.html:', err.message);
        res.status(404).json({ error: 'Frontend not found. Run `npm run build` in frontend/.' });
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start the server if this file is run directly (not required as a module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 CORS origins: ${corsOrigins.join(', ')}`);
    console.log(`🔐 Firebase Admin initialized`);
    console.log(`🌐 Frontend served from ${path.join(__dirname, '..', 'frontend')}`);
  });
}

module.exports = app;

// Also export as Cloud Function for Firebase deployment (if firebase-functions is available)
try {
  const functions = require('firebase-functions');
  exports.backend = functions.https.onRequest(app);
  console.log('☁️ Cloud Function export initialized');
} catch (err) {
  // firebase-functions not installed or not needed (local dev) - ignore
}
