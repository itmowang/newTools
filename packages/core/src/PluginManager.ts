import { EventEmitter } from 'events';
import { IModule, CoreEvent } from './types';

/**
 * 插件管理器 - 负责模块的注册、卸载和生命周期管理
 */
export class PluginManager extends EventEmitter {
  private modules: Map<string, IModule> = new Map();

  /**
   * 注册模块
   */
  async registerModule(module: IModule): Promise<void> {
    const { id } = module.metadata;
    
    if (this.modules.has(id)) {
      throw new Error(`Module ${id} already registered`);
    }

    await module.initialize();
    this.modules.set(id, module);
    
    this.emit(CoreEvent.MODULE_REGISTERED, module);
    console.log(`✅ Module registered: ${id}`);
  }

  /**
   * 卸载模块
   */
  async unregisterModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    await module.destroy();
    this.modules.delete(moduleId);
    
    this.emit(CoreEvent.MODULE_UNREGISTERED, module);
    console.log(`❌ Module unregistered: ${moduleId}`);
  }

  /**
   * 获取所有模块
   */
  getAllModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * 获取指定模块
   */
  getModule(moduleId: string): IModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * 销毁所有模块
   */
  async destroyAll(): Promise<void> {
    for (const module of this.modules.values()) {
      await module.destroy();
    }
    this.modules.clear();
  }
}
