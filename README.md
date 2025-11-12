# VLF Compress

![Build Status](https://github.com/TorinTurner/VLF_Compress/workflows/Build%20Windows%20x64/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A portable Windows x64 application for file compression and decompression using Brotli compression and Base32 encoding, designed for Very Low Frequency (VLF) communication.

## Features

- **High Compression Ratio**: Uses Brotli compression (quality 11) for maximum file size reduction
- **ASCII-Safe Encoding**: Base32 encoding ensures compatibility with text-based transmission
- **Dual Mode Operation**:
  - **Ashore Mode**: Compress files for transmission
  - **Afloat Mode**: Decompress received files
- **Compression Statistics**: Real-time statistics showing compression ratio, space saved, and character count
- **Portable**: Single installer includes all dependencies (Python runtime, Electron, etc.)
- **User-Friendly UI**: Modern dark theme interface with drag-and-drop support

## Screenshots

### Ashore Mode (Compress)
Compress files with detailed statistics:
- Original size
- Compressed size
- Encoded size
- Compression ratio
- Space saved percentage
- Character count

### Afloat Mode (Decompress)
Decompress received files back to original format with statistics.

## Installation

### Download

**Latest Release:**
- Download from [GitHub Releases](https://github.com/TorinTurner/VLF_Compress/releases/latest)
- **VLF Compress Setup x.x.x.exe** (~50-100 MB)

**Development Builds:**
- Automated builds are available from the [Actions](https://github.com/TorinTurner/VLF_Compress/actions) tab
- Built automatically on every push to `main` and feature branches
- Download artifacts for testing pre-release versions

### Install

1. Run the installer
2. Choose installation directory (or use default)
3. Create desktop shortcut (optional)
4. Launch application

**No additional software required** - all dependencies are bundled.

## Usage

### Compressing Files (Ashore Mode)

1. Click **▲ Ashore** tab
2. Select input file (drag-and-drop or browse)
3. Choose output location
4. Click **Compress File**
5. View compression statistics
6. Open output folder

### Decompressing Files (Afloat Mode)

1. Click **▼ Afloat** tab
2. Select encoded file (drag-and-drop or browse)
3. Choose output location
4. Click **Decompress File**
5. View decompression statistics
6. Open output folder

## Compression Algorithm

VLF Compress uses a two-stage compression pipeline:

```
Input → Brotli Compression → Base32 Encoding → Output
```

1. **Brotli Compression**:
   - Quality level: 11 (maximum)
   - Excellent compression ratio for text and binary files
   - Industry-standard compression algorithm

2. **Base32 Encoding**:
   - Converts binary to ASCII-safe characters
   - Compatible with text-based transmission systems
   - Handles VLF transmission symbol incompatibilities

### Compression Ratios

Typical compression ratios vary by file type:
- Text files: 3:1 to 10:1
- Log files: 5:1 to 15:1
- Binary files: 2:1 to 5:1

## Building from Source

See [BUILD.md](BUILD.md) for detailed build instructions.

### Quick Start

```bash
# Install Node dependencies
npm install

# Build Python executable
build-python.bat

# Build Windows installer
npm run dist-win-x64
```

## Technology Stack

- **Frontend**: Electron, HTML5, CSS3, JavaScript
- **Backend**: Python 3.11
- **Compression**: Brotli (Google's compression algorithm)
- **Encoding**: Base32 (RFC 4648)
- **Packaging**: PyInstaller, electron-builder

## File Locations

### Application

```
C:\Users\<username>\AppData\Local\Programs\vlf-compress\
```

### User Data

```
C:\Users\<username>\AppData\Roaming\VLF Compress\
├── settings.json  # User preferences
├── input/         # Default input folder
└── output/        # Default output folder
```

## Requirements

### Runtime

- Windows 10/11 (64-bit)
- No additional software needed

### Development

- Python 3.8+ (64-bit)
- Node.js 16+
- Windows 10/11 SDK (for building)

## Command Line Interface

The Python core can also be used from command line:

```bash
# Compress
vlf_compress_core.exe compress input.txt output.txt

# Decompress
vlf_compress_core.exe decompress encoded.txt restored.txt

# JSON output
vlf_compress_core.exe compress input.txt output.txt --json
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  (IPC, Python Bridge, File Dialogs)     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Electron Renderer               │
│  (UI, User Interactions, Statistics)    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Python Backend (PyInstaller)       │
│  (Brotli Compression, Base32 Encoding)  │
└─────────────────────────────────────────┘
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Use Cases

- **Maritime Communication**: Compress files for VLF transmission to ships at sea
- **Low-Bandwidth Networks**: Reduce file sizes for slow connections
- **Text-Based Transmission**: ASCII-safe encoding for legacy systems
- **Data Archival**: High compression for long-term storage

## Troubleshooting

### Application won't start
- Check Windows Event Viewer
- Try running as administrator
- Disable antivirus temporarily

### Compression fails
- Verify input file is readable
- Check output directory is writable
- Ensure sufficient disk space

### Poor compression ratio
- Some files (e.g., already compressed) won't compress well
- Try different file types
- Check file isn't corrupted

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Torin Turner**

## Acknowledgments

- Based on ARGUS2.0 architecture
- Uses Google's Brotli compression algorithm
- Built with Electron and Python

## Version History

### 1.0.0 (2025-11-12)
- Initial release
- Ashore/Afloat dual mode operation
- Brotli + Base32 compression pipeline
- Compression statistics
- Portable Windows x64 build

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/TorinTurner/VLF_Compress/issues
- Email: support@example.com

---

**VLF Compress** - Portable File Compression for VLF Communication
