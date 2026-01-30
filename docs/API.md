# 📚 API 文档

## Core API

### IModule 接口

模块必须实现的标准接口。

```typescript
interface IModule {
  metadata: ModuleMetadata;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getTrayMenuItems?(): TrayMenuConfig[];
  getShortcuts?(): ShortcutConfig[];
  openWindow?(): BrowserWindow | void;
}
```

#### metadata
模块元信息。

```typescript
interface ModuleMetadata {
  id: string;              // 唯一标识
  name: string;            // 显示名称
  description?: string;    // 描述
  version?: string;        // 版本号
  icon?: string;           // 图标路径
}
```

#### initialize()
模块初始化方法，在注册时自动调用。

```typescript
async initialize(): Promise<void> {
  // 初始化逻辑
}
```

#### destroy()
模块销毁方法，在卸载时自动调用。

```typescript
async destroy(): Promise<void> {
  // 清理资源
}
```

#### getTrayMenuItems()
返回托盘菜单项配置（可选）。

```typescript
getTrayMenuItems(): TrayMenuConfig[] {
  return [
    {
      label: '🔧 工具名',
      enabled: true,
      click: () => this.openWindow()
    }
  ];
}
```

#### getShortcuts()
返回全局快捷键配置（可选）。

```typescript
getShortcuts(): ShortcutConfig[] {
  return [
    {
      accelerator: 'CommandOrControl+Shift+T',
      callback: () => this.openWindow()
    }
  ];
}
```

#### openWindow()
打开模块窗口（可选）。

```typescript
openWindow(): BrowserWindow {
  this.window = new BrowserWindow({
    width: 800,
    height: 600
  });
  return this.window;
}
```

---

## PluginManager

插件管理器，负责模块生命周期。

### 方法

#### registerModule()
注册模块。

```typescript
async registerModule(module: IModule): Promise<void>
```

**示例：**
```typescript
const myModule = new MyToolModule();
await pluginManager.registerModule(myModule);
```

#### unregisterModule()
卸载模块。

```typescript
async unregisterModule(moduleId: string): Promise<void>
```

#### getAllModules()
获取所有已注册模块。

```typescript
getAllModules(): IModule[]
```

#### getModule()
获取指定模块。

```typescript
getModule(moduleId: string): IModule | undefined
```

### 事件

```typescript
pluginManager.on('module:registered', (module) => {});
pluginManager.on('module:unregistered', (module) => {});
```

---

## TrayManager

托盘管理器。

### 方法

#### createTray()
创建系统托盘。

```typescript
createTray(iconPath?: string): void
```

#### destroy()
销毁托盘。

```typescript
destroy(): void
```

---

## ShortcutManager

快捷键管理器。

### 方法

#### registerShortcut()
注册单个快捷键。

```typescript
registerShortcut(accelerator: string, callback: () => void): boolean
```

**示例：**
```typescript
shortcutManager.registerShortcut('Ctrl+Shift+X', () => {
  console.log('Shortcut triggered');
});
```

#### unregisterAll()
注销所有快捷键。

```typescript
unregisterAll(): void
```

---

## 类型定义

### TrayMenuConfig

```typescript
interface TrayMenuConfig {
  label: string;
  enabled?: boolean;
  click?: () => void;
  type?: 'normal' | 'separator' | 'submenu';
  submenu?: TrayMenuConfig[];
}
```

### ShortcutConfig

```typescript
interface ShortcutConfig {
  accelerator: string;
  callback: () => void;
}
```

### CoreEvent

```typescript
enum CoreEvent {
  MODULE_REGISTERED = 'module:registered',
  MODULE_UNREGISTERED = 'module:unregistered',
  TRAY_MENU_UPDATE = 'tray:menu:update',
  WINDOW_CREATED = 'window:created',
}
```

---

## 模块示例

### 端口管理器 API

```typescript
class PortManagerModule implements IModule {
  getPortService(): PortService;
}

class PortService {
  async getAllPorts(): Promise<PortInfo[]>;
  async getProcessName(pid: number): Promise<string>;
  async killProcess(pid: number): Promise<boolean>;
  async searchPorts(query: string, ports: PortInfo[]): Promise<PortInfo[]>;
}
```

### 取色器 API

```typescript
class ColorPickerModule implements IModule {
  async startPicking(): Promise<void>;
}

class ColorService {
  async getColorAtCursor(): Promise<ColorInfo | null>;
}
```
