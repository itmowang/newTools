import { BrowserWindow, clipboard } from 'electron';
import { IModule, ModuleMetadata, TrayMenuConfig, ShortcutConfig } from '@toolbox/core';
import { ColorService } from './ColorService';

/**
 * 取色器模块
 */
export class ColorPickerModule implements IModule {
  metadata: ModuleMetadata = {
    id: 'color-picker',
    name: '取色器',
    description: '桌面任意位置取色工具',
    version: '1.0.0'
  };

  private colorService: ColorService;
  private window: BrowserWindow | null = null;
  private isPickingColor = false;

  constructor() {
    this.colorService = new ColorService();
  }

  async initialize(): Promise<void> {
    console.log('Color Picker initialized');
  }

  async destroy(): Promise<void> {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
  }

  getTrayMenuItems(): TrayMenuConfig[] {
    return [
      {
        label: '🎨 取色器',
        click: () => this.startPicking()
      }
    ];
  }

  getShortcuts(): ShortcutConfig[] {
    return [
      {
        accelerator: 'CommandOrControl+Shift+C',
        callback: () => this.startPicking()
      }
    ];
  }

  /**
   * 打开窗口（为了兼容 IModule 接口）
   */
  openWindow(): void {
    console.log('🎨 Color Picker openWindow called, starting picking...');
    this.startPicking();
  }

  /**
   * 开始取色
   */
  async startPicking(): Promise<void> {
    console.log('🎨 Starting color picker...');
    
    if (this.isPickingColor) {
      console.log('Already picking color, skipping...');
      return;
    }

    // 先捕获所有屏幕
    console.log('📸 Capturing screens...');
    await this.colorService.captureAllScreens();
    
    // 创建取色器窗口
    this.createPickerWindow();
  }

  /**
   * 创建取色器窗口
   */
  private createPickerWindow(): void {
    const { screen } = require('electron');
    
    this.isPickingColor = true;
    
    // 获取所有显示器
    const displays = screen.getAllDisplays();
    console.log(`🖥 Found ${displays.length} displays`);
    
    // 存储所有窗口引用
    const pickerWindows: BrowserWindow[] = [];
    
    // 为每个显示器创建一个取色窗口
    displays.forEach((display: any, index: number) => {
      const { x, y, width, height } = display.bounds;
      console.log(`Creating picker window for display ${index}: ${width}x${height} at (${x}, ${y})`);
      
      const pickerWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        title: '', // 空标题用于识别
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });

      pickerWindow.setIgnoreMouseEvents(false);
      pickerWindow.loadURL(`data:text/html,${encodeURIComponent(this.generatePickerHTML())}`);
      
      pickerWindows.push(pickerWindow);
      
      // 保存窗口引用（只保存主窗口）
      if (index === 0) {
        this.window = pickerWindow;
      }
      
      // 关闭时清理
      pickerWindow.on('closed', () => {
        const idx = pickerWindows.indexOf(pickerWindow);
        if (idx > -1) {
          pickerWindows.splice(idx, 1);
        }
        if (pickerWindows.length === 0) {
          this.window = null;
          this.isPickingColor = false;
        }
      });
    });

    // 设置 IPC 处理（只设置一次）
    this.setupPickerIPC();
  }

  /**
   * 设置取色器 IPC
   */
  private setupPickerIPC(): void {
    const { ipcMain } = require('electron');

    // 移除旧的监听器
    ipcMain.removeHandler('color-picker:pick-color');
    ipcMain.removeHandler('color-picker:refresh-capture');
    ipcMain.removeAllListeners('color-picker:close');
    ipcMain.removeAllListeners('color-picker:copy-color');

    ipcMain.handle('color-picker:pick-color', async (_event: any, x: number, y: number) => {
      try {
        const color = await this.colorService.getColorAtPoint(x, y);
        return color;
      } catch (error) {
        console.error('Failed to pick color:', error);
        return null;
      }
    });

    // 手动刷新截图
    ipcMain.handle('color-picker:refresh-capture', async () => {
      try {
        console.log('🔄 Refreshing screen capture...');
        await this.colorService.captureAllScreens();
        return { success: true };
      } catch (error) {
        console.error('Failed to refresh capture:', error);
        return { success: false };
      }
    });

    ipcMain.on('color-picker:close', (_event: any) => {
      console.log('🎨 Closing color picker...');
      // 清除缓存
      this.colorService.clearCache();
      
      // 关闭所有取色器窗口
      const { BrowserWindow } = require('electron');
      const allWindows = BrowserWindow.getAllWindows();
      
      allWindows.forEach((win: any) => {
        try {
          // 检查是否是取色器窗口（透明、无边框、置顶、跳过任务栏）
          const title = win.getTitle();
          if (!win.isDestroyed() && 
              win.isAlwaysOnTop() && 
              !win.isVisible() === false &&
              title === '') {
            console.log('Closing picker window');
            win.close();
          }
        } catch (error) {
          console.error('Error closing window:', error);
        }
      });
      
      this.window = null;
      this.isPickingColor = false;
      console.log('✅ Color picker closed');
    });

    ipcMain.on('color-picker:copy-color', (_event: any, hex: string) => {
      clipboard.writeText(hex);
      console.log(`✅ Color copied: ${hex}`);
    });
  }

  /**
   * 生成取色器 HTML
   */
  private generatePickerHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 100vw;
      height: 100vh;
      cursor: crosshair;
      background: transparent;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .cursor-indicator {
      position: fixed;
      width: 40px;
      height: 40px;
      border: 3px solid #0066FF;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3);
      z-index: 10000;
      background: rgba(0, 102, 255, 0.1);
    }

    .color-preview {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 10001;
      pointer-events: none;
    }

    .color-swatch {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      border: 3px solid #E5E7EB;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .color-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .color-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      font-family: 'Courier New', monospace;
    }

    .color-formats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .color-format {
      font-size: 14px;
      color: #6B7280;
      font-family: 'Courier New', monospace;
    }

    .instructions {
      position: fixed;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
      font-size: 14px;
      color: #374151;
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 12px;
      pointer-events: none;
    }

    .instruction-icon {
      font-size: 24px;
    }

    .instruction-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .instruction-title {
      font-weight: 600;
      color: #111827;
    }

    .instruction-hint {
      font-size: 12px;
      color: #6B7280;
    }

    .refresh-button {
      position: fixed;
      top: 40px;
      right: 40px;
      background: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #0066FF;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      z-index: 10001;
      pointer-events: auto;
    }

    .refresh-button:hover {
      background: #F3F4F6;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .refresh-button:active {
      transform: translateY(0);
    }

    .refresh-button.refreshing {
      opacity: 0.6;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="cursor-indicator" id="cursorIndicator"></div>
  
  <div class="instructions">
    <div class="instruction-icon">🎨</div>
    <div class="instruction-text">
      <div class="instruction-title">取色器已激活</div>
      <div class="instruction-hint">点击选择颜色 • ESC 取消 • 自动刷新</div>
    </div>
  </div>

  <button class="refresh-button" id="refreshButton" onclick="refreshCapture()">
    🔄 刷新截图
  </button>

  <div class="color-preview" id="colorPreview" style="display: none;">
    <div class="color-swatch" id="colorSwatch"></div>
    <div class="color-info">
      <div class="color-value" id="colorHex">#000000</div>
      <div class="color-formats">
        <div class="color-format" id="colorRgb">RGB: 0, 0, 0</div>
        <div class="color-format" id="colorHsl">HSL: 0°, 0%, 0%</div>
      </div>
    </div>
  </div>

  <script>
    const { ipcRenderer } = require('electron');

    const cursorIndicator = document.getElementById('cursorIndicator');
    const colorPreview = document.getElementById('colorPreview');
    const colorSwatch = document.getElementById('colorSwatch');
    const colorHex = document.getElementById('colorHex');
    const colorRgb = document.getElementById('colorRgb');
    const colorHsl = document.getElementById('colorHsl');

    let currentColor = null;
    let autoRefreshInterval = null;

    // 自动刷新截图（每 2 秒）
    autoRefreshInterval = setInterval(async () => {
      await ipcRenderer.invoke('color-picker:refresh-capture');
    }, 2000);

    // 手动刷新截图
    async function refreshCapture() {
      const btn = document.getElementById('refreshButton');
      btn.classList.add('refreshing');
      btn.textContent = '🔄 刷新中...';
      
      await ipcRenderer.invoke('color-picker:refresh-capture');
      
      btn.classList.remove('refreshing');
      btn.textContent = '🔄 刷新截图';
    }

    // 鼠标移动 - 直接从缓存读取颜色（超快）
    document.addEventListener('mousemove', async (e) => {
      // 立即更新光标指示器位置
      cursorIndicator.style.left = e.clientX + 'px';
      cursorIndicator.style.top = e.clientY + 'px';

      // 从缓存读取颜色（不需要节流，因为很快）
      try {
        const color = await ipcRenderer.invoke('color-picker:pick-color', e.screenX, e.screenY);
        if (color) {
          currentColor = color;
          updateColorPreview(color);
        }
      } catch (error) {
        console.error('Failed to pick color:', error);
      }
    });

    // 点击选择颜色
    document.addEventListener('click', (e) => {
      if (currentColor) {
        ipcRenderer.send('color-picker:copy-color', currentColor.hex);
        showSuccessMessage(currentColor.hex);
        setTimeout(() => {
          cleanup();
          ipcRenderer.send('color-picker:close');
        }, 1500);
      }
    });

    // ESC 取消
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cleanup();
        ipcRenderer.send('color-picker:close');
      }
    });

    // 清理资源
    function cleanup() {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
    }

    function updateColorPreview(color) {
      colorPreview.style.display = 'flex';
      colorSwatch.style.background = color.hex;
      colorHex.textContent = color.hex;
      colorRgb.textContent = \`RGB: \${color.rgb.r}, \${color.rgb.g}, \${color.rgb.b}\`;
      if (color.hsl) {
        colorHsl.textContent = \`HSL: \${color.hsl.h}°, \${color.hsl.s}%, \${color.hsl.l}%\`;
      }
    }

    function showSuccessMessage(hex) {
      const instructions = document.querySelector('.instructions');
      instructions.innerHTML = \`
        <div class="instruction-icon">✅</div>
        <div class="instruction-text">
          <div class="instruction-title">颜色已复制</div>
          <div class="instruction-hint">\${hex} 已复制到剪贴板</div>
        </div>
      \`;
    }
  </script>
</body>
</html>
    `;
  }

  /**
   * 显示颜色预览窗口
   */
  private showColorPreview(hex: string): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }

    this.window = new BrowserWindow({
      width: 300,
      height: 150,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const html = `
      <html>
        <body style="margin:0;padding:20px;background:rgba(0,0,0,0.8);color:white;font-family:sans-serif;text-align:center;">
          <div style="width:100px;height:100px;background:${hex};margin:0 auto 10px;border-radius:8px;"></div>
          <div style="font-size:18px;font-weight:bold;">${hex}</div>
          <div style="font-size:12px;margin-top:5px;">已复制到剪贴板</div>
        </body>
      </html>
    `;

    this.window.loadURL(`data:text/html,${encodeURIComponent(html)}`);

    setTimeout(() => {
      if (this.window && !this.window.isDestroyed()) {
        this.window.close();
      }
    }, 2000);
  }
}
