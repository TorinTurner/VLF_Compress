const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { loadSettings, saveSettings, isFirstRun, getDefaultSettings } = require('./settings');

let mainWindow = null;
let setupWindow = null;
let userSettings = null;

// Determine if we're running in development or production
const isDev = !app.isPackaged;

// Get the path to the Python executable
function getPythonExecutablePath() {
  if (isDev) {
    // In development, try to use system Python
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  // In production, use bundled Python executable
  const appRoot = process.resourcesPath;
  let pythonPath;

  if (process.platform === 'win32') {
    pythonPath = path.join(appRoot, 'python', 'vlf_compress_core.exe');
  } else if (process.platform === 'darwin') {
    pythonPath = path.join(appRoot, 'python', 'vlf_compress_core');
  } else {
    pythonPath = path.join(appRoot, 'python', 'vlf_compress_core');
  }

  return pythonPath;
}

// Execute Python command
async function executePython(command, args = []) {
  return new Promise((resolve, reject) => {
    const pythonPath = getPythonExecutablePath();

    // Validate that the executable exists in production
    if (!isDev) {
      if (!fs.existsSync(pythonPath)) {
        const errorMsg = `Python executable not found at: ${pythonPath}`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
        return;
      }
    }

    const fullArgs = [command, ...args, '--json'];

    console.log(`Executing: ${pythonPath} ${fullArgs.join(' ')}`);

    // Set up spawn options
    const spawnOptions = {
      env: {
        ...process.env,
        VLF_OUTPUT_DIR: userSettings.outputDir,
        VLF_INPUT_DIR: userSettings.inputDir
      }
    };

    // Only set cwd for production builds where we have a real directory path
    if (!isDev && path.dirname(pythonPath) !== '.') {
      spawnOptions.cwd = path.dirname(pythonPath);
    }

    const pythonProcess = spawn(pythonPath, fullArgs, spawnOptions);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', stderr);
        reject(new Error(stderr || `Python process exited with code ${code}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          console.error('Failed to parse Python output:', stdout);
          reject(new Error('Failed to parse Python output'));
        }
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      console.error('Python path:', pythonPath);
      console.error('Working directory:', spawnOptions.cwd || process.cwd());
      reject(new Error(`Failed to start Python process: ${err.message}\nPath: ${pythonPath}`));
    });
  });
}

// Create the main application window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Create setup window for first run
function createSetupWindow() {
  return new Promise((resolve) => {
    setupWindow = new BrowserWindow({
      width: 600,
      height: 500,
      resizable: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      show: false
    });

    // Simple setup dialog HTML
    const setupHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 30px;
            background: #f5f7fa;
            color: #2c3e50;
          }
          h1 { color: #1e3c72; margin-bottom: 20px; }
          p { line-height: 1.6; margin-bottom: 20px; color: #4a5568; }
          .option {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid #cbd5e0;
            transition: all 0.3s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .option:hover { border-color: #1e3c72; background: #f8f9fa; }
          .option h3 { margin: 0 0 10px 0; color: #1e3c72; }
          .option p { margin: 0; font-size: 14px; color: #4a5568; }
          button {
            background: #1e3c72;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s;
          }
          button:hover { background: #2a5298; transform: translateY(-2px); }
          button:disabled { background: #cbd5e0; cursor: not-allowed; opacity: 0.5; }
          .custom-paths { display: none; margin-top: 20px; }
          .custom-paths.show { display: block; }
          .path-input {
            margin: 10px 0;
            display: flex;
            flex-direction: column;
          }
          .path-input label { margin-bottom: 5px; font-weight: bold; color: #2c3e50; }
          .path-input input {
            padding: 10px;
            background: #f8f9fa;
            border: 2px solid #cbd5e0;
            border-radius: 4px;
            color: #2c3e50;
            font-size: 14px;
            margin-right: 10px;
            margin-bottom: 10px;
          }
          .path-input input:focus {
            outline: none;
            border-color: #1e3c72;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to GENTEXT Compress</h1>
        <p>Choose where to store your files:</p>

        <div class="option" id="default-option">
          <h3>Default Location (Recommended)</h3>
          <p>Store files in your user data folder</p>
        </div>

        <div class="option" id="custom-option">
          <h3>Custom Location</h3>
          <p>Choose your own folders</p>
        </div>

        <div class="custom-paths" id="custom-paths">
          <div class="path-input">
            <label>Input Files Folder:</label>
            <input type="text" id="input-path" readonly placeholder="Click to select...">
            <button onclick="selectInputDir()">Browse...</button>
          </div>
          <div class="path-input">
            <label>Output Files Folder:</label>
            <input type="text" id="output-path" readonly placeholder="Click to select...">
            <button onclick="selectOutputDir()">Browse...</button>
          </div>
        </div>

        <button id="continue-btn" onclick="continueSetup()">Continue</button>

        <script>
          let useDefault = true;
          let inputDir = '';
          let outputDir = '';

          document.getElementById('default-option').addEventListener('click', () => {
            useDefault = true;
            document.getElementById('default-option').style.borderColor = '#1e3c72';
            document.getElementById('custom-option').style.borderColor = '#cbd5e0';
            document.getElementById('custom-paths').classList.remove('show');
          });

          document.getElementById('custom-option').addEventListener('click', () => {
            useDefault = false;
            document.getElementById('custom-option').style.borderColor = '#1e3c72';
            document.getElementById('default-option').style.borderColor = '#cbd5e0';
            document.getElementById('custom-paths').classList.add('show');
          });

          async function selectInputDir() {
            const result = await window.electron.selectDirectory('Select Input Files Folder');
            if (result) {
              inputDir = result;
              document.getElementById('input-path').value = result;
            }
          }

          async function selectOutputDir() {
            const result = await window.electron.selectDirectory('Select Output Files Folder');
            if (result) {
              outputDir = result;
              document.getElementById('output-path').value = result;
            }
          }

          function continueSetup() {
            if (!useDefault && (!inputDir || !outputDir)) {
              alert('Please select both input and output folders');
              return;
            }
            window.electron.completeSetup({ useDefault, inputDir, outputDir });
          }

          // Select default by default
          document.getElementById('default-option').click();
        </script>
      </body>
      </html>
    `;

    setupWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(setupHTML));

    setupWindow.once('ready-to-show', () => {
      setupWindow.show();
    });

    setupWindow.on('closed', () => {
      setupWindow = null;
      resolve();
    });
  });
}

// IPC Handlers

ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Select File',
    properties: ['openFile'],
    filters: options.filters || [{ name: 'All Files', extensions: ['*'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-directory', async (event, title) => {
  const result = await dialog.showOpenDialog(setupWindow || mainWindow, {
    title: title || 'Select Directory',
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Save File',
    defaultPath: options.defaultPath || 'output.txt',
    filters: options.filters || [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
  if (!filePath) {
    // Open output folder if no specific file
    await shell.openPath(userSettings.outputDir);
  } else {
    shell.showItemInFolder(filePath);
  }
});

ipcMain.handle('get-settings', async () => {
  return userSettings;
});

ipcMain.handle('compress-file', async (event, args) => {
  try {
    const result = await executePython('compress', [args.inputPath, args.outputPath]);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('decompress-file', async (event, args) => {
  try {
    const result = await executePython('decompress', [args.inputPath, args.outputPath]);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('create-temp-file', async (event, content) => {
  try {
    const tempDir = path.join(userSettings.inputDir, '.temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFileName = `pasted_${Date.now()}.txt`;
    const tempFilePath = path.join(tempDir, tempFileName);

    fs.writeFileSync(tempFilePath, content, 'utf8');

    return tempFilePath;
  } catch (error) {
    console.error('Failed to create temp file:', error);
    return null;
  }
});

ipcMain.handle('complete-setup', async (event, config) => {
  if (config.useDefault) {
    userSettings = getDefaultSettings(app.getPath('exe'));
  } else {
    userSettings = {
      inputDir: config.inputDir,
      outputDir: config.outputDir,
      firstRun: false
    };
  }

  // Create directories if they don't exist
  if (!fs.existsSync(userSettings.inputDir)) {
    fs.mkdirSync(userSettings.inputDir, { recursive: true });
  }
  if (!fs.existsSync(userSettings.outputDir)) {
    fs.mkdirSync(userSettings.outputDir, { recursive: true });
  }

  saveSettings(userSettings);

  if (setupWindow) {
    setupWindow.close();
  }
});

// App lifecycle
app.whenReady().then(async () => {
  // Check if first run
  if (isFirstRun()) {
    // Set default settings temporarily
    userSettings = getDefaultSettings(app.getPath('exe'));

    createMainWindow();
    await createSetupWindow();
  } else {
    userSettings = loadSettings();
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
