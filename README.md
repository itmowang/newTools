# 🧰 Toolbox Assistant

Windows 桌面工具箱助手 - 基于 Electron + Monorepo 架构的可扩展工具集

## ✨ 特性

- 🖥 **Windows 桌面应用** - 原生体验
- 🔌 **插件化架构** - 模块可插拔、可扩展
- 🖱 **系统托盘** - 常驻后台，快速访问
- ⌨️ **全局快捷键** - 快速启动工具
- 📦 **Monorepo** - 统一管理，独立开发

## 🛠 当前工具模块

### 1️⃣ 端口管理器 (Port Manager)
- 查看系统端口占用
- 搜索端口/进程
- 一键结束进程
- 快捷键: `Ctrl+Shift+P`

### 2️⃣ 取色器 (Color Picker)
- 桌面任意位置取色
- 支持 HEX / RGB / HSL
- 自动复制到剪贴板
- 快捷键: `Ctrl+Shift+C`

## 🏗 项目结构

```
toolbox-assistant/
├─ apps/
│  └─ desktop/              # 主应用
│     ├─ src/
│     │  └─ main.ts         # 入口文件
│     └─ package.json
├─ packages/
│  ├─ core/                 # 核心系统
│  │  ├─ src/
│  │  │  ├─ PluginManager.ts
│  │  │  ├─ TrayManager.ts
│  │  │  ├─ ShortcutManager.ts
│  │  │  └─ types.ts
│  │  └─ package.json
│  ├─ port-manager/         # 端口管理模块
│  │  ├─ src/
│  │  │  ├─ PortService.ts
│  │  │  └─ PortManagerModule.ts
│  │  └─ package.json
│  └─ color-picker/         # 取色器模块
│     ├─ src/
│     │  ├─ ColorService.ts
│     │  └─ ColorPickerModule.ts
│     └─ package.json
└─ pnpm-workspace.yaml
```

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 构建所有包
```bash
pnpm build
```

### 启动应用
```bash
pnpm dev
```

## 📝 开发新模块

### 1. 创建模块包
```bash
mkdir -p packages/my-tool/src
cd packages/my-tool
```

### 2. 实现模块接口
```typescript
import { IModule, ModuleMetadata } from '@toolbox/core';

export class MyToolModule implements IModule {
  metadata: ModuleMetadata = {
    id: 'my-tool',
    name: '我的工具',
    description: '工具描述'
  };

  async initialize(): Promise<void> {
    // 初始化逻辑
  }

  async destroy(): Promise<void> {
    // 清理逻辑
  }

  getTrayMenuItems() {
    return [
      {
        label: '🔧 我的工具',
        click: () => this.openWindow()
      }
    ];
  }

  getShortcuts() {
    return [
      {
        accelerator: 'CommandOrControl+Shift+M',
        callback: () => this.openWindow()
      }
    ];
  }

  openWindow() {
    // 打开窗口逻辑
  }
}
```

### 3. 在主应用中注册
```typescript
// apps/desktop/src/main.ts
import { MyToolModule } from '@toolbox/my-tool';

await this.pluginManager.registerModule(new MyToolModule());
```

## 🎯 核心概念

### 模块接口 (IModule)
所有工具模块必须实现的标准接口：
- `metadata` - 模块元信息
- `initialize()` - 初始化
- `destroy()` - 销毁
- `getTrayMenuItems()` - 托盘菜单项（可选）
- `getShortcuts()` - 全局快捷键（可选）
- `openWindow()` - 打开窗口（可选）

### 插件管理器 (PluginManager)
- 统一管理所有模块的生命周期
- 模块注册/卸载
- 事件分发

### 托盘管理器 (TrayManager)
- 创建系统托盘
- 动态构建托盘菜单
- 自动收集模块菜单项

### 快捷键管理器 (ShortcutManager)
- 注册全局快捷键
- 自动收集模块快捷键
- 冲突检测

## 🔧 技术栈

- **桌面框架**: Electron 28
- **语言**: TypeScript
- **包管理**: pnpm workspace
- **构建工具**: tsc

## 📋 后续扩展

- [ ] UI 组件库封装
- [ ] 模块配置持久化
- [ ] 自动更新
- [ ] 更多工具模块
- [ ] 主题系统

## 📄 License

MIT
