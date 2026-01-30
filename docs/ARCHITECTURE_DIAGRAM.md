# 🎨 架构可视化

## 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Toolbox Assistant                        │
│                   (Electron Application)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Main Process (Node.js)                   │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │           ToolboxApp (主应用)                   │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐           │ │ │
│  │  │  │PluginManager │  │ TrayManager  │           │ │ │
│  │  │  └──────┬───────┘  └──────┬───────┘           │ │ │
│  │  │         │                  │                   │ │ │
│  │  │         │  ┌───────────────┴────────┐          │ │ │
│  │  │         │  │  ShortcutManager       │          │ │ │
│  │  │         │  └────────────────────────┘          │ │ │
│  │  └─────────┼─────────────────────────────────────┘ │ │
│  │            │                                        │ │
│  │  ┌─────────▼──────────────────────────────────┐    │ │
│  │  │         Module Registry                    │    │ │
│  │  │  ┌──────────────┐  ┌──────────────┐       │    │ │
│  │  │  │PortManager   │  │ColorPicker   │  ...  │    │ │
│  │  │  │   Module     │  │   Module     │       │    │ │
│  │  │  └──────┬───────┘  └──────┬───────┘       │    │ │
│  │  │         │                  │               │    │ │
│  │  │  ┌──────▼───────┐  ┌──────▼───────┐       │    │ │
│  │  │  │PortService   │  │ColorService  │       │    │ │
│  │  │  └──────────────┘  └──────────────┘       │    │ │
│  │  └────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Renderer Process (Chromium)               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │Main      │  │Port      │  │Color     │       │ │
│  │  │Window    │  │Manager   │  │Picker    │  ...  │ │
│  │  │          │  │Window    │  │Window    │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘       │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│System Tray  │      │Global       │      │Windows      │
│             │      │Shortcuts    │      │System APIs  │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## 模块生命周期

```
┌─────────────────────────────────────────────────────────┐
│                   Module Lifecycle                      │
└─────────────────────────────────────────────────────────┘

    new Module()
         │
         ▼
    ┌─────────┐
    │ Created │
    └────┬────┘
         │
         │ pluginManager.registerModule()
         ▼
    ┌─────────┐
    │initialize()│
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │Registered│◄──────┐
    └────┬────┘        │
         │             │
         │ getTrayMenuItems()
         │ getShortcuts()
         │             │
         ▼             │
    ┌─────────┐        │
    │ Active  │────────┘
    └────┬────┘
         │
         │ pluginManager.unregisterModule()
         ▼
    ┌─────────┐
    │destroy()│
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │Destroyed│
    └─────────┘
```

---

## 事件流

```
┌─────────────────────────────────────────────────────────┐
│                     Event Flow                          │
└─────────────────────────────────────────────────────────┘

User Action
    │
    ├─ Click Tray Menu
    │       │
    │       ▼
    │  TrayManager
    │       │
    │       ▼
    │  module.click()
    │       │
    │       ▼
    │  module.openWindow()
    │
    ├─ Press Shortcut
    │       │
    │       ▼
    │  ShortcutManager
    │       │
    │       ▼
    │  module.callback()
    │       │
    │       ▼
    │  module.openWindow()
    │
    └─ Module Registration
            │
            ▼
       PluginManager
            │
            ├─ emit('module:registered')
            │       │
            │       ├─► TrayManager.updateMenu()
            │       │
            │       └─► ShortcutManager.registerShortcuts()
            │
            └─ module.initialize()
```

---

## 数据流

```
┌─────────────────────────────────────────────────────────┐
│                     Data Flow                           │
└─────────────────────────────────────────────────────────┘

User Input
    │
    ▼
┌─────────────┐
│   Window    │
│   (UI)      │
└──────┬──────┘
       │
       │ IPC / Direct Call
       ▼
┌─────────────┐
│   Module    │
│  (Logic)    │
└──────┬──────┘
       │
       │ Method Call
       ▼
┌─────────────┐
│   Service   │
│ (Business)  │
└──────┬──────┘
       │
       │ System Call
       ▼
┌─────────────┐
│   System    │
│   (OS API)  │
└──────┬──────┘
       │
       │ Result
       ▼
┌─────────────┐
│   Service   │
└──────┬──────┘
       │
       │ Return
       ▼
┌─────────────┐
│   Module    │
└──────┬──────┘
       │
       │ Update
       ▼
┌─────────────┐
│   Window    │
│   (UI)      │
└─────────────┘
```

---

## 模块依赖关系

```
┌─────────────────────────────────────────────────────────┐
│                Module Dependencies                      │
└─────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Desktop    │
                    │     App      │
                    └───────┬──────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │     Core     │ │PortManager   │ │ColorPicker   │
    │              │ │              │ │              │
    │PluginManager │ │PortService   │ │ColorService  │
    │ TrayManager  │ │PortModule    │ │ColorModule   │
    │ShortcutMgr   │ │              │ │              │
    └──────────────┘ └──────┬───────┘ └──────┬───────┘
                            │               │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │     Core     │
                            │   (Types)    │
                            └──────────────┘
```

---

## 包结构

```
┌─────────────────────────────────────────────────────────┐
│                  Package Structure                      │
└─────────────────────────────────────────────────────────┘

toolbox-assistant/
│
├─ apps/
│  └─ desktop/                    # 主应用包
│     ├─ src/
│     │  └─ main.ts              # 应用入口
│     ├─ dist/                   # 构建输出
│     └─ package.json            # 依赖配置
│
├─ packages/
│  │
│  ├─ core/                      # 核心包
│  │  ├─ src/
│  │  │  ├─ PluginManager.ts    # 插件管理
│  │  │  ├─ TrayManager.ts      # 托盘管理
│  │  │  ├─ ShortcutManager.ts  # 快捷键管理
│  │  │  ├─ types.ts            # 类型定义
│  │  │  └─ index.ts            # 导出
│  │  ├─ dist/                  # 构建输出
│  │  └─ package.json
│  │
│  ├─ port-manager/              # 端口管理包
│  │  ├─ src/
│  │  │  ├─ PortService.ts      # 业务逻辑
│  │  │  ├─ PortManagerModule.ts # 模块入口
│  │  │  ├─ types.ts            # 类型定义
│  │  │  └─ index.ts            # 导出
│  │  ├─ dist/
│  │  └─ package.json
│  │
│  └─ color-picker/              # 取色器包
│     ├─ src/
│     │  ├─ ColorService.ts     # 业务逻辑
│     │  ├─ ColorPickerModule.ts # 模块入口
│     │  ├─ types.ts            # 类型定义
│     │  └─ index.ts            # 导出
│     ├─ dist/
│     └─ package.json
│
├─ scripts/                      # 脚本
│  └─ dev.js                    # 开发启动
│
├─ docs/                         # 文档
│  ├─ ARCHITECTURE.md
│  ├─ API.md
│  └─ ...
│
├─ pnpm-workspace.yaml          # workspace 配置
└─ package.json                 # 根配置
```

---

## 启动流程

```
┌─────────────────────────────────────────────────────────┐
│                  Startup Sequence                       │
└─────────────────────────────────────────────────────────┘

1. app.whenReady()
        │
        ▼
2. new ToolboxApp()
        │
        ├─► new PluginManager()
        ├─► new TrayManager(pluginManager)
        └─► new ShortcutManager(pluginManager)
        │
        ▼
3. toolboxApp.initialize()
        │
        ├─► registerModules()
        │       │
        │       ├─► new PortManagerModule()
        │       │       │
        │       │       └─► pluginManager.registerModule()
        │       │               │
        │       │               └─► module.initialize()
        │       │
        │       └─► new ColorPickerModule()
        │               │
        │               └─► pluginManager.registerModule()
        │                       │
        │                       └─► module.initialize()
        │
        ├─► trayManager.createTray()
        │       │
        │       └─► updateTrayMenu()
        │               │
        │               └─► collect module menu items
        │
        ├─► createMainWindow()
        │       │
        │       └─► new BrowserWindow()
        │
        └─► setupEventListeners()
                │
                └─► listen to plugin events
        │
        ▼
4. Application Ready ✅
```

---

## 模块交互

```
┌─────────────────────────────────────────────────────────┐
│                Module Interaction                       │
└─────────────────────────────────────────────────────────┘

┌──────────────┐
│PortManager   │
│   Module     │
└──────┬───────┘
       │
       │ getTrayMenuItems()
       │ getShortcuts()
       │
       ▼
┌──────────────┐         ┌──────────────┐
│PluginManager │◄────────┤ TrayManager  │
│              │         └──────────────┘
│  - modules   │
│  - events    │         ┌──────────────┐
│              │◄────────┤ShortcutMgr   │
└──────┬───────┘         └──────────────┘
       │
       │ getTrayMenuItems()
       │ getShortcuts()
       │
       ▼
┌──────────────┐
│ColorPicker   │
│   Module     │
└──────────────┘

Events:
  module:registered ──► TrayManager.updateMenu()
  module:registered ──► ShortcutManager.register()
  open-main-window ──► ToolboxApp.showWindow()
```

---

## 窗口管理

```
┌─────────────────────────────────────────────────────────┐
│                  Window Management                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┐
│ Main Window  │  (Always exists, can be hidden)
└──────┬───────┘
       │
       │ Shows tool list
       │ Manages modules
       │
       ▼
┌──────────────────────────────────────────────────────┐
│              Module Windows                          │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │Port Manager  │  │Color Picker  │  │  Other   │  │
│  │   Window     │  │   Window     │  │ Windows  │  │
│  │              │  │              │  │          │  │
│  │ - Singleton  │  │ - Transient  │  │   ...    │  │
│  │ - Reusable   │  │ - Auto-close │  │          │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└──────────────────────────────────────────────────────┘

Window Lifecycle:
  Create ──► Show ──► Focus ──► Hide ──► Close ──► Destroy
```

---

## 系统集成

```
┌─────────────────────────────────────────────────────────┐
│                 System Integration                      │
└─────────────────────────────────────────────────────────┘

Toolbox Assistant
        │
        ├─► System Tray
        │       │
        │       ├─ Icon
        │       ├─ Tooltip
        │       └─ Context Menu
        │
        ├─► Global Shortcuts
        │       │
        │       ├─ Ctrl+Shift+P
        │       ├─ Ctrl+Shift+C
        │       └─ ...
        │
        └─► Windows APIs
                │
                ├─ netstat (Port info)
                ├─ tasklist (Process info)
                ├─ taskkill (Kill process)
                └─ desktopCapturer (Screen capture)
```

这些可视化图表帮助理解项目的整体架构和各组件之间的关系！
