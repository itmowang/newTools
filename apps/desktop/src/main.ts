import { app, BrowserWindow } from 'electron';
import { PluginManager, TrayManager, ShortcutManager, FloatingToolbar } from '@toolbox/core';
import { PortManagerModule } from '@toolbox/port-manager';
import { ColorPickerModule } from '@toolbox/color-picker';
import { AutoUpdater } from './AutoUpdater';

/**
 * 主应用类
 */
class ToolboxApp {
  private pluginManager: PluginManager;
  private trayManager: TrayManager;
  private shortcutManager: ShortcutManager;
  private floatingToolbar: FloatingToolbar;
  private autoUpdater: AutoUpdater;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.pluginManager = new PluginManager();
    this.trayManager = new TrayManager(this.pluginManager);
    this.shortcutManager = new ShortcutManager(this.pluginManager);
    this.floatingToolbar = new FloatingToolbar(this.pluginManager);
    this.autoUpdater = new AutoUpdater();

    this.setupEventListeners();
  }

  /**
   * 初始化应用
   */
  async initialize(): Promise<void> {
    // 注册模块
    await this.registerModules();

    // 创建托盘
    this.trayManager.createTray();

    // 创建浮动工具栏
    this.floatingToolbar.createToolbar();

    // 创建主窗口
    this.createMainWindow();

    // 设置自动更新
    if (this.mainWindow) {
      this.autoUpdater.setMainWindow(this.mainWindow);
    }

    // 启动定期检查更新
    this.autoUpdater.startPeriodicCheck();

    console.log('✅ Toolbox Assistant started');
  }

  /**
   * 注册所有模块
   */
  private async registerModules(): Promise<void> {
    const portManager = new PortManagerModule();
    const colorPicker = new ColorPickerModule();

    await this.pluginManager.registerModule(portManager);
    await this.pluginManager.registerModule(colorPicker);
  }

  /**
   * 创建主窗口
   */
  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      title: 'Toolbox Assistant',
      frame: false, // 隐藏系统标题栏
      transparent: false,
      backgroundColor: '#667eea',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // 加载主界面
    const html = this.generateMainWindowHTML();
    this.mainWindow.loadURL(`data:text/html,${encodeURIComponent(html)}`);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 隐藏窗口而不是关闭
    this.mainWindow.on('close', (event) => {
      if (!(app as any).isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });
  }

  /**
   * 生成主窗口 HTML
   */
  private generateMainWindowHTML(): string {
    const modules = this.pluginManager.getAllModules();
    const moduleCards = modules.map(m => `
      <div class="module-card" onclick="window.electronAPI.openModule('${m.metadata.id}')">
        <div class="module-icon">${this.getModuleIcon(m.metadata.id)}</div>
        <div class="module-content">
          <h3 class="module-title">${m.metadata.name}</h3>
          <p class="module-description">${m.metadata.description || '暂无描述'}</p>
        </div>
        <div class="module-action">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Toolbox Assistant</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #111827;
              overflow: hidden;
              height: 100vh;
            }

            /* 自定义标题栏 */
            .titlebar {
              height: 40px;
              background: rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 16px;
              -webkit-app-region: drag;
              backdrop-filter: blur(10px);
            }

            .titlebar-title {
              color: white;
              font-size: 14px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .titlebar-controls {
              display: flex;
              gap: 8px;
              -webkit-app-region: no-drag;
            }

            .titlebar-button {
              width: 32px;
              height: 32px;
              border: none;
              background: rgba(255, 255, 255, 0.1);
              color: white;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
              font-size: 16px;
            }

            .titlebar-button:hover {
              background: rgba(255, 255, 255, 0.2);
            }

            .titlebar-button.close:hover {
              background: #EF4444;
            }

            .container {
              height: calc(100vh - 40px);
              display: flex;
              flex-direction: column;
              padding: 40px;
            }

            .header {
              text-align: center;
              margin-bottom: 40px;
            }

            .logo {
              font-size: 64px;
              margin-bottom: 16px;
              animation: float 3s ease-in-out infinite;
            }

            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }

            .title {
              font-size: 36px;
              font-weight: 700;
              color: white;
              margin-bottom: 8px;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }

            .subtitle {
              font-size: 16px;
              color: rgba(255, 255, 255, 0.9);
              font-weight: 500;
            }

            .modules-container {
              flex: 1;
              overflow-y: auto;
              padding: 0 20px;
            }

            .modules-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
              gap: 24px;
              max-width: 1200px;
              margin: 0 auto;
            }

            .module-card {
              background: white;
              border-radius: 16px;
              padding: 24px;
              display: flex;
              align-items: center;
              gap: 20px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .module-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            }

            .module-icon {
              font-size: 48px;
              width: 72px;
              height: 72px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              flex-shrink: 0;
            }

            .module-content {
              flex: 1;
            }

            .module-title {
              font-size: 20px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 8px;
            }

            .module-description {
              font-size: 14px;
              color: #6B7280;
              line-height: 1.5;
            }

            .module-action {
              color: #667eea;
              flex-shrink: 0;
              transition: transform 0.2s;
            }

            .module-card:hover .module-action {
              transform: translateX(4px);
            }

            .footer {
              text-align: center;
              padding: 20px;
              color: rgba(255, 255, 255, 0.8);
              font-size: 14px;
            }

            .shortcuts {
              display: flex;
              justify-content: center;
              gap: 24px;
              margin-top: 12px;
            }

            .shortcut {
              display: flex;
              align-items: center;
              gap: 8px;
              background: rgba(255, 255, 255, 0.1);
              padding: 8px 16px;
              border-radius: 8px;
              backdrop-filter: blur(10px);
            }

            .shortcut-key {
              background: rgba(255, 255, 255, 0.2);
              padding: 4px 8px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              font-weight: 600;
            }

            /* 滚动条样式 */
            .modules-container::-webkit-scrollbar {
              width: 8px;
            }

            .modules-container::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }

            .modules-container::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 4px;
            }

            .modules-container::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
          </style>
        </head>
        <body>
          <!-- 自定义标题栏 -->
          <div class="titlebar">
            <div class="titlebar-title">
              <span>🧰</span>
              <span>Toolbox Assistant</span>
            </div>
            <div class="titlebar-controls">
              <button class="titlebar-button minimize" onclick="window.electronAPI.minimize()" title="最小化">
                <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
                  <rect width="12" height="2" rx="1"/>
                </svg>
              </button>
              <button class="titlebar-button close" onclick="window.electronAPI.close()" title="关闭">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 1L11 11M11 1L1 11"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="container">
            <div class="header">
              <div class="logo">🧰</div>
              <h1 class="title">Toolbox Assistant</h1>
              <p class="subtitle">Windows 桌面工具箱 - 选择一个工具开始使用</p>
            </div>

            <div class="modules-container">
              <div class="modules-grid">
                ${moduleCards}
              </div>
            </div>

            <div class="footer">
              <div>使用快捷键快速启动工具</div>
              <div class="shortcuts">
                <div class="shortcut">
                  <span class="shortcut-key">Ctrl+Shift+P</span>
                  <span>端口管理器</span>
                </div>
                <div class="shortcut">
                  <span class="shortcut-key">Ctrl+Shift+C</span>
                  <span>取色器</span>
                </div>
              </div>
            </div>
          </div>

          <script>
            const { ipcRenderer } = require('electron');
            window.electronAPI = {
              openModule: (id) => {
                console.log('Opening module:', id);
                ipcRenderer.send('open-module', id);
              },
              minimize: () => {
                ipcRenderer.send('window-minimize');
              },
              close: () => {
                ipcRenderer.send('window-close');
              }
            };
          </script>
        </body>
      </html>
    `;
  }

  /**
   * 获取模块图标
   */
  private getModuleIcon(moduleId: string): string {
    const icons: Record<string, string> = {
      'port-manager': '🔌',
      'color-picker': '🎨'
    };
    return icons[moduleId] || '🔧';
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听打开主窗口事件
    this.pluginManager.on('open-main-window', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      } else {
        this.createMainWindow();
      }
    });

    // 监听检查更新事件
    this.pluginManager.on('check-for-updates', () => {
      this.autoUpdater.manualCheckForUpdates();
    });

    // 监听打开模块事件（从主窗口触发）
    const { ipcMain } = require('electron');
    ipcMain.on('open-module', (event: any, moduleId: string) => {
      console.log(`📦 Opening module: ${moduleId}`);
      const module = this.pluginManager.getModule(moduleId);
      if (module && module.openWindow) {
        module.openWindow();
      } else {
        console.error(`❌ Module ${moduleId} not found or has no openWindow method`);
      }
    });

    // 监听窗口控制事件
    ipcMain.on('window-minimize', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.minimize();
      }
    });

    ipcMain.on('window-close', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.hide();
      }
    });
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    this.autoUpdater.stopPeriodicCheck();
    this.shortcutManager.unregisterAll();
    this.trayManager.destroy();
    this.floatingToolbar.destroy();
    await this.pluginManager.destroyAll();
  }
}

// Electron 应用生命周期
let toolboxApp: ToolboxApp | null = null;

app.whenReady().then(async () => {
  toolboxApp = new ToolboxApp();
  await toolboxApp.initialize();
});

app.on('window-all-closed', () => {
  // Prevent default behavior - keep app running
});

app.on('before-quit', () => {
  (app as any).isQuitting = true;
});

app.on('will-quit', async () => {
  if (toolboxApp) {
    await toolboxApp.cleanup();
  }
});
