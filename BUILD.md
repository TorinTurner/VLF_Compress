# VLF Compress - Build Instructions

This document provides detailed instructions for building VLF Compress as a portable Windows x64 application.

## Prerequisites

### Required Software

1. **Python 3.8+** (64-bit)
   - Download from: https://www.python.org/downloads/
   - **IMPORTANT**: Must be 64-bit Python for x64 builds
   - Ensure "Add Python to PATH" is checked during installation

2. **Node.js 16+**
   - Download from: https://nodejs.org/
   - Includes npm package manager

3. **Git** (optional, for cloning repository)
   - Download from: https://git-scm.com/

### System Requirements

- Windows 10/11 (64-bit)
- At least 4 GB RAM
- 2 GB free disk space

## Build Process

### Step 1: Install Node Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This installs:
- Electron
- electron-builder
- Other Node.js dependencies

### Step 2: Build Python Executable

Run the Python build script:

```bash
build-python.bat
```

This script will:
1. Verify Python installation (must be 64-bit)
2. Install Python dependencies (brotli, pyinstaller)
3. Build standalone Python executable using PyInstaller
4. Copy output to `python-dist/vlf_compress_core/`

**Output:**
```
python-dist/
└── vlf_compress_core/
    ├── vlf_compress_core.exe
    └── _internal/
        ├── python311.dll
        └── [other dependencies]
```

### Step 3: Build Electron Application

Build the Windows installer:

```bash
npm run dist-win-x64
```

This will:
1. Package the Electron application
2. Bundle the Python executable
3. Create an NSIS installer

**Output:**
```
dist/
└── VLF Compress Setup 1.0.0.exe
```

## Development Mode

To run the application in development mode without building:

```bash
npm start
```

**Note:** In development mode, the app uses system Python instead of the bundled executable.

## Build Output

### Production Build

The final installer will be located at:
```
dist/VLF Compress Setup 1.0.0.exe
```

**Installer Size:** ~50-100 MB (includes Python runtime and all dependencies)

### Installation Directory

By default, the application installs to:
```
C:\Users\<username>\AppData\Local\Programs\vlf-compress\
```

### User Data

User settings and output files are stored at:
```
C:\Users\<username>\AppData\Roaming\VLF Compress\
├── settings.json
├── input/
└── output/
```

## Architecture

### Application Structure

```
VLF Compress/
├── main.js              # Electron main process
├── preload.js           # IPC bridge
├── settings.js          # Settings management
├── package.json         # Node configuration
├── renderer/            # UI files
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── python/              # Python backend
│   ├── vlf_compress_core.py
│   ├── vlf_compress_core.spec
│   └── requirements.txt
├── build/               # Build resources
│   └── check-arch.py
└── python-dist/         # Built Python executable
    └── vlf_compress_core/
```

### Compression Pipeline

```
┌─────────────────┐
│   Input File    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Brotli Compress │ (quality=11, maximum compression)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Base32 Encode   │ (ASCII-safe encoding)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Output .txt    │
└─────────────────┘
```

### UI Modes

**Ashore Mode (Compress):**
- Select input file
- Choose output location
- Compress with statistics

**Afloat Mode (Decompress):**
- Select encoded file
- Choose output location
- Decompress with statistics

## Troubleshooting

### Python Build Issues

**Error: "Python is not installed or not in PATH"**
- Install Python from python.org
- Ensure "Add Python to PATH" was checked
- Restart terminal

**Error: "Python must be 64-bit for x64 builds"**
- Uninstall 32-bit Python
- Install 64-bit Python from python.org

**Error: "PyInstaller build failed"**
- Delete `python/dist` and `python/build` directories
- Run `build-python.bat` again

### Electron Build Issues

**Error: "Cannot find module 'electron'"**
- Run `npm install` again

**Error: "python-dist not found"**
- Build Python executable first with `build-python.bat`

### Runtime Issues

**Application won't start:**
- Check Windows Event Viewer for errors
- Try running as administrator
- Check antivirus isn't blocking

**Compression fails:**
- Check input file exists and is readable
- Ensure output directory is writable
- Check disk space

## Advanced Options

### Custom Icon

To use a custom icon:
1. Create `build/icon.ico` (256x256 PNG converted to ICO)
2. Rebuild with `npm run dist-win-x64`

### Compression Quality

To adjust Brotli compression quality:
1. Edit `python/vlf_compress_core.py`
2. Change `quality=11` in `brotli.compress()` call
3. Rebuild Python executable

### Installer Options

Edit `package.json` under `build.nsis` to customize:
- `oneClick`: Single-click installation
- `perMachine`: Install for all users
- `allowToChangeInstallationDirectory`: Custom install path

## Testing

### Manual Testing

1. Build application
2. Install from `dist/VLF Compress Setup 1.0.0.exe`
3. Test compression:
   - Create a test file
   - Compress in Ashore mode
   - Verify output file
4. Test decompression:
   - Use compressed file
   - Decompress in Afloat mode
   - Verify output matches original

### Python CLI Testing

Test Python executable directly:

```bash
cd python-dist/vlf_compress_core
vlf_compress_core.exe compress input.txt output.txt
vlf_compress_core.exe decompress output.txt restored.txt
```

## Distribution

### Sharing the Installer

The installer is fully portable and includes:
- Electron runtime
- Python interpreter
- All dependencies

Users only need:
- Windows 10/11 (64-bit)
- No additional software

### Version Updates

To release a new version:
1. Update `version` in `package.json`
2. Rebuild: `npm run dist-win-x64`
3. Distribute new installer

## Support

For issues or questions:
- Check GitHub Issues: https://github.com/TorinTurner/VLF_Compress/issues
- Review error logs in `%APPDATA%\VLF Compress\logs\`

## License

MIT License - See LICENSE file for details
