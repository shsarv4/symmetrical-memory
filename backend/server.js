const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./src/config');

const { initializeAdmin } = require('./firebase/admin');
const progressRoutes = require('./routes/progress');

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
  const geminiConfig = config.getGeminiConfig();
  res.json({
    firebase: config.getFirebaseConfig(),
    apiBaseUrl: apiBaseUrl,
    gemini: {
      enabled: geminiConfig.enabled || false
    }
  });
});

// Rate limiting for protected routes only
const rateLimitConfig = backendConfig.rateLimit || { windowMs: 15 * 60 * 1000, max: 100 };
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: { error: 'Too many requests, please try again later.' }
});

// API routes (with rate limiting)
app.use('/api/progress', limiter, progressRoutes);
app.use('/api/gemini', limiter, require('./routes/gemini'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// SPA fallback: serve index.html for all non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // Let 404 handler handle unknown API routes
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 CORS origins: ${corsOrigins.join(', ')}`);
  console.log(`🔐 Firebase Admin initialized`);
  console.log(`🌐 Frontend served from ${path.join(__dirname, '..', 'frontend')}`);
});

module.exports = app;
