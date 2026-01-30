# Toolbox Assistant v1.0.0

Windows 桌面工具箱助手首个正式版本！🎉

## ✨ 主要功能

### 🔌 端口管理器
- 快速查看所有占用的端口和进程信息
- 一键结束占用端口的进程
- 自动请求管理员权限处理系统进程
- 完美支持中文显示，无乱码问题
- 友好的错误提示和加载状态

### 🎨 取色器
- 全屏取色，完美支持多显示器
- 实时预览颜色和坐标
- 自动复制颜色值到剪贴板
- 高性能缓存机制，流畅无卡顿
- 支持手动和自动刷新屏幕截图

### 🧰 浮动工具栏
- 位于屏幕右下角，快速访问所有工具
- 优雅的收起/展开动画效果
- 一键退出应用（带确认对话框）
- 自动避开任务栏

### 🔄 自动更新
- 启动时自动检查更新（5秒后）
- 每小时定期检查一次
- 托盘菜单手动检查更新
- 后台下载，任务栏显示进度
- 下载完成后可选择立即安装或稍后安装
- 详细的日志输出，方便调试

### 🎯 快捷键

- `Ctrl+Shift+P` - 打开端口管理器
- `Ctrl+Shift+C` - 启动取色器

### 🎨 界面特色

- 自定义标题栏，隐藏系统边框
- 渐变紫色主题，现代化设计
- 流畅的动画效果
- 响应式布局

## 📥 安装方式

### 安装版（推荐）
下载 `Toolbox Assistant Setup 1.0.0.exe`，双击安装。

**特点：**
- 自动创建桌面快捷方式
- 自动创建开始菜单项
- 支持自动更新
- 可选择安装目录

### 便携版
下载 `ToolboxAssistant-Portable.exe`，直接运行。

**特点：**
- 无需安装
- 可放在 U 盘使用
- 不支持自动更新

## 💻 系统要求

- Windows 10 或更高版本
- 64 位系统
- 至少 200 MB 可用空间

## 🔧 技术栈

- Electron 28.3.3
- TypeScript 5.3.3
- electron-updater 6.7.3
- Monorepo 架构（pnpm workspace）

## 🐛 已知问题

- 首次启动可能需要几秒钟加载
- 某些杀毒软件可能误报（请添加信任）
- 取色器在某些高 DPI 显示器上可能需要调整

## 📖 使用文档

详细使用说明请查看仓库中的文档：
- [快速开始](https://github.com/itmowang/newTools/blob/master/QUICK_START.md)
- [使用指南](https://github.com/itmowang/newTools/blob/master/USAGE_GUIDE.md)
- [自动更新指南](https://github.com/itmowang/newTools/blob/master/AUTO_UPDATE_GUIDE.md)

## 🙏 反馈

如有问题或建议，请在 [Issues](https://github.com/itmowang/newTools/issues) 中反馈。

## 📝 更新日志

### v1.0.0 (2026-01-30)

**新功能：**
- ✨ 端口管理器：查看和管理端口占用
- ✨ 取色器：全屏取色工具
- ✨ 浮动工具栏：快速访问工具
- ✨ 自动更新：从 GitHub Releases 自动更新

**改进：**
- 🎨 优化界面设计，使用渐变紫色主题
- ⚡ 取色器性能优化，使用缓存机制
- 🔧 端口管理器自动请求管理员权限
- 📝 详细的日志输出和错误提示

**修复：**
- 🐛 修复端口管理器中文乱码问题
- 🐛 修复取色器卡顿问题
- 🐛 修复浮动工具栏位置计算问题
- 🐛 修复 AutoUpdater 打包后无法获取版本号的问题

---

**重要文件说明：**
- `Toolbox Assistant Setup 1.0.0.exe` - 安装程序（必需）
- `Toolbox Assistant Setup 1.0.0.exe.blockmap` - 自动更新校验文件（必需）
- `latest.yml` - 自动更新配置文件（必需）
- `ToolboxAssistant-Portable.exe` - 便携版（可选）

**注意：** 前三个文件是自动更新功能必需的，请务必一起上传！
