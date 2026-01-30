# Toolbox Assistant v1.0.5

## 🐛 修复 404 错误

本版本修复了自动更新时出现 404 错误的问题。

## 🔧 修复内容

### 修复文件名不匹配导致的 404 错误
- **问题：** 自动更新时提示 "Cannot download ... status 404"
- **原因：** `latest.yml` 中的文件名与 GitHub Release 上传的文件名不一致
  - `latest.yml` 中：`Toolbox-Assistant-Setup-1.0.4.exe`（连字符）
  - 实际文件名：`Toolbox Assistant Setup 1.0.4.exe`（空格）
- **解决：** 配置 `artifactName` 统一使用连字符命名
- **影响：** 修复后自动更新可以正常下载文件

## ✨ 主要功能

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

### 🔄 自动更新（已完全修复）
- ✅ 启动时自动检查更新
- ✅ 托盘菜单手动检查更新
- ✅ 后台下载，显示进度
- ✅ 文件名匹配问题已修复

## 📥 安装方式

### 安装版（推荐）
下载 `Toolbox Assistant-Setup-1.0.5.exe`，双击安装。

**注意：** 文件名现在使用连字符 `-` 而不是空格。

### 便携版
下载 `ToolboxAssistant-Portable.exe`，直接运行。

## 💻 系统要求

- Windows 10 或更高版本
- 64 位系统
- 至少 200 MB 可用空间

## 📝 更新日志

### v1.0.5 (2026-01-30)
- 🐛 修复自动更新 404 错误
- 🐛 统一文件命名规则，使用连字符
- 🐛 配置 `artifactName` 确保文件名一致

### v1.0.4 (2026-01-30)
- 🎉 稳定版本发布

### v1.0.3 (2026-01-30)
- 🐛 修复环境检测问题

### v1.0.2 (2026-01-30)
- 🐛 修复启动错误

### v1.0.0 (2026-01-30)
- ✨ 首个正式版本

## 🔄 从旧版本升级

### 自动更新（推荐）

如果你已安装 v1.0.4 或更早版本：

1. 启动应用
2. 应该会自动检测到 v1.0.5 更新
3. 或者右键托盘图标 → 点击"检查更新"
4. 点击"立即下载"
5. 这次应该能正常下载，不会出现 404 错误
6. 下载完成后点击"立即重启"

### 手动更新

1. 下载 v1.0.5 安装包
2. 运行安装程序
3. 会自动覆盖旧版本

## 🧪 验证修复

安装 v1.0.5 后：

1. **测试手动检查**
   - 右键托盘图标
   - 点击"检查更新"
   - 应该显示"已是最新版本"
   - 不会出现 404 错误

2. **查看日志**
   ```
   🔍 Manual check for updates triggered
   📍 Current version: 1.0.5
   🌍 Is packaged: true
   🔍 Checking for updates...
   ✅ App is up to date: 1.0.5
   ```

## 📖 使用文档

详细使用说明请查看仓库中的文档：
- [快速开始](https://github.com/itmowang/newTools/blob/master/QUICK_START.md)
- [使用指南](https://github.com/itmowang/newTools/blob/master/USAGE_GUIDE.md)
- [自动更新指南](https://github.com/itmowang/newTools/blob/master/AUTO_UPDATE_GUIDE.md)

## 🙏 反馈

如有问题或建议，请在 [Issues](https://github.com/itmowang/newTools/issues) 中反馈。

---

**重要文件说明：**
- `Toolbox Assistant-Setup-1.0.5.exe` - 安装程序（必需）
- `Toolbox Assistant-Setup-1.0.5.exe.blockmap` - 自动更新校验文件（必需）
- `latest.yml` - 自动更新配置文件（必需）
- `ToolboxAssistant-Portable.exe` - 便携版（可选）

**注意：** 
1. 文件名现在使用连字符 `-` 命名
2. 前三个文件是自动更新功能必需的，请务必一起上传！
3. 上传时保持文件名不变

---

## 🎉 404 错误已修复！

这个版本修复了文件名不匹配的问题，自动更新功能现在可以正常下载文件了。
