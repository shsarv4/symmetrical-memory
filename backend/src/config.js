const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.CONFIG_PATH || path.join(__dirname, '..', '..', 'config.json');

let configCache = null;

function loadConfig() {
  if (configCache) return configCache;

  // First, try config.json (local development)
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      configCache = JSON.parse(raw);
      console.log('✅ Configuration loaded from config.json');
      return configCache;
    }
  } catch (e) {
    console.warn('⚠️ Could not load config.json, trying alternative...');
  }

  // Second, try Firebase Functions config (production on Cloud Functions)
  try {
    const functions = require('firebase-functions');
    const functionsConfig = functions.config();
    if (functionsConfig && (functionsConfig.firebase || functionsConfig.app)) {
      configCache = functionsConfig;
      console.log('✅ Configuration loaded from Firebase Functions config');
      return configCache;
    }
  } catch (e) {
    // Not running in Cloud Functions or firebase-functions not available
  }

  console.error('❌ Configuration not found.');
  console.error('   Please either:');
  console.error('   - Create config.json (local development)');
  console.error('   - Or set Firebase Functions config: firebase functions:config:set ...');
  process.exit(1);
}

function getFirebaseConfig() {
  return loadConfig().firebase;
}

function getServiceAccount() {
  return loadConfig().serviceAccount;
}

function getBackendConfig() {
  return loadConfig().backend;
}

function getGeminiConfig() {
  return loadConfig().gemini;
}

function getOpenRouterConfig() {
  return loadConfig().openrouter || loadConfig().gemini; // fallback to gemini config for backward compatibility
}

function getAppConfig() {
  return loadConfig().app;
}

module.exports = {
  loadConfig,
  getFirebaseConfig,
  getServiceAccount,
  getBackendConfig,
  getGeminiConfig,
  getOpenRouterConfig,
  getAppConfig
};
