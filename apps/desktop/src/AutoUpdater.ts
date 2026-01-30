import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';

/**
 * 自动更新管理器
 */
export class AutoUpdater {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupAutoUpdater();
  }

  /**
   * 设置主窗口引用
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * 配置自动更新
   */
  private setupAutoUpdater(): void {
    // 配置更新服务器
    autoUpdater.autoDownload = false; // 不自动下载，先询问用户
    autoUpdater.autoInstallOnAppQuit = true; // 退出时自动安装

    // 检查更新
    autoUpdater.on('checking-for-update', () => {
      console.log('🔍 Checking for updates...');
    });

    // 发现新版本
    autoUpdater.on('update-available', (info) => {
      console.log('✨ Update available:', info.version);
      
      dialog.showMessageBox({
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}`,
        detail: '是否立即下载更新？',
        buttons: ['立即下载', '稍后提醒'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    // 没有新版本
    autoUpdater.on('update-not-available', (info) => {
      console.log('✅ App is up to date:', info.version);
    });

    // 下载进度
    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      console.log(`📥 Downloading: ${percent}%`);
      
      // 可以在这里更新 UI 显示下载进度
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setProgressBar(progressObj.percent / 100);
      }
    });

    // 下载完成
    autoUpdater.on('update-downloaded', (info) => {
      console.log('✅ Update downloaded:', info.version);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setProgressBar(-1); // 清除进度条
      }

      dialog.showMessageBox({
        type: 'info',
        title: '更新已下载',
        message: `新版本 ${info.version} 已下载完成`,
        detail: '应用将在退出后自动安装更新。是否立即重启安装？',
        buttons: ['立即重启', '稍后重启'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });

    // 更新错误
    autoUpdater.on('error', (error) => {
      console.error('❌ Update error:', error);
      
      dialog.showMessageBox({
        type: 'error',
        title: '更新失败',
        message: '检查更新时出错',
        detail: error.message,
        buttons: ['确定']
      });
    });
  }

  /**
   * 检查更新
   */
  checkForUpdates(): void {
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Checking for updates...');
      autoUpdater.checkForUpdates();
    } else {
      console.log('⚠️ Auto-update is disabled in development mode');
    }
  }

  /**
   * 启动定期检查更新（每小时检查一次）
   */
  startPeriodicCheck(): void {
    // 启动时检查一次
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000); // 启动 5 秒后检查

    // 每小时检查一次
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, 60 * 60 * 1000); // 1 小时
  }

  /**
   * 停止定期检查
   */
  stopPeriodicCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  /**
   * 手动检查更新
   */
  manualCheckForUpdates(): void {
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.checkForUpdates();
    } else {
      dialog.showMessageBox({
        type: 'info',
        title: '开发模式',
        message: '自动更新在开发模式下不可用',
        buttons: ['确定']
      });
    }
  }
}
