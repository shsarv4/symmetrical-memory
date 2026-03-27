const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.CONFIG_PATH || path.join(__dirname, '..', '..', 'config.json');

let configCache = null;

function loadConfig() {
  if (configCache) return configCache;

  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      console.error(`❌ Configuration file not found at: ${CONFIG_PATH}`);
      console.error('📝 Please copy config.example.json to config.json and fill in your values.');
      process.exit(1);
    }

    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    configCache = JSON.parse(raw);
    console.log('✅ Configuration loaded from config.json');
    return configCache;
  } catch (error) {
    console.error('❌ Failed to load config.json:', error.message);
    console.error('   Make sure config.json exists and contains valid JSON.');
    process.exit(1);
  }
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

function getAppConfig() {
  return loadConfig().app;
}

module.exports = {
  loadConfig,
  getFirebaseConfig,
  getServiceAccount,
  getBackendConfig,
  getGeminiConfig,
  getAppConfig
};
