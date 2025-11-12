@echo off
REM Build script for VLF Compress Python executable (Windows x64)
REM This script creates a standalone Python executable using PyInstaller

echo ========================================
echo VLF Compress - Python Build Script
echo ========================================
echo.

REM Check Python installation
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    exit /b 1
)

python --version
echo.

REM Check Python architecture (must be 64-bit for x64 build)
echo [2/5] Checking Python architecture...
python build\check-arch.py
if errorlevel 1 (
    echo ERROR: Python must be 64-bit for x64 builds
    echo Please install 64-bit Python from https://www.python.org/
    exit /b 1
)
echo.

REM Install dependencies
echo [3/5] Installing Python dependencies...
cd python
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    cd ..
    exit /b 1
)
cd ..
echo.

REM Build Python executable with PyInstaller
echo [4/5] Building Python executable with PyInstaller...
cd python
python -m PyInstaller vlf_compress_core.spec --clean
if errorlevel 1 (
    echo ERROR: PyInstaller build failed
    cd ..
    exit /b 1
)
cd ..
echo.

REM Copy to python-dist directory
echo [5/5] Copying executable to python-dist...
if exist python-dist\vlf_compress_core (
    rmdir /s /q python-dist\vlf_compress_core
)
mkdir python-dist 2>nul
xcopy python\dist\vlf_compress_core python-dist\vlf_compress_core\ /E /I /Y
if errorlevel 1 (
    echo ERROR: Failed to copy files
    exit /b 1
)
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Python executable location:
echo   python-dist\vlf_compress_core\vlf_compress_core.exe
echo.
echo Next steps:
echo   1. Run 'npm install' to install Node dependencies
echo   2. Run 'npm run dist-win-x64' to build the Electron installer
echo.
