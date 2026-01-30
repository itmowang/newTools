# 重新打包指南

## ⚠️ 文件被占用问题

如果打包时遇到 "The process cannot access the file" 错误，说明有进程正在使用 release 目录中的文件。

## 🔧 解决方法

### 方法 1：手动关闭所有进程（推荐）

1. **打开任务管理器** (`Ctrl+Shift+Esc`)
2. **查找并结束以下进程：**
   - `Toolbox Assistant.exe`
   - `electron.exe`
   - 任何相关的进程

3. **重新打包：**
   ```bash
   cd apps/desktop
   pnpm run dist
   ```

### 方法 2：删除 release 目录

1. **手动删除 release 目录：**
   ```
   apps/desktop/release
   ```
   
   如果无法删除，使用 Unlocker 工具或重启电脑。

2. **重新打包：**
   ```bash
   cd apps/desktop
   pnpm run dist
   ```

### 方法 3：重启电脑（最彻底）

1. 重启电脑
2. 不要启动任何 Toolbox Assistant 相关程序
3. 直接打包：
   ```bash
   pnpm run build
   cd apps/desktop
   pnpm run dist
   ```

## ✅ 改进内容已完成

我已经对自动更新功能做了以下改进：

### 1. 更详细的日志输出
```typescript
console.log('🔍 Manual check for updates triggered');
console.log('📍 Current version:', version);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('✨ Update available:', info.version);
console.log('📦 Release date:', info.releaseDate);
```

### 2. 优化的对话框文案
- 显示当前版本和新版本对比
- 更清晰的操作提示
- 添加"已是最新版本"提示

### 3. 改进的错误处理
- 显示详细错误信息
- 提供解决建议
- 记录错误堆栈

### 4. 用户操作日志
```typescript
console.log('📥 User chose to download update');
console.log('⏭️ User chose to skip update');
console.log('🔄 User chose to restart and install');
```

## 📦 打包完成后

打包成功后，你会在 `apps/desktop/release` 目录看到：

```
release/
├── Toolbox Assistant Setup 1.0.0.exe  (安装程序)
├── Toolbox Assistant Setup 1.0.0.exe.blockmap  (校验文件)
├── ToolboxAssistant-Portable.exe  (便携版)
└── latest.yml  (更新配置)
```

## 🧪 测试步骤

1. **安装应用**
   - 双击 `Toolbox Assistant Setup 1.0.0.exe`
   - 完成安装

2. **测试手动检查更新**
   - 启动应用
   - 右键托盘图标
   - 点击 "🔄 检查更新"
   - 应该显示 "已是最新版本"

3. **查看控制台日志**
   - 观察详细的日志输出
   - 确认版本号正确
   - 确认更新服务器连接正常

4. **测试自动检查**
   - 启动应用
   - 等待 5 秒
   - 应该自动检查更新

## 📝 测试清单

- [ ] 关闭所有 Toolbox Assistant 进程
- [ ] 成功打包应用
- [ ] 安装新打包的应用
- [ ] 测试手动检查更新
- [ ] 查看控制台日志
- [ ] 确认对话框文案正确
- [ ] 测试自动检查更新

## 🎯 下一步

打包成功后：

1. 安装并测试应用
2. 确认更新逻辑正常工作
3. 如果一切正常，上传到 GitHub Releases
4. 修改版本号为 1.0.1 测试真实更新流程

详细测试步骤见 `TEST_AUTO_UPDATE.md`
