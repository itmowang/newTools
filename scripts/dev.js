#!/usr/bin/env node

/**
 * 开发启动脚本
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Toolbox Assistant in development mode...\n');

// 构建所有包
console.log('📦 Building packages...');
const build = spawn('pnpm', ['build'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(1);
  }

  console.log('\n✅ Build completed');
  console.log('🚀 Starting Electron...\n');

  // 启动 Electron - 使用 npx 确保能找到 electron
  const electron = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '../apps/desktop')
  });

  electron.on('close', (code) => {
    console.log(`\n👋 Electron exited with code ${code}`);
    process.exit(code);
  });
});
