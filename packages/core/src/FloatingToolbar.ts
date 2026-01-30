import { BrowserWindow, screen } from 'electron';
import { PluginManager } from './PluginManager';

/**
 * 浮动工具栏管理器
 */
export class FloatingToolbar {
  private window: BrowserWindow | null = null;
  private pluginManager: PluginManager;
  private isExpanded: boolean = false;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  /**
   * 创建浮动工具栏
   */
  createToolbar(): void {
    if (this.window) {
      return;
    }

    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    // 创建长方形浮动工具栏（收起状态）- 加长宽度
    this.window = new BrowserWindow({
      width: 280,
      height: 56,
      x: screenWidth - 300,
      y: screenHeight - 76,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.window.setIgnoreMouseEvents(false);
    this.window.loadURL(`data:text/html,${encodeURIComponent(this.generateHTML())}`);

    // 设置 IPC
    this.setupIPC();

    console.log('✅ Floating toolbar created');
  }

  /**
   * 设置 IPC 通信
   */
  private setupIPC(): void {
    const { ipcMain, app } = require('electron');

    // 切换展开/收起
    ipcMain.on('toolbar:toggle', () => {
      this.toggleToolbar();
    });

    // 打开模块
    ipcMain.on('toolbar:open-module', (_event: any, moduleId: string) => {
      const module = this.pluginManager.getModule(moduleId);
      if (module && module.openWindow) {
        module.openWindow();
      }
    });

    // 退出应用
    ipcMain.on('toolbar:quit', () => {
      (app as any).isQuitting = true;
      app.quit();
    });

    // 关闭工具栏
    ipcMain.on('toolbar:close', () => {
      this.toggleToolbar();
    });
  }

  /**
   * 切换展开/收起
   */
  private toggleToolbar(): void {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }

    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      // 展开：显示工具列表
      const modules = this.pluginManager.getAllModules();
      const height = 70 + modules.length * 56 + 70;
      const newY = screenHeight - height - 20;
      
      this.window.setSize(280, height);
      this.window.setPosition(screenWidth - 300, newY);
    } else {
      // 收起：只显示工具栏
      this.window.setSize(280, 56);
      this.window.setPosition(screenWidth - 300, screenHeight - 76);
    }

    // 重新加载内容
    this.window.loadURL(`data:text/html,${encodeURIComponent(this.generateHTML())}`);
  }

  /**
   * 生成 HTML
   */
  private generateHTML(): string {
    const modules = this.pluginManager.getAllModules();

    if (!this.isExpanded) {
      // 收起状态：长方形工具栏
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 280px;
      height: 56px;
      background: transparent;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .toolbar-collapsed {
      width: 280px;
      height: 56px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
      backdrop-filter: blur(20px);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 18px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-app-region: drag;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .toolbar-collapsed:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 100%);
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .toolbar-title {
      color: white;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .toolbar-icon {
      font-size: 22px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    .expand-icon {
      color: white;
      font-size: 16px;
      font-weight: bold;
      -webkit-app-region: no-drag;
      opacity: 0.9;
      transition: transform 0.3s;
    }
    .toolbar-collapsed:hover .expand-icon {
      transform: translateY(-2px);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="toolbar-collapsed" onclick="toggleToolbar()">
    <div class="toolbar-title">
      <span class="toolbar-icon">🧰</span>
      <span>工具箱</span>
    </div>
    <div class="expand-icon">▲</div>
  </div>
  <script>
    const { ipcRenderer } = require('electron');
    function toggleToolbar() {
      ipcRenderer.send('toolbar:toggle');
    }
  </script>
</body>
</html>
      `;
    } else {
      // 展开状态：显示工具列表
      const moduleItems = modules.map(m => `
        <div class="tool-item" onclick="openModule('${m.metadata.id}')">
          <span class="tool-icon">${this.getModuleIcon(m.metadata.id)}</span>
          <span class="tool-name">${m.metadata.name}</span>
        </div>
      `).join('');

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 280px;
      background: transparent;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .toolbar-container {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%);
      backdrop-filter: blur(20px);
      border-radius: 18px;
      padding: 12px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .toolbar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      -webkit-app-region: drag;
    }
    .toolbar-title {
      color: white;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .close-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      -webkit-app-region: no-drag;
      font-size: 14px;
      font-weight: bold;
    }
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(1.05);
    }
    .tool-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 12px;
      margin: 6px 0;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-app-region: no-drag;
      border: 1px solid transparent;
    }
    .tool-item:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
      transform: translateX(4px);
      border-color: rgba(102, 126, 234, 0.3);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }
    .tool-icon {
      font-size: 26px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    .tool-name {
      color: white;
      font-size: 14px;
      font-weight: 600;
    }
    .toolbar-footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      gap: 8px;
    }
    .footer-btn {
      flex: 1;
      padding: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      -webkit-app-region: no-drag;
    }
    .footer-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .footer-btn.quit {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%);
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    .footer-btn.quit:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 38, 0.5) 100%);
      border-color: rgba(239, 68, 68, 0.6);
    }
  </style>
</head>
<body>
  <div class="toolbar-container">
    <div class="toolbar-header">
      <div class="toolbar-title">
        <span>🧰</span>
        <span>工具箱</span>
      </div>
      <button class="close-btn" onclick="closeToolbar()">▼</button>
    </div>
    ${moduleItems}
    <div class="toolbar-footer">
      <button class="footer-btn" onclick="closeToolbar()">收起</button>
      <button class="footer-btn quit" onclick="quitApp()">退出</button>
    </div>
  </div>
  <script>
    const { ipcRenderer } = require('electron');
    function openModule(id) {
      ipcRenderer.send('toolbar:open-module', id);
    }
    function closeToolbar() {
      ipcRenderer.send('toolbar:close');
    }
    function quitApp() {
      if (confirm('确定要退出应用吗？')) {
        ipcRenderer.send('toolbar:quit');
      }
    }
  </script>
</body>
</html>
      `;
    }
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
   * 销毁工具栏
   */
  destroy(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
    this.window = null;
  }
}
