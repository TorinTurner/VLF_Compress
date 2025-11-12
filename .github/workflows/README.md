# GitHub Actions Workflows

This directory contains automated build workflows for VLF Compress.

## Workflows

### 1. Build Windows x64 (`build-windows-x64.yml`)

**Triggers:**
- Push to `main` branch
- Push to any `claude/**` branch
- Pull requests to `main`
- Manual dispatch

**Purpose:**
Automatically builds the Windows x64 installer on every push to validate the build process.

**Steps:**
1. Setup Python 3.11 (64-bit)
2. Verify Python architecture
3. Install Python dependencies
4. Build Python executable with PyInstaller
5. Setup Node.js
6. Install Node dependencies
7. Build Electron application
8. Upload installer as artifact

**Artifacts:**
- `VLF-Compress-Windows-x64-Installer` - The installer `.exe` file
- `VLF-Compress-Windows-x64-Unpacked` - Unpacked build files

**Usage:**
- Artifacts are available for 90 days after build
- Download from the Actions tab on GitHub
- Use for testing without creating a release

---

### 2. Release (`release.yml`)

**Triggers:**
- Push tags matching `v*.*.*` (e.g., `v1.0.0`, `v1.2.3`)
- Manual dispatch

**Purpose:**
Creates official GitHub releases with compiled installers when version tags are pushed.

**Steps:**
1. Build Windows x64 installer (same as build workflow)
2. Extract version from `package.json`
3. Create GitHub Release with:
   - Release notes
   - Installer file
   - Version information
4. Upload release artifacts

**Creating a Release:**

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Push with tags
git push --follow-tags

# Or manually create and push a tag
git tag v1.0.1
git push origin v1.0.1
```

**Release Assets:**
- `VLF Compress Setup x.x.x.exe` - Windows installer
- `latest.yml` - Auto-update configuration (if configured)

---

## Workflow Configuration

### Environment Variables

- `GH_TOKEN`: GitHub token for electron-builder (automatically provided)

### Secrets Required

No additional secrets required. The workflows use the default `GITHUB_TOKEN`.

### Runner Specifications

**Windows x64 builds:**
- Runner: `windows-latest` (Windows Server 2022)
- Python: 3.11 (64-bit)
- Node.js: 20.x

---

## Build Artifacts

### Accessing Artifacts

1. Go to the **Actions** tab in GitHub
2. Click on a workflow run
3. Scroll to **Artifacts** section
4. Download the desired artifact

### Artifact Retention

- Build artifacts: 90 days
- Release artifacts: Indefinite (attached to release)

---

## Troubleshooting

### Build Fails at Python Step

**Problem:** Python architecture check fails

**Solution:**
- Ensure `setup-python` is configured with `architecture: 'x64'`
- Check `build/check-arch.py` is present

### Build Fails at Electron Step

**Problem:** electron-builder fails

**Solution:**
- Check `package.json` configuration
- Ensure `python-dist/vlf_compress_core/` exists
- Verify all renderer files are present

### Release Not Created

**Problem:** Tag pushed but no release created

**Solution:**
- Check tag matches `v*.*.*` pattern
- Ensure `release.yml` workflow is on the tagged commit
- Check workflow run logs in Actions tab

---

## Local Testing

To test the build locally before pushing:

```bash
# Install dependencies
npm install

# Build Python
build-python.bat

# Build Electron (Windows)
npm run dist-win-x64
```

---

## Workflow Status Badges

Add to README.md:

```markdown
![Build Status](https://github.com/TorinTurner/VLF_Compress/workflows/Build%20Windows%20x64/badge.svg)
```

---

## Future Enhancements

Potential workflow improvements:

- [ ] macOS builds (`.dmg`)
- [ ] Linux builds (`.AppImage`, `.deb`, `.rpm`)
- [ ] Automated testing before builds
- [ ] Code signing for Windows installer
- [ ] Auto-update functionality
- [ ] Multi-platform releases in single workflow
- [ ] Checksum generation for releases
- [ ] Virus scanning of builds

---

For more information about GitHub Actions:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-builder CI Configuration](https://www.electron.build/configuration/configuration.html#ci)
