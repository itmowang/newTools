const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

let electronProcess = null;
let isRestarting = false;

// 启动 Electron
function startElectron() {
  if (electronProcess) {
    return;
  }

  console.log('🚀 Starting Electron...');
  electronProcess = spawn('pnpm', ['exec', 'electron', '.'], {
    cwd: path.join(__dirname, '..', 'apps', 'desktop'),
    stdio: 'inherit',
    shell: true
  });

  electronProcess.on('close', (code) => {
    electronProcess = null;
    if (!isRestarting) {
      console.log('Electron exited with code', code);
    }
  });
}

// 重启 Electron
async function restartElectron() {
  if (isRestarting) return;
  isRestarting = true;

  console.log('🔄 Restarting Electron...');

  if (electronProcess) {
    electronProcess.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  isRestarting = false;
  startElectron();
}

// 编译 TypeScript
function buildAll() {
  return new Promise((resolve, reject) => {
    console.log('📦 Building packages...');
    const build = spawn('pnpm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });

    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build completed');
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

// 初始构建和启动
(async () => {
  console.log('🔥 Hot reload development mode');
  console.log('Watching for changes...\n');

  await buildAll();
  startElectron();

  // 监听文件变化
  const watcher = chokidar.watch([
    'apps/desktop/src/**/*.ts',
    'packages/*/src/**/*.ts'
  ], {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  let buildTimeout = null;

  watcher.on('change', async (filePath) => {
    console.log(`\n📝 File changed: ${filePath}`);

    // 防抖：等待 500ms 后再构建
    if (buildTimeout) {
      clearTimeout(buildTimeout);
    }

    buildTimeout = setTimeout(async () => {
      try {
        await buildAll();
        await restartElectron();
      } catch (error) {
        console.error('❌ Build error:', error.message);
      }
    }, 500);
  });

  console.log('👀 Watching for file changes...');
})();
