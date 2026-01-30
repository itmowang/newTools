# 🚀 从这里开始

欢迎使用 **Toolbox Assistant** - Windows 桌面工具箱助手！

---

## 📖 5 分钟快速上手

### 1️⃣ 安装依赖（1 分钟）

```bash
# 确保已安装 Node.js 18+ 和 pnpm
pnpm install
```

### 2️⃣ 构建项目（1 分钟）

```bash
pnpm build
```

### 3️⃣ 启动应用（1 分钟）

```bash
pnpm dev
```

### 4️⃣ 开始使用（2 分钟）

应用启动后：

1. **查看系统托盘** - 右下角找到应用图标
2. **右键托盘图标** - 查看可用工具
3. **尝试快捷键**：
   - `Ctrl+Shift+P` - 打开端口管理器
   - `Ctrl+Shift+C` - 启动取色器
4. **打开主窗口** - 查看所有工具

---

## 🎯 你想做什么？

### 👤 我是用户，想使用工具

➡️ 阅读 [快速开始指南](./docs/GETTING_STARTED.md)

**快速参考**：
- 系统托盘：右键查看所有工具
- 端口管理：`Ctrl+Shift+P`
- 取色器：`Ctrl+Shift+C`

### 👨‍💻 我是开发者，想开发新模块

➡️ 阅读 [模块开发指南](./docs/MODULE_DEVELOPMENT.md)

**3 步创建模块**：
1. 创建模块目录和文件
2. 实现 `IModule` 接口
3. 在主应用中注册

### 🏗 我想了解架构设计

➡️ 阅读 [架构设计文档](./docs/ARCHITECTURE.md)

**核心概念**：
- 插件化架构
- 事件驱动
- 模块独立
- 统一管理

### 🔍 我想查看 API 文档

➡️ 阅读 [API 文档](./docs/API.md)

**核心 API**：
- `IModule` - 模块接口
- `PluginManager` - 插件管理
- `TrayManager` - 托盘管理
- `ShortcutManager` - 快捷键管理

### ❓ 我遇到了问题

➡️ 查看 [常见问题](./docs/FAQ.md)

**常见问题**：
- 应用无法启动
- 快捷键不生效
- 端口管理器无法结束进程
- 取色器不准确

### 🤝 我想贡献代码

➡️ 阅读 [贡献指南](./CONTRIBUTING.md)

**贡献流程**：
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

---

## 📚 完整文档导航

### 入门文档
- [README](./README.md) - 项目介绍
- [快速开始](./docs/GETTING_STARTED.md) - 新手入门
- [快速参考](./QUICK_REFERENCE.md) - 常用命令和 API

### 开发文档
- [架构设计](./docs/ARCHITECTURE.md) - 详细架构说明
- [架构图](./docs/ARCHITECTURE_DIAGRAM.md) - 可视化架构
- [API 文档](./docs/API.md) - API 参考
- [模块开发](./docs/MODULE_DEVELOPMENT.md) - 开发新模块

### 项目文档
- [项目总览](./docs/PROJECT_OVERVIEW.md) - 全面了解项目
- [实施总结](./IMPLEMENTATION_SUMMARY.md) - 完成情况
- [检查清单](./CHECKLIST.md) - 功能清单
- [开发路线](./docs/ROADMAP.md) - 未来规划

### 其他文档
- [常见问题](./docs/FAQ.md) - 问题解答
- [贡献指南](./CONTRIBUTING.md) - 如何贡献

---

## 🛠 常用命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发模式
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

## 🎨 项目特色

### ✨ 插件化架构
- 模块可插拔
- 独立开发
- 统一管理

### 🖥 系统集成
- 系统托盘常驻
- 全局快捷键
- 原生体验

### 🔧 当前工具
- **端口管理器** - 查看和管理系统端口
- **取色器** - 桌面任意位置取色

### 📦 Monorepo
- 统一依赖管理
- 独立构建
- 高效开发

---

## 🚀 下一步

### 立即体验
```bash
pnpm install && pnpm build && pnpm dev
```

### 开发新模块
参考 [模块开发指南](./docs/MODULE_DEVELOPMENT.md)

### 了解架构
阅读 [架构设计文档](./docs/ARCHITECTURE.md)

### 查看路线图
了解 [未来规划](./docs/ROADMAP.md)

---

## 💡 提示

- 📖 **文档齐全** - 遇到问题先查文档
- 🔍 **快速参考** - 常用命令看 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- ❓ **常见问题** - 问题解答看 [FAQ.md](./docs/FAQ.md)
- 🤝 **欢迎贡献** - 提交 Issue 或 PR

---

## 📞 获取帮助

- **GitHub Issues** - 报告 Bug 或提出建议
- **文档** - 查看完整文档
- **社区** - 加入讨论

---

**准备好了吗？开始你的工具箱之旅！** 🎉

```bash
pnpm install && pnpm build && pnpm dev
```
