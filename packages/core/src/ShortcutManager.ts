import { globalShortcut } from 'electron';
import { PluginManager } from './PluginManager';
import { CoreEvent } from './types';

/**
 * 快捷键管理器 - 负责全局快捷键的注册和管理
 */
export class ShortcutManager {
  private pluginManager: PluginManager;
  private registeredShortcuts: Set<string> = new Set();

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    
    this.pluginManager.on(CoreEvent.MODULE_REGISTERED, () => {
      this.registerModuleShortcuts();
    });
  }

  /**
   * 注册所有模块的快捷键
   */
  private registerModuleShortcuts(): void {
    const modules = this.pluginManager.getAllModules();
    
    modules.forEach(module => {
      if (module.getShortcuts) {
        const shortcuts = module.getShortcuts();
        shortcuts.forEach(({ accelerator, callback }) => {
          this.registerShortcut(accelerator, callback);
        });
      }
    });
  }

  /**
   * 注册单个快捷键
   */
  registerShortcut(accelerator: string, callback: () => void): boolean {
    if (this.registeredShortcuts.has(accelerator)) {
      console.warn(`Shortcut ${accelerator} already registered`);
      return false;
    }

    const success = globalShortcut.register(accelerator, callback);
    
    if (success) {
      this.registeredShortcuts.add(accelerator);
      console.log(`✅ Shortcut registered: ${accelerator}`);
    } else {
      console.error(`❌ Failed to register shortcut: ${accelerator}`);
    }
    
    return success;
  }

  /**
   * 注销所有快捷键
   */
  unregisterAll(): void {
    globalShortcut.unregisterAll();
    this.registeredShortcuts.clear();
    console.log('✅ All shortcuts unregistered');
  }
}
