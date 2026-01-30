# 📋 项目总览

## 项目信息

**项目名称**: Toolbox Assistant  
**版本**: V1.0.0  
**类型**: Windows 桌面工具箱  
**架构**: Electron + Monorepo  
**语言**: TypeScript  

---

## 核心特性

### 🏗 架构设计
- **插件化架构** - 模块可插拔、独立开发
- **Monorepo 管理** - 统一依赖、独立构建
- **事件驱动** - 模块间松耦合通信
- **类型安全** - 完整的 TypeScript 支持

### 🖥 系统集成
- **系统托盘** - 常驻后台，快速访问
- **全局快捷键** - 任意位置快速启动
- **主窗口** - 工具管理中心
- **独立窗口** - 每个工具独立运行

### 🔧 当前工具
1. **端口管理器** - 查看和管理系统端口
2. **取色器** - 桌面任意位置取色

---

## 技术栈

### 核心技术
- **Electron 28** - 桌面应用框架
- **TypeScript 5.3** - 类型安全
- **Node.js 18+** - 运行时环境
- **pnpm workspace** - Monorepo 管理

### 系统能力
- `child_process` - 系统命令调用
- `desktopCapturer` - 屏幕截图
- `globalShortcut` - 全局快捷键
- `Tray` - 系统托盘

---

## 项目结构

```
toolbox-assistant/
├─ apps/
│  └─ desktop/              # 主应用
│     ├─ src/
│     │  └─ main.ts         # 应用入口
│     ├─ dist/              # 构建输出
│     ├─ package.json
│     └─ tsconfig.json
│
├─ packages/
│  ├─ core/                 # 核心系统
│  │  ├─ src/
│  │  │  ├─ PluginManager.ts
│  │  │  ├─ TrayManager.ts
│  │  │  ├─ ShortcutManager.ts
│  │  │  ├─ types.ts
│  │  │  └─ index.ts
│  │  ├─ dist/
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  ├─ port-manager/         # 端口管理模块
│  │  ├─ src/
│  │  │  ├─ types.ts
│  │  │  ├─ PortService.ts
│  │  │  ├─ PortManagerModule.ts
│  │  │  └─ index.ts
│  │  ├─ dist/
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  │
│  └─ color-picker/         # 取色器模块
│     ├─ src/
│     │  ├─ types.ts
│     │  ├─ ColorService.ts
│     │  ├─ ColorPickerModule.ts
│     │  └─ index.ts
│     ├─ dist/
│     ├─ package.json
│     └─ tsconfig.json
│
├─ scripts/
│  └─ dev.js                # 开发启动脚本
│
├─ docs/
│  ├─ ARCHITECTURE.md       # 架构设计
│  ├─ API.md                # API 文档
│  ├─ MODULE_DEVELOPMENT.md # 模块开发指南
│  ├─ GETTING_STARTED.md    # 快速开始
│  ├─ ROADMAP.md            # 开发路线图
│  ├─ FAQ.md                # 常见问题
│  └─ PROJECT_OVERVIEW.md   # 项目总览
│
├─ pnpm-workspace.yaml      # pnpm 工作区配置
├─ package.json             # 根配置
├─ .gitignore
└─ README.md
```

---

## 核心模块说明

### Core (@toolbox/core)
**职责**: 提供基础设施和模块管理

**核心类**:
- `PluginManager` - 模块生命周期管理
- `TrayManager` - 系统托盘管理
- `ShortcutManager` - 全局快捷键管理
- `IModule` - 模块标准接口

**导出**:
```typescript
export { 
  PluginManager, 
  TrayManager, 
  ShortcutManager,
  IModule,
  ModuleMetadata,
  TrayMenuConfig,
  ShortcutConfig,
  CoreEvent
}
```

### Port Manager (@toolbox/port-manager)
**职责**: 端口管理功能

**核心类**:
- `PortService` - 端口查询和进程管理
- `PortManagerModule` - 模块入口

**功能**:
- 查询所有端口
- 获取进程信息
- 结束进程
- 搜索端口

### Color Picker (@toolbox/color-picker)
**职责**: 取色功能

**核心类**:
- `ColorService` - 取色逻辑
- `ColorPickerModule` - 模块入口

**功能**:
- 桌面取色
- 颜色格式转换
- 剪贴板复制
- 预览显示

---

## 数据流

### 应用启动流程
```
1. Electron app.whenReady()
2. 创建 ToolboxApp 实例
3. 初始化 PluginManager
4. 初始化 TrayManager
5. 初始化 ShortcutManager
6. 注册所有模块
7. 创建系统托盘
8. 创建主窗口
9. 应用就绪
```

### 模块注册流程
```
1. new PortManagerModule()
2. pluginManager.registerModule(module)
3. module.initialize()
4. emit('module:registered')
5. TrayManager 更新菜单
6. ShortcutManager 注册快捷键
```

### 用户交互流程
```
1. 用户点击托盘菜单 / 按快捷键
2. 触发模块回调
3. module.openWindow()
4. 创建 BrowserWindow
5. 加载 UI
6. 用户操作
7. 调用 Service 层
8. 返回结果
```

---

## 开发工作流

### 日常开发
```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发模式
pnpm dev

# 单独构建某个包
pnpm --filter @toolbox/core build

# 监听模式
pnpm --filter @toolbox/core dev
```

### 新增模块
```bash
# 1. 创建模块目录
mkdir -p packages/new-module/src

# 2. 创建配置文件
# package.json, tsconfig.json

# 3. 实现模块接口
# src/NewModule.ts

# 4. 在主应用注册
# apps/desktop/src/main.ts

# 5. 构建测试
pnpm build
pnpm dev
```

---

## 扩展点

### 1. 新增工具模块
- 实现 `IModule` 接口
- 在主应用中注册
- 无需修改 Core

### 2. 新增系统能力
- 在 Core 中添加新的 Manager
- 在 `IModule` 中添加可选方法
- 模块按需实现

### 3. UI 组件库
- 创建 `@toolbox/ui-components`
- 封装通用组件
- 模块复用

### 4. 配置系统
- 创建 `ConfigManager`
- 持久化配置
- 模块配置隔离

---

## 性能指标

### 启动时间
- 冷启动: ~2-3s
- 热启动: ~1s

### 内存占用
- 基础: ~100MB
- 单模块: +20-50MB

### 响应时间
- 托盘菜单: <100ms
- 快捷键: <50ms
- 窗口打开: <200ms

---

## 质量保证

### 代码规范
- TypeScript strict 模式
- ESLint 检查
- 统一代码风格

### 错误处理
- try-catch 包裹异步操作
- 日志输出
- 用户友好提示

### 资源管理
- 窗口关闭时清理
- 应用退出时统一清理
- 避免内存泄漏

---

## 文档体系

1. **README.md** - 项目介绍和快速开始
2. **ARCHITECTURE.md** - 架构设计详解
3. **API.md** - API 参考文档
4. **MODULE_DEVELOPMENT.md** - 模块开发指南
5. **GETTING_STARTED.md** - 新手入门
6. **ROADMAP.md** - 开发路线图
7. **FAQ.md** - 常见问题
8. **PROJECT_OVERVIEW.md** - 项目总览（本文档）

---

## 贡献指南

### 提交规范
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

### PR 流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 通过测试
5. 提交 PR
6. Code Review
7. 合并

---

## 许可证

MIT License

---

## 联系方式

- GitHub: [项目地址]
- Issues: [问题反馈]
- Email: [联系邮箱]
