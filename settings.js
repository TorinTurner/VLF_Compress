const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Settings management for VLF Compress
 * Handles loading, saving, and default settings
 */

// Get the settings file path (platform-specific)
function getSettingsPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'settings.json');
}

// Load settings from disk
function loadSettings() {
  try {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return null;
}

// Save settings to disk
function saveSettings(settings) {
  try {
    const settingsPath = getSettingsPath();
    const settingsDir = path.dirname(settingsPath);

    // Ensure directory exists
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    console.log('Settings saved to:', settingsPath);
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Check if this is the first run
function isFirstRun() {
  const settings = loadSettings();
  return !settings || settings.firstRun !== false;
}

// Get default settings based on platform
function getDefaultSettings(exeDir) {
  const userDataPath = app.getPath('userData');

  return {
    inputDir: path.join(userDataPath, 'input'),
    outputDir: path.join(userDataPath, 'output'),
    firstRun: false
  };
}

module.exports = {
  loadSettings,
  saveSettings,
  isFirstRun,
  getDefaultSettings,
  getSettingsPath
};
