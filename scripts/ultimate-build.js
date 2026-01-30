const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Ultimate Build Solution');
console.log('========================================\n');

const releasePath = path.join(__dirname, '..', 'apps', 'desktop', 'release');
const backupPath = path.join(__dirname, '..', 'apps', 'desktop', `release_old_${Date.now()}`);

// Step 1: Kill processes
console.log('[1/3] Killing processes...');
try {
  execSync('wmic process where "name=\'Toolbox Assistant.exe\' or name=\'electron.exe\'" delete', { stdio: 'ignore' });
} catch (e) {}
console.log('✓ Done\n');

// Step 2: Rename release directory (faster than delete)
console.log('[2/3] Renaming old release directory...');
if (fs.existsSync(releasePath)) {
  try {
    fs.renameSync(releasePath, backupPath);
    console.log(`✓ Renamed to: ${path.basename(backupPath)}\n`);
  } catch (e) {
    console.log(`✗ Cannot rename: ${e.message}`);
    console.log('File is locked. Please:');
    console.log('1. Close all File Explorer windows');
    console.log('2. Or restart your computer\n');
    process.exit(1);
  }
} else {
  console.log('✓ No old release directory\n');
}

// Step 3: Build immediately
console.log('[3/3] Building...\n');
console.log('Compiling...');
try {
  execSync('pnpm run build', { stdio: 'inherit' });
} catch (e) {
  console.error('\n✗ Compilation failed!');
  process.exit(1);
}

console.log('\nPackaging...');
const buildProcess = spawn('pnpm', ['run', 'dist'], {
  cwd: path.join(__dirname, '..', 'apps', 'desktop'),
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n========================================');
    console.log('✓ Build successful!');
    console.log('========================================\n');
    console.log('Installer:');
    console.log('  apps\\desktop\\release\\Toolbox Assistant Setup 1.0.0.exe\n');
    console.log('Portable:');
    console.log('  apps\\desktop\\release\\ToolboxAssistant-Portable.exe\n');
    console.log(`Old files backed up to: ${path.basename(backupPath)}\n`);
  } else {
    console.error('\n========================================');
    console.error('✗ Build failed!');
    console.error('========================================\n');
    process.exit(1);
  }
});
