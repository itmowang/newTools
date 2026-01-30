import { BrowserWindow } from 'electron';
import { IModule, ModuleMetadata, TrayMenuConfig, ShortcutConfig } from '@toolbox/core';
import { PortService } from './PortService';
import path from 'path';

/**
 * 端口管理器模块
 */
export class PortManagerModule implements IModule {
  metadata: ModuleMetadata = {
    id: 'port-manager',
    name: '端口管理器',
    description: '查看和管理系统端口占用',
    version: '1.0.0'
  };

  private portService: PortService;
  private window: BrowserWindow | null = null;

  constructor() {
    this.portService = new PortService();
  }

  async initialize(): Promise<void> {
    console.log('Port Manager initialized');
  }

  async destroy(): Promise<void> {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
  }

  getTrayMenuItems(): TrayMenuConfig[] {
    return [
      {
        label: '🔌 端口管理器',
        click: () => this.openWindow()
      }
    ];
  }

  getShortcuts(): ShortcutConfig[] {
    return [
      {
        accelerator: 'CommandOrControl+Shift+P',
        callback: () => this.openWindow()
      }
    ];
  }

  openWindow(): BrowserWindow {
    console.log('🔌 Opening Port Manager window...');
    
    if (this.window && !this.window.isDestroyed()) {
      console.log('Window already exists, focusing...');
      this.window.focus();
      return this.window;
    }

    console.log('Creating new Port Manager window...');
    this.window = new BrowserWindow({
      width: 1200,
      height: 700,
      title: '端口管理器',
      frame: false, // 隐藏系统标题栏
      backgroundColor: '#1F2937',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // 加载端口管理器 UI
    this.window.loadURL(`data:text/html,${encodeURIComponent(this.generateHTML())}`);

    // 设置 IPC 处理
    this.setupIPC();

    this.window.on('closed', () => {
      console.log('Port Manager window closed');
      this.window = null;
    });

    console.log('✅ Port Manager window created');
    return this.window;
  }

  /**
   * 设置 IPC 通信
   */
  private setupIPC(): void {
    const { ipcMain } = require('electron');
    
    // 窗口控制
    ipcMain.on('port-manager:minimize', () => {
      if (this.window && !this.window.isDestroyed()) {
        this.window.minimize();
      }
    });

    ipcMain.on('port-manager:close', () => {
      if (this.window && !this.window.isDestroyed()) {
        this.window.close();
      }
    });
    
    // 获取端口列表
    ipcMain.handle('port-manager:get-ports', async () => {
      try {
        console.log('🔍 Getting ports...');
        const ports = await this.portService.getAllPorts();
        console.log(`📊 Found ${ports.length} ports`);
        
        // 批量获取进程名（性能优化）
        const uniquePids = [...new Set(ports.map(p => p.pid))];
        console.log(`🔍 Getting process names for ${uniquePids.length} unique PIDs...`);
        
        const processMap = await this.portService.getProcessNames(uniquePids);
        console.log(`✅ Got ${processMap.size} process names`);
        
        // 填充进程名
        const portsWithNames = ports.map(port => ({
          ...port,
          processName: processMap.get(port.pid) || 'Unknown'
        }));
        
        console.log(`✅ Returning ${portsWithNames.length} ports with process names`);
        return portsWithNames;
      } catch (error) {
        console.error('❌ Failed to get ports:', error);
        return [];
      }
    });

    // 结束进程
    ipcMain.handle('port-manager:kill-process', async (_event: any, pid: number) => {
      return await this.portService.killProcess(pid);
    });

    // 搜索端口
    ipcMain.handle('port-manager:search', async (_event: any, query: string, ports: any[]) => {
      return await this.portService.searchPorts(query, ports);
    });
  }

  /**
   * 生成 HTML 页面
   */
  private generateHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>端口管理器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F9FAFB;
      color: #111827;
      overflow: hidden;
    }

    /* 自定义标题栏 */
    .titlebar {
      height: 40px;
      background: #1F2937;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      -webkit-app-region: drag;
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
    }

    .titlebar-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .titlebar-button.close:hover {
      background: #EF4444;
    }

    .container {
      padding: 24px;
      height: calc(100vh - 40px);
      display: flex;
      flex-direction: column;
    }

    .header {
      margin-bottom: 24px;
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }

    .search-input:focus {
      border-color: #0066FF;
      box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
    }

    .refresh-button {
      padding: 12px 24px;
      background: #0066FF;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .refresh-button:hover {
      background: #0052CC;
    }

    .refresh-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #0066FF;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #6B7280;
    }

    .table-container {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .table-wrapper {
      flex: 1;
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      position: sticky;
      top: 0;
      background: #F9FAFB;
      z-index: 10;
    }

    th {
      padding: 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #E5E7EB;
    }

    tr {
      border-bottom: 1px solid #F3F4F6;
      cursor: pointer;
      transition: background 0.2s;
    }

    tr:hover {
      background: #F9FAFB;
    }

    td {
      padding: 16px;
      font-size: 14px;
      color: #374151;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-tcp {
      background: #DBEAFE;
      color: #1E40AF;
    }

    .badge-udp {
      background: #FEF3C7;
      color: #92400E;
    }

    .badge-state {
      background: #D1FAE5;
      color: #065F46;
    }

    .kill-button {
      padding: 6px 12px;
      background: #FEE2E2;
      color: #991B1B;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .kill-button:hover {
      background: #FCA5A5;
    }

    .empty-state, .loading-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .empty-icon {
      font-size: 64px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #E5E7EB;
      border-top: 4px solid #0066FF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <!-- 自定义标题栏 -->
  <div class="titlebar">
    <div class="titlebar-title">
      <span>🔌</span>
      <span>端口管理器</span>
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
      <h1 class="title">🔌 端口管理器</h1>
      <div class="header-actions">
        <input
          type="text"
          id="searchInput"
          class="search-input"
          placeholder="搜索端口、进程或 PID..."
        />
        <button id="refreshButton" class="refresh-button">🔄 刷新</button>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value" id="totalPorts">0</div>
        <div class="stat-label">活动端口</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="tcpPorts">0</div>
        <div class="stat-label">TCP 连接</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="udpPorts">0</div>
        <div class="stat-label">UDP 连接</div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper" id="tableWrapper">
        <table>
          <thead>
            <tr>
              <th>协议</th>
              <th>本地地址</th>
              <th>本地端口</th>
              <th>远程地址</th>
              <th>状态</th>
              <th>PID</th>
              <th>进程名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="tableBody">
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    const { ipcRenderer } = require('electron');
    
    // 窗口控制 API
    window.electronAPI = {
      minimize: () => {
        ipcRenderer.send('port-manager:minimize');
      },
      close: () => {
        ipcRenderer.send('port-manager:close');
      }
    };
    
    let allPorts = [];
    let filteredPorts = [];

    async function loadPorts() {
      const refreshButton = document.getElementById('refreshButton');
      refreshButton.disabled = true;
      refreshButton.textContent = '刷新中...';

      try {
        allPorts = await ipcRenderer.invoke('port-manager:get-ports');
        filteredPorts = allPorts;
        updateStats();
        renderTable();
      } catch (error) {
        console.error('Failed to load ports:', error);
      } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = '🔄 刷新';
      }
    }

    function updateStats() {
      document.getElementById('totalPorts').textContent = filteredPorts.length;
      document.getElementById('tcpPorts').textContent = 
        filteredPorts.filter(p => p.protocol === 'TCP').length;
      document.getElementById('udpPorts').textContent = 
        filteredPorts.filter(p => p.protocol === 'UDP').length;
    }

    function renderTable() {
      const tbody = document.getElementById('tableBody');
      
      if (filteredPorts.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="8" style="text-align: center; padding: 48px;">
              <div class="empty-icon">🔍</div>
              <div>暂无端口数据</div>
            </td>
          </tr>
        \`;
        return;
      }

      tbody.innerHTML = filteredPorts.map(port => \`
        <tr>
          <td>
            <span class="badge badge-\${port.protocol.toLowerCase()}">
              \${port.protocol}
            </span>
          </td>
          <td>\${port.localAddress}</td>
          <td><strong>\${port.localPort}</strong></td>
          <td>\${port.foreignAddress || '-'}</td>
          <td>
            <span class="badge badge-state">\${port.state}</span>
          </td>
          <td>\${port.pid}</td>
          <td>\${port.processName || '未知'}</td>
          <td>
            <button class="kill-button" onclick="killProcess(\${port.pid})">
              ❌ 结束
            </button>
          </td>
        </tr>
      \`).join('');
    }

    async function killProcess(pid) {
      if (!confirm(\`确定要结束进程 \${pid} 吗？\`)) return;
      
      // 显示加载提示
      const loadingMsg = document.createElement('div');
      loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px 40px; border-radius: 8px; z-index: 10000; font-size: 16px;';
      loadingMsg.textContent = '正在结束进程...';
      document.body.appendChild(loadingMsg);
      
      try {
        const result = await ipcRenderer.invoke('port-manager:kill-process', pid);
        document.body.removeChild(loadingMsg);
        
        if (result.success) {
          // 成功提示
          const successMsg = document.createElement('div');
          successMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #10B981; color: white; padding: 20px 40px; border-radius: 8px; z-index: 10000; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
          successMsg.innerHTML = '✅ 进程已成功结束';
          document.body.appendChild(successMsg);
          
          setTimeout(() => {
            document.body.removeChild(successMsg);
          }, 2000);
          
          // 刷新端口列表
          loadPorts();
        } else {
          // 失败提示
          let errorMsg = result.error || '结束进程失败';
          
          if (result.needsAdmin) {
            errorMsg = '⚠️ 需要管理员权限\\n\\n系统已尝试请求管理员权限。\\n如果 UAC 提示出现，请点击"是"以继续。\\n\\n如果仍然失败，请以管理员身份运行此应用。';
          }
          
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #EF4444; color: white; padding: 24px 40px; border-radius: 12px; z-index: 10000; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 400px; white-space: pre-line; text-align: center; line-height: 1.6;';
          errorDiv.innerHTML = errorMsg;
          document.body.appendChild(errorDiv);
          
          setTimeout(() => {
            document.body.removeChild(errorDiv);
          }, 5000);
        }
      } catch (error) {
        document.body.removeChild(loadingMsg);
        alert('发生错误：' + error.message);
      }
    }

    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (!query) {
        filteredPorts = allPorts;
      } else {
        filteredPorts = allPorts.filter(port =>
          port.localPort.toString().includes(query) ||
          port.processName.toLowerCase().includes(query) ||
          port.pid.toString().includes(query) ||
          port.localAddress.includes(query)
        );
      }
      updateStats();
      renderTable();
    });

    // 刷新按钮
    document.getElementById('refreshButton').addEventListener('click', loadPorts);

    // 初始加载
    loadPorts();
  </script>
</body>
</html>
    `;
  }

  /**
   * 获取端口服务实例（供 IPC 调用）
   */
  getPortService(): PortService {
    return this.portService;
  }
}
