const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Force Clean and Build');
console.log('========================================\n');

// Step 1: Kill processes
console.log('[1/5] Stopping all related processes...');
try {
  execSync('wmic process where "name=\'Toolbox Assistant.exe\' or name=\'electron.exe\'" delete', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors if no processes found
}
console.log('✓ Processes stopped\n');

// Step 2: Wait
console.log('[2/5] Waiting for file handles to release...');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function wait() {
  await sleep(3000);
}
wait().then(() => {
  console.log('✓ Wait complete\n');
  
  // Step 3: Delete release directory
  console.log('[3/5] Force deleting release directory...');
  const releasePath = path.join(__dirname, '..', 'apps', 'desktop', 'release');
  
  function deleteDirectoryRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
      try {
        // Try to remove read-only attributes
        fs.readdirSync(dirPath).forEach((file) => {
          const curPath = path.join(dirPath, file);
          try {
            const stats = fs.lstatSync(curPath);
            if (stats.isDirectory()) {
              deleteDirectoryRecursive(curPath);
            } else {
              // Remove read-only attribute
              try {
                fs.chmodSync(curPath, 0o666);
              } catch (e) {}
              fs.unlinkSync(curPath);
            }
          } catch (e) {
            console.log(`  Warning: Cannot delete ${curPath}: ${e.message}`);
          }
        });
        fs.rmdirSync(dirPath);
        console.log('✓ Release directory deleted\n');
        return true;
      } catch (e) {
        console.log(`  Warning: ${e.message}`);
        // Try to rename instead
        const backupPath = `${releasePath}_backup_${Date.now()}`;
        try {
          fs.renameSync(releasePath, backupPath);
          console.log(`✓ Renamed to: ${path.basename(backupPath)}\n`);
          return true;
        } catch (e2) {
          console.error('✗ Error: Cannot handle release directory');
          console.error('  Please close all Toolbox Assistant windows and try again\n');
          return false;
        }
      }
    } else {
      console.log('✓ Release directory does not exist, skipping\n');
      return true;
    }
  }
  
  if (!deleteDirectoryRecursive(releasePath)) {
    process.exit(1);
  }
  
  // Step 4: Build
  console.log('[4/5] Compiling code...');
  try {
    execSync('pnpm run build', { stdio: 'inherit' });
    console.log('✓ Compilation complete\n');
  } catch (e) {
    console.error('✗ Compilation failed!');
    process.exit(1);
  }
  
  // Step 5: Package
  console.log('[5/5] Starting packaging...');
  try {
    execSync('pnpm run dist', { cwd: path.join(__dirname, '..', 'apps', 'desktop'), stdio: 'inherit' });
    console.log('\n========================================');
    console.log('✓ Build successful!');
    console.log('========================================\n');
    console.log('Installer location:');
    console.log('  apps\\desktop\\release\\Toolbox Assistant Setup 1.0.0.exe\n');
    console.log('Portable version:');
    console.log('  apps\\desktop\\release\\ToolboxAssistant-Portable.exe\n');
  } catch (e) {
    console.error('\n========================================');
    console.error('✗ Build failed!');
    console.error('========================================\n');
    console.error('Please check error messages above');
    process.exit(1);
  }
});
