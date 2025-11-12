/**
 * VLF Compress - Renderer Process
 * UI logic for file compression and decompression
 */

// State management
const state = {
    ashore: {
        inputFile: null,
        outputPath: null
    },
    afloat: {
        inputFile: null,
        outputPath: null
    },
    currentMode: 'ashore',
    settings: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings
    state.settings = await window.vlf.getSettings();

    // Setup mode toggle
    setupModeToggle();

    // Setup ashore (compress) mode
    setupAshoreMode();

    // Setup afloat (decompress) mode
    setupAfloatMode();

    // Setup credits modal
    setupCreditsModal();
});

// Mode toggle functionality
function setupModeToggle() {
    const ashoreBtn = document.getElementById('ashore-btn');
    const afloatBtn = document.getElementById('afloat-btn');
    const ashoreMode = document.getElementById('ashore-mode');
    const afloatMode = document.getElementById('afloat-mode');

    ashoreBtn.addEventListener('click', () => {
        if (state.currentMode !== 'ashore') {
            state.currentMode = 'ashore';
            ashoreBtn.classList.add('active');
            afloatBtn.classList.remove('active');
            ashoreMode.classList.add('active');
            afloatMode.classList.remove('active');
        }
    });

    afloatBtn.addEventListener('click', () => {
        if (state.currentMode !== 'afloat') {
            state.currentMode = 'afloat';
            afloatBtn.classList.add('active');
            ashoreBtn.classList.remove('active');
            afloatMode.classList.add('active');
            ashoreMode.classList.remove('active');
        }
    });
}

// Setup Ashore (Compress) Mode
function setupAshoreMode() {
    const fileSelect = document.getElementById('ashore-file-select');
    const browseBtn = document.getElementById('ashore-browse-btn');
    const clearBtn = document.getElementById('ashore-clear-file');
    const outputBrowse = document.getElementById('ashore-output-browse');
    const compressBtn = document.getElementById('ashore-compress-btn');
    const openFolderBtn = document.getElementById('ashore-open-folder');

    // File selection
    browseBtn.addEventListener('click', async () => {
        const filePath = await window.vlf.selectFile({
            title: 'Select File to Compress',
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Text Files', extensions: ['txt', 'log', 'md'] }
            ]
        });

        if (filePath) {
            setAshoreFile(filePath);
        }
    });

    // Drag and drop
    fileSelect.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileSelect.classList.add('drag-over');
    });

    fileSelect.addEventListener('dragleave', () => {
        fileSelect.classList.remove('drag-over');
    });

    fileSelect.addEventListener('drop', (e) => {
        e.preventDefault();
        fileSelect.classList.remove('drag-over');

        if (e.dataTransfer.files.length > 0) {
            setAshoreFile(e.dataTransfer.files[0].path);
        }
    });

    // Clear file
    clearBtn.addEventListener('click', () => {
        clearAshoreFile();
    });

    // Output location
    outputBrowse.addEventListener('click', async () => {
        const outputPath = await window.vlf.saveDialog({
            title: 'Save Compressed File',
            defaultPath: 'compressed.txt',
            filters: [
                { name: 'Text Files', extensions: ['txt'] }
            ]
        });

        if (outputPath) {
            state.ashore.outputPath = outputPath;
            document.getElementById('ashore-output-path').value = outputPath;
            updateAshoreCompressButton();
        }
    });

    // Compress button
    compressBtn.addEventListener('click', async () => {
        await compressFile();
    });

    // Open folder button
    openFolderBtn.addEventListener('click', async () => {
        await window.vlf.showItemInFolder(state.ashore.outputPath);
    });
}

// Setup Afloat (Decompress) Mode
function setupAfloatMode() {
    const fileSelect = document.getElementById('afloat-file-select');
    const browseBtn = document.getElementById('afloat-browse-btn');
    const clearBtn = document.getElementById('afloat-clear-file');
    const outputBrowse = document.getElementById('afloat-output-browse');
    const decompressBtn = document.getElementById('afloat-decompress-btn');
    const openFolderBtn = document.getElementById('afloat-open-folder');

    // File selection
    browseBtn.addEventListener('click', async () => {
        const filePath = await window.vlf.selectFile({
            title: 'Select Encoded File to Decompress',
            filters: [
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (filePath) {
            setAfloatFile(filePath);
        }
    });

    // Drag and drop
    fileSelect.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileSelect.classList.add('drag-over');
    });

    fileSelect.addEventListener('dragleave', () => {
        fileSelect.classList.remove('drag-over');
    });

    fileSelect.addEventListener('drop', (e) => {
        e.preventDefault();
        fileSelect.classList.remove('drag-over');

        if (e.dataTransfer.files.length > 0) {
            setAfloatFile(e.dataTransfer.files[0].path);
        }
    });

    // Clear file
    clearBtn.addEventListener('click', () => {
        clearAfloatFile();
    });

    // Output location
    outputBrowse.addEventListener('click', async () => {
        const outputPath = await window.vlf.saveDialog({
            title: 'Save Decompressed File',
            defaultPath: 'decompressed.txt',
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (outputPath) {
            state.afloat.outputPath = outputPath;
            document.getElementById('afloat-output-path').value = outputPath;
            updateAfloatDecompressButton();
        }
    });

    // Decompress button
    decompressBtn.addEventListener('click', async () => {
        await decompressFile();
    });

    // Open folder button
    openFolderBtn.addEventListener('click', async () => {
        await window.vlf.showItemInFolder(state.afloat.outputPath);
    });
}

// Ashore file management
function setAshoreFile(filePath) {
    state.ashore.inputFile = filePath;

    const fileName = filePath.split(/[\\/]/).pop();
    const fileInfo = document.getElementById('ashore-file-info');
    const fileSelect = document.querySelector('#ashore-file-select .file-select-content');

    document.getElementById('ashore-file-name').textContent = fileName;
    document.getElementById('ashore-file-size').textContent = '';

    fileSelect.style.display = 'none';
    fileInfo.style.display = 'flex';

    // Auto-suggest output path
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    state.ashore.outputPath = `${state.settings.outputDir}/${baseName}_compressed.txt`.replace(/\\/g, '/');
    document.getElementById('ashore-output-path').value = state.ashore.outputPath;

    // Hide previous results
    document.getElementById('ashore-results').style.display = 'none';

    updateAshoreCompressButton();
}

function clearAshoreFile() {
    state.ashore.inputFile = null;
    state.ashore.outputPath = null;

    const fileInfo = document.getElementById('ashore-file-info');
    const fileSelect = document.querySelector('#ashore-file-select .file-select-content');

    fileSelect.style.display = 'flex';
    fileInfo.style.display = 'none';

    document.getElementById('ashore-output-path').value = '';
    document.getElementById('ashore-results').style.display = 'none';

    updateAshoreCompressButton();
}

function updateAshoreCompressButton() {
    const compressBtn = document.getElementById('ashore-compress-btn');
    compressBtn.disabled = !(state.ashore.inputFile && state.ashore.outputPath);
}

// Afloat file management
function setAfloatFile(filePath) {
    state.afloat.inputFile = filePath;

    const fileName = filePath.split(/[\\/]/).pop();
    const fileInfo = document.getElementById('afloat-file-info');
    const fileSelect = document.querySelector('#afloat-file-select .file-select-content');

    document.getElementById('afloat-file-name').textContent = fileName;
    document.getElementById('afloat-file-size').textContent = '';

    fileSelect.style.display = 'none';
    fileInfo.style.display = 'flex';

    // Auto-suggest output path
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    state.afloat.outputPath = `${state.settings.outputDir}/${baseName}_decompressed.txt`.replace(/\\/g, '/');
    document.getElementById('afloat-output-path').value = state.afloat.outputPath;

    // Hide previous results
    document.getElementById('afloat-results').style.display = 'none';

    updateAfloatDecompressButton();
}

function clearAfloatFile() {
    state.afloat.inputFile = null;
    state.afloat.outputPath = null;

    const fileInfo = document.getElementById('afloat-file-info');
    const fileSelect = document.querySelector('#afloat-file-select .file-select-content');

    fileSelect.style.display = 'flex';
    fileInfo.style.display = 'none';

    document.getElementById('afloat-output-path').value = '';
    document.getElementById('afloat-results').style.display = 'none';

    updateAfloatDecompressButton();
}

function updateAfloatDecompressButton() {
    const decompressBtn = document.getElementById('afloat-decompress-btn');
    decompressBtn.disabled = !(state.afloat.inputFile && state.afloat.outputPath);
}

// Compress file
async function compressFile() {
    const progressSection = document.getElementById('ashore-progress');
    const resultsSection = document.getElementById('ashore-results');
    const compressBtn = document.getElementById('ashore-compress-btn');

    // Show progress
    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    compressBtn.disabled = true;

    try {
        const result = await window.vlf.compressFile({
            inputPath: state.ashore.inputFile,
            outputPath: state.ashore.outputPath
        });

        if (result.success) {
            // Display results
            document.getElementById('ashore-stat-original').textContent = formatBytes(result.original_size);
            document.getElementById('ashore-stat-compressed').textContent = formatBytes(result.compressed_size);
            document.getElementById('ashore-stat-encoded').textContent = formatBytes(result.encoded_size);
            document.getElementById('ashore-stat-ratio').textContent = `${result.compression_ratio}:1`;
            document.getElementById('ashore-stat-saved').textContent = `${result.space_saved_percent}%`;
            document.getElementById('ashore-stat-chars').textContent = result.character_count.toLocaleString();
            document.getElementById('ashore-output-file').textContent = result.output_file;

            progressSection.style.display = 'none';
            resultsSection.style.display = 'block';
        } else {
            throw new Error(result.error || 'Compression failed');
        }
    } catch (error) {
        alert(`Compression Error: ${error.message}`);
        progressSection.style.display = 'none';
    } finally {
        compressBtn.disabled = false;
    }
}

// Decompress file
async function decompressFile() {
    const progressSection = document.getElementById('afloat-progress');
    const resultsSection = document.getElementById('afloat-results');
    const decompressBtn = document.getElementById('afloat-decompress-btn');

    // Show progress
    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    decompressBtn.disabled = true;

    try {
        const result = await window.vlf.decompressFile({
            inputPath: state.afloat.inputFile,
            outputPath: state.afloat.outputPath
        });

        if (result.success) {
            // Display results
            document.getElementById('afloat-stat-encoded').textContent = formatBytes(result.encoded_size);
            document.getElementById('afloat-stat-compressed').textContent = formatBytes(result.compressed_size);
            document.getElementById('afloat-stat-decompressed').textContent = formatBytes(result.decompressed_size);
            document.getElementById('afloat-stat-ratio').textContent = `${result.compression_ratio}:1`;
            document.getElementById('afloat-stat-chars').textContent = result.character_count.toLocaleString();
            document.getElementById('afloat-output-file').textContent = result.output_file;

            progressSection.style.display = 'none';
            resultsSection.style.display = 'block';
        } else {
            throw new Error(result.error || 'Decompression failed');
        }
    } catch (error) {
        alert(`Decompression Error: ${error.message}`);
        progressSection.style.display = 'none';
    } finally {
        decompressBtn.disabled = false;
    }
}

// Utility: Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Credits modal
function setupCreditsModal() {
    const creditsBtn = document.getElementById('credits-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeCredits = document.getElementById('close-credits');

    creditsBtn.addEventListener('click', () => {
        creditsModal.classList.add('show');
    });

    closeCredits.addEventListener('click', () => {
        creditsModal.classList.remove('show');
    });

    // Close modal when clicking outside
    creditsModal.addEventListener('click', (e) => {
        if (e.target === creditsModal) {
            creditsModal.classList.remove('show');
        }
    });
}
