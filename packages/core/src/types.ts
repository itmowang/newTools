import { BrowserWindow, MenuItem } from 'electron';

/**
 * 模块元数据
 */
export interface ModuleMetadata {
  id: string;
  name: string;
  description?: string;
  version?: string;
  icon?: string;
}

/**
 * 托盘菜单项配置
 */
export interface TrayMenuConfig {
  label: string;
  enabled?: boolean;
  click?: () => void;
  type?: 'normal' | 'separator' | 'submenu';
  submenu?: TrayMenuConfig[];
}

/**
 * 全局快捷键配置
 */
export interface ShortcutConfig {
  accelerator: string;
  callback: () => void;
}

/**
 * 模块接口
 */
export interface IModule {
  metadata: ModuleMetadata;
  
  /**
   * 模块初始化
   */
  initialize(): Promise<void>;
  
  /**
   * 模块销毁
   */
  destroy(): Promise<void>;
  
  /**
   * 获取托盘菜单项（可选）
   */
  getTrayMenuItems?(): TrayMenuConfig[];
  
  /**
   * 获取全局快捷键（可选）
   */
  getShortcuts?(): ShortcutConfig[];
  
  /**
   * 打开模块主界面（可选）
   */
  openWindow?(): BrowserWindow | void;
}

/**
 * 核心系统事件
 */
export enum CoreEvent {
  MODULE_REGISTERED = 'module:registered',
  MODULE_UNREGISTERED = 'module:unregistered',
  TRAY_MENU_UPDATE = 'tray:menu:update',
  WINDOW_CREATED = 'window:created',
}
