import { app, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { PluginManager } from './PluginManager';
import { CoreEvent } from './types';

/**
 * 托盘管理器 - 负责系统托盘的创建和菜单管理
 */
export class TrayManager {
  private tray: Tray | null = null;
  private pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    
    // 监听模块注册事件，自动更新托盘菜单
    this.pluginManager.on(CoreEvent.MODULE_REGISTERED, () => {
      this.updateTrayMenu();
    });
    
    this.pluginManager.on(CoreEvent.MODULE_UNREGISTERED, () => {
      this.updateTrayMenu();
    });
  }

  /**
   * 创建系统托盘
   */
  createTray(iconPath?: string): void {
    if (this.tray) {
      return;
    }

    // 使用默认图标或自定义图标
    const icon = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
    this.tray = new Tray(icon);
    
    this.tray.setToolTip('Toolbox Assistant');
    this.updateTrayMenu();
    
    console.log('✅ Tray created');
  }

  /**
   * 更新托盘菜单
   */
  private updateTrayMenu(): void {
    if (!this.tray) {
      return;
    }

    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: '🏠 打开主窗口',
        click: () => {
          this.pluginManager.emit('open-main-window');
        }
      },
      { type: 'separator' }
    ];

    // 从所有模块收集托盘菜单项
    const modules = this.pluginManager.getAllModules();
    modules.forEach(module => {
      if (module.getTrayMenuItems) {
        const items = module.getTrayMenuItems();
        items.forEach(item => {
          menuTemplate.push({
            label: item.label,
            enabled: item.enabled !== false,
            click: item.click,
            type: item.type || 'normal'
          });
        });
      }
    });

    menuTemplate.push(
      { type: 'separator' },
      {
        label: '⚙️ 设置',
        click: () => {
          console.log('打开设置');
        }
      },
      {
        label: '🔄 检查更新',
        click: () => {
          this.pluginManager.emit('check-for-updates');
        }
      },
      {
        label: '❌ 退出',
        click: () => {
          app.quit();
        }
      }
    );

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    this.tray.setContextMenu(contextMenu);
  }

  /**
   * 获取默认图标
   */
  private getDefaultIcon(): string {
    // 创建一个简单的 16x16 图标
    const icon = nativeImage.createEmpty();
    return icon.toDataURL();
  }

  /**
   * 销毁托盘
   */
  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
