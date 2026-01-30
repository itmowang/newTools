# Toolbox Assistant v1.0.3

## 🐛 关键 Bug 修复

本版本修复了自动更新功能无法正常工作的问题。

## 🔧 修复内容

### 修复自动更新环境检测问题
- **问题：** 点击"检查更新"时提示"自动更新在开发模式下不可用"
- **原因：** 打包后的应用 `process.env.NODE_ENV` 未设置，导致被误判为开发环境
- **解决：** 使用 `app.isPackaged` 判断是否为打包后的应用
- **影响：** 修复后自动更新功能可以正常使用

## ✨ 功能特性

### 🔌 端口管理器
- 快速查看所有占用的端口和进程信息
- 一键结束占用端口的进程
- 自动请求管理员权限

### 🎨 取色器
- 全屏取色，支持多显示器
- 实时预览颜色
- 高性能缓存机制

### 🧰 浮动工具栏
- 右下角快速访问
- 优雅的动画效果

### 🔄 自动更新（已修复）
- ✅ 启动时自动检查更新
- ✅ 托盘菜单手动检查更新
- ✅ 后台下载，显示进度
- ✅ 支持立即安装或稍后安装

## 📥 安装方式

### 安装版（推荐）
下载 `Toolbox Assistant Setup 1.0.3.exe`，双击安装。

### 便携版
下载 `ToolboxAssistant-Portable.exe`，直接运行。

## 💻 系统要求

- Windows 10 或更高版本
- 64 位系统
- 至少 200 MB 可用空间

## 📝 更新日志

### v1.0.3 (2026-01-30)

**修复：**
- 🐛 修复自动更新环境检测问题
- 🐛 使用 `app.isPackaged` 替代 `process.env.NODE_ENV` 判断
- 🐛 添加详细的环境信息日志

### v1.0.2 (2026-01-30)

**修复：**
- 🐛 修复 AutoUpdater 启动错误

### v1.0.0 (2026-01-30)

**新功能：**
- ✨ 首个正式版本发布

## 🔄 从旧版本升级

### 从 v1.0.2 升级

1. **自动更新（推荐）**
   - 启动 v1.0.2 应用
   - 右键托盘图标 → 点击"检查更新"
   - 应该会检测到 v1.0.3 更新
   - 点击"立即下载"并安装

2. **手动更新**
   - 下载 v1.0.3 安装包
   - 运行安装程序覆盖旧版本

### 从 v1.0.0 升级

建议直接下载 v1.0.3 安装包手动安装，因为 v1.0.0 的自动更新功能有 bug。

## 🧪 测试自动更新

安装 v1.0.3 后：

1. **测试手动检查**
   - 右键托盘图标
   - 点击"检查更新"
   - 应该显示"正在检查更新..."对话框
   - 然后显示"已是最新版本"

2. **查看日志**（如果能看到控制台）
   ```
   🔍 Manual check for updates triggered
   📍 Current version: 1.0.3
   🌍 Is packaged: true
   🌍 Environment: not set
   🔍 Checking for updates...
   📍 Current version: 1.0.3
   🔗 Update server: GitHub Releases
   ✅ App is up to date: 1.0.3
   ```

## 🙏 反馈

如有问题或建议，请在 [Issues](https://github.com/itmowang/newTools/issues) 中反馈。

---

**重要文件说明：**
- `Toolbox Assistant Setup 1.0.3.exe` - 安装程序（必需）
- `Toolbox Assistant Setup 1.0.3.exe.blockmap` - 自动更新校验文件（必需）
- `latest.yml` - 自动更新配置文件（必需）
- `ToolboxAssistant-Portable.exe` - 便携版（可选）

**注意：** 前三个文件是自动更新功能必需的，请务必一起上传！
