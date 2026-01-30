# 📦 模块开发指南

## 快速开始

### 1. 创建模块目录结构

```bash
mkdir -p packages/my-tool/src
cd packages/my-tool
```

### 2. 创建 package.json

```json
{
  "name": "@toolbox/my-tool",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@toolbox/core": "workspace:*",
    "electron": "^28.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0"
  }
}
```

### 3. 创建 tsconfig.json

```json
{
  "extends": "../core/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## 模块接口实现

### 基础模板

```typescript
// src/MyToolModule.ts
import { BrowserWindow } from 'electron';
import { 
  IModule, 
  ModuleMetadata, 
  TrayMenuConfig, 
  ShortcutConfig 
} from '@toolbox/core';

export class MyToolModule implements IModule {
  metadata: ModuleMetadata = {
    id: 'my-tool',
    name: '我的工具',
    description: '工具描述',
    version: '1.0.0'
  };

  private window: BrowserWindow | null = null;

  async initialize(): Promise<void> {
    console.log('MyTool initialized');
    // 初始化逻辑
  }

  async destroy(): Promise<void> {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
  }

  getTrayMenuItems(): TrayMenuConfig[] {
    return [
      {
        label: '🔧 我的工具',
        click: () => this.openWindow()
      }
    ];
  }

  getShortcuts(): ShortcutConfig[] {
    return [
      {
        accelerator: 'CommandOrControl+Shift+M',
        callback: () => this.openWindow()
      }
    ];
  }

  openWindow(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      title: '我的工具',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.window.loadURL('data:text/html,<h1>My Tool</h1>');

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }
}
```

### 导出模块

```typescript
// src/index.ts
export * from './types';
export * from './MyToolModule';
```

## 业务逻辑分离

### Service 层（推荐）

将业务逻辑与 Electron 解耦：

```typescript
// src/MyService.ts
export class MyService {
  async doSomething(): Promise<string> {
    // 纯业务逻辑，不依赖 Electron
    return 'result';
  }
}

// src/MyToolModule.ts
import { MyService } from './MyService';

export class MyToolModule implements IModule {
  private service: MyService;

  constructor() {
    this.service = new MyService();
  }

  async initialize(): Promise<void> {
    await this.service.doSomething();
  }
}
```

## 注册模块

在主应用中注册：

```typescript
// apps/desktop/src/main.ts
import { MyToolModule } from '@toolbox/my-tool';

private async registerModules(): Promise<void> {
  const myTool = new MyToolModule();
  await this.pluginManager.registerModule(myTool);
}
```

## 最佳实践

### 1. 窗口管理
- 单例模式：同一时间只打开一个窗口
- 焦点管理：窗口已存在时聚焦而非重新创建
- 资源清理：窗口关闭时清理引用

### 2. 错误处理
```typescript
async initialize(): Promise<void> {
  try {
    await this.service.init();
  } catch (error) {
    console.error('Failed to initialize:', error);
    throw error;
  }
}
```

### 3. 快捷键选择
- 避免与系统快捷键冲突
- 使用 `CommandOrControl` 兼容 Mac/Windows
- 常用组合：`Ctrl+Shift+字母`

### 4. 托盘菜单
- 使用 Emoji 增强识别度
- 菜单项简洁明了
- 支持禁用状态

## 完整示例

参考现有模块：
- `packages/port-manager` - 系统调用示例
- `packages/color-picker` - 桌面交互示例

## 调试技巧

### 1. 开发模式
```bash
pnpm --filter my-tool dev
```

### 2. 日志输出
```typescript
console.log('✅ Success');
console.warn('⚠️ Warning');
console.error('❌ Error');
```

### 3. Electron DevTools
```typescript
this.window.webContents.openDevTools();
```

## 发布清单

- [ ] 实现所有必需接口方法
- [ ] 添加类型定义
- [ ] 编写 README
- [ ] 测试快捷键
- [ ] 测试托盘菜单
- [ ] 测试窗口生命周期
- [ ] 构建成功
