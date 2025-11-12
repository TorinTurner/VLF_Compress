const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for VLF Compress
 * Creates a secure bridge between the Electron main process and renderer process
 * using Context Isolation
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('vlf', {
  // File selection
  selectFile: (options) => ipcRenderer.invoke('select-file', options),

  // Save dialog
  saveDialog: (options) => ipcRenderer.invoke('save-dialog', options),

  // Show file in folder
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),

  // Get user settings
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // Compression operations
  compressFile: (args) => ipcRenderer.invoke('compress-file', args),
  decompressFile: (args) => ipcRenderer.invoke('decompress-file', args)
});

// Separate context for setup dialog
contextBridge.exposeInMainWorld('electron', {
  selectDirectory: (title) => ipcRenderer.invoke('select-directory', title),
  completeSetup: (config) => ipcRenderer.invoke('complete-setup', config)
});
