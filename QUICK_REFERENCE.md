# ⚡ 快速参考

## 常用命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动应用
pnpm dev

# 启动已构建的应用
pnpm start

# 清理构建产物
pnpm clean

# 单独构建某个包
pnpm --filter @toolbox/core build

# 监听模式
pnpm --filter @toolbox/core dev
```

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+P` | 打开端口管理器 |
| `Ctrl+Shift+C` | 启动取色器 |

---

## 项目结构速查

```
toolbox-assistant/
├─ apps/desktop/          # 主应用
├─ packages/
│  ├─ core/              # 核心系统
│  ├─ port-manager/      # 端口管理
│  └─ color-picker/      # 取色器
├─ docs/                 # 文档
└─ scripts/              # 脚本
```

---

## 核心 API

### IModule 接口
```typescript
interface IModule {
  metadata: ModuleMetadata;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getTrayMenuItems?(): TrayMenuConfig[];
  getShortcuts?(): ShortcutConfig[];
  openWindow?(): BrowserWindow;
}
```

### 注册模块
```typescript
await pluginManager.registerModule(module);
```

### 托盘菜单
```typescript
getTrayMenuItems() {
  return [
    { label: '工具名', click: () => {} }
  ];
}
```

### 快捷键
```typescript
getShortcuts() {
  return [
    { 
      accelerator: 'CommandOrControl+Shift+X',
      callback: () => {}
    }
  ];
}
```

---

## 新增模块（3 步）

### 1. 创建模块
```bash
mkdir -p packages/my-tool/src
```

### 2. 实现接口
```typescript
export class MyToolModule implements IModule {
  metadata = { id: 'my-tool', name: '我的工具' };
  async initialize() {}
  async destroy() {}
}
```

### 3. 注册
```typescript
// apps/desktop/src/main.ts
await pluginManager.registerModule(new MyToolModule());
```

---

## 文档导航

| 文档 | 用途 |
|------|------|
| [README](./README.md) | 项目介绍 |
| [GETTING_STARTED](./docs/GETTING_STARTED.md) | 快速开始 |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | 架构设计 |
| [API](./docs/API.md) | API 文档 |
| [MODULE_DEVELOPMENT](./docs/MODULE_DEVELOPMENT.md) | 模块开发 |
| [FAQ](./docs/FAQ.md) | 常见问题 |
| [ROADMAP](./docs/ROADMAP.md) | 开发路线 |
| [CONTRIBUTING](./CONTRIBUTING.md) | 贡献指南 |

---

## 故障排除

### 应用无法启动
```bash
rm -rf node_modules dist
pnpm install
pnpm build
pnpm dev
```

### TypeScript 编译错误
```bash
pnpm build
```

### 快捷键不生效
- 检查是否与其他应用冲突
- 以管理员身份运行

---

## 包依赖关系

```
desktop
  ├─ @toolbox/core
  ├─ @toolbox/port-manager
  │    └─ @toolbox/core
  └─ @toolbox/color-picker
       └─ @toolbox/core
```

---

## 事件系统

```typescript
// 发出事件
pluginManager.emit('custom-event', data);

// 监听事件
pluginManager.on('custom-event', handler);

// 内置事件
CoreEvent.MODULE_REGISTERED
CoreEvent.MODULE_UNREGISTERED
CoreEvent.TRAY_MENU_UPDATE
CoreEvent.WINDOW_CREATED
```

---

## 调试技巧

### 日志输出
```typescript
console.log('✅ Success');
console.warn('⚠️ Warning');
console.error('❌ Error');
```

### 打开 DevTools
```typescript
window.webContents.openDevTools();
```

### VS Code 调试
```json
{
  "type": "node",
  "request": "launch",
  "name": "Electron Main",
  "runtimeExecutable": "electron",
  "program": "${workspaceFolder}/apps/desktop/dist/main.js"
}
```

---

## 性能指标

| 指标 | 数值 |
|------|------|
| 启动时间 | ~2-3s |
| 内存占用 | ~100MB |
| 托盘响应 | <100ms |
| 快捷键响应 | <50ms |

---

## 联系方式

- GitHub Issues: [提交问题]
- Email: [联系邮箱]
- 文档: [在线文档]
