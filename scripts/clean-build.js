const { execSync } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('Clean Build (New Output Directory)');
console.log('========================================\n');

// Step 1: Kill processes
console.log('[1/4] Stopping all related processes...');
try {
  execSync('wmic process where "name=\'Toolbox Assistant.exe\' or name=\'electron.exe\'" delete', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors
}
console.log('✓ Processes stopped\n');

// Step 2: Build
console.log('[2/4] Compiling code...');
try {
  execSync('pnpm run build', { stdio: 'inherit' });
  console.log('✓ Compilation complete\n');
} catch (e) {
  console.error('✗ Compilation failed!');
  process.exit(1);
}

// Step 3: Package to new directory
console.log('[3/4] Packaging to new output directory...');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = `release_${timestamp}`;

try {
  execSync(`pnpm run dist -- --config.directories.output=${outputDir}`, {
    cwd: path.join(__dirname, '..', 'apps', 'desktop'),
    stdio: 'inherit'
  });
  console.log('\n✓ Packaging complete\n');
} catch (e) {
  console.error('\n✗ Packaging failed!');
  process.exit(1);
}

// Step 4: Show results
console.log('========================================');
console.log('✓ Build successful!');
console.log('========================================\n');
console.log('Output directory:');
console.log(`  apps\\desktop\\${outputDir}\n`);
console.log('Installer:');
console.log(`  apps\\desktop\\${outputDir}\\Toolbox Assistant Setup 1.0.0.exe\n`);
console.log('Portable:');
console.log(`  apps\\desktop\\${outputDir}\\ToolboxAssistant-Portable.exe\n`);
