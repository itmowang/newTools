# 🏗 架构设计文档

## 整体架构

Toolbox Assistant 采用 **插件化 Monorepo 架构**，核心思想是：

> **Core 提供基础设施，Module 提供业务功能，App 负责组装**

```
┌─────────────────────────────────────────┐
│          Desktop App (Electron)         │
│  ┌───────────────────────────────────┐  │
│  │      Main Process (Node.js)       │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │      Plugin Manager         │  │  │
│  │  │  ┌──────────┬──────────┐    │  │  │
│  │  │  │ Module 1 │ Module 2 │... │  │  │
│  │  │  └──────────┴──────────┘    │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Tray Manager              │  │  │
│  │  │   Shortcut Manager          │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 核心层 (Core)

### 职责
- 模块生命周期管理
- 系统资源统一管理（托盘、快捷键）
- 事件总线
- 类型定义

### 核心类

#### PluginManager
```typescript
class PluginManager {
  - modules: Map<string, IModule>
  
  + registerModule(module: IModule): Promise<void>
  + unregisterModule(moduleId: string): Promise<void>
  + getAllModules(): IModule[]
  + getModule(moduleId: string): IModule
}
```

**设计原则**：
- 模块注册时自动调用 `initialize()`
- 模块卸载时自动调用 `destroy()`
- 发出事件通知其他管理器

#### TrayManager
```typescript
class TrayManager {
  - tray: Tray
  - pluginManager: PluginManager
  
  + createTray(iconPath?: string): void
  - updateTrayMenu(): void
  + destroy(): void
}
```

**设计原则**：
- 监听 `MODULE_REGISTERED` 事件自动更新菜单
- 从所有模块收集 `getTrayMenuItems()` 返回值
- 统一构建托盘菜单

#### ShortcutManager
```typescript
class ShortcutManager {
  - pluginManager: PluginManager
  - registeredShortcuts: Set<string>
  
  + registerShortcut(accelerator, callback): boolean
  + unregisterAll(): void
}
```

**设计原则**：
- 监听模块注册事件自动注册快捷键
- 检测快捷键冲突
- 应用退出时统一清理

## 模块层 (Modules)

### 模块接口 (IModule)

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

### 模块标准结构

```
packages/my-module/
├─ src/
│  ├─ types.ts              # 类型定义
│  ├─ MyService.ts          # 业务逻辑
│  ├─ MyModule.ts           # 模块入口
│  └─ index.ts              # 导出
├─ package.json
└─ tsconfig.json
```

### 模块开发规范

1. **职责分离**
   - `Service` 层：纯业务逻辑，不依赖 Electron
   - `Module` 层：Electron 集成，窗口管理

2. **声明式配置**
   ```typescript
   getTrayMenuItems() {
     return [{ label: '工具名', click: () => {} }];
   }
   ```

3. **独立性**
   - 模块间不直接依赖
   - 通过 Core 事件通信

## 应用层 (App)

### 职责
- 初始化 Core 系统
- 注册所有模块
- 创建主窗口
- 处理应用生命周期

### 启动流程

```
app.whenReady()
  ↓
创建 PluginManager
  ↓
创建 TrayManager
  ↓
创建 ShortcutManager
  ↓
注册模块 (registerModule)
  ↓
创建托盘 (createTray)
  ↓
创建主窗口
  ↓
应用就绪
```

## 数据流

### 模块注册流程
```
App.registerModule(module)
  ↓
PluginManager.registerModule()
  ↓
module.initialize()
  ↓
emit(MODULE_REGISTERED)
  ↓
TrayManager 更新菜单
  ↓
ShortcutManager 注册快捷键
```

### 用户交互流程
```
用户点击托盘菜单
  ↓
TrayManager 触发 click 回调
  ↓
Module.openWindow()
  ↓
创建 BrowserWindow
  ↓
加载 UI
```

## 扩展性设计

### 1. 新增模块
只需：
1. 创建 `packages/new-module`
2. 实现 `IModule` 接口
3. 在 `main.ts` 中注册

**无需修改 Core 代码**

### 2. 新增系统能力
例如添加"右键菜单管理器"：
1. 在 Core 中创建 `ContextMenuManager`
2. 在 `IModule` 中添加 `getContextMenuItems?()` 方法
3. 模块可选实现

### 3. 模块间通信
通过 PluginManager 事件：
```typescript
pluginManager.emit('custom-event', data);
pluginManager.on('custom-event', handler);
```

## 技术决策

### 为什么选择 Electron？
- ✅ 成熟的 Windows 支持
- ✅ 丰富的系统 API（托盘、快捷键、取色）
- ✅ Node.js 生态（调用系统命令）
- ⚠️ 体积较大（但工具型应用可接受）

### 为什么选择 pnpm workspace？
- ✅ 高效的依赖管理
- ✅ 原生 workspace 支持
- ✅ 快速安装

### 为什么不用桌面级右键菜单？
- ❌ 需要 Shell Extension（C++/.NET）
- ❌ 与 Electron 集成复杂
- ✅ 托盘右键 + 全局快捷键已足够

## 性能优化

1. **懒加载模块**
   - 模块窗口按需创建
   - 避免启动时创建所有窗口

2. **事件节流**
   - 托盘菜单更新防抖
   - 取色器采样节流

3. **资源清理**
   - 窗口关闭时销毁
   - 应用退出时统一清理

## 安全考虑

1. **进程权限**
   - 结束进程需要管理员权限提示
   - 敏感操作二次确认

2. **IPC 安全**
   - 主进程验证渲染进程请求
   - 避免任意命令执行

## 未来规划

- [ ] 模块热重载
- [ ] 配置持久化（JSON/SQLite）
- [ ] 模块市场（远程安装）
- [ ] 自动更新
- [ ] 性能监控
