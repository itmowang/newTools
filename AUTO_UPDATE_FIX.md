# 自动更新功能修复说明

## 修复内容

### 问题
托盘菜单的"检查更新"功能无法正确触发自动更新检查。之前的实现尝试使用 IPC 消息和 app.emit，但这些方法无法正确连接到 AutoUpdater 实例。

### 解决方案

#### 1. 修复 TrayManager.ts
将托盘菜单的"检查更新"点击事件改为通过 PluginManager 的事件系统触发：

```typescript
{
  label: '🔄 检查更新',
  click: () => {
    this.pluginManager.emit('check-for-updates');
  }
}
```

#### 2. 修复 main.ts
在 `setupEventListeners()` 中添加对 'check-for-updates' 事件的监听：

```typescript
// 监听检查更新事件
this.pluginManager.on('check-for-updates', () => {
  this.autoUpdater.manualCheckForUpdates();
});
```

同时移除了重复的 IPC 监听器，并修复了 'window-all-closed' 事件的未使用参数警告。

## 工作流程

1. 用户右键点击系统托盘图标
2. 点击"🔄 检查更新"菜单项
3. TrayManager 通过 PluginManager 发出 'check-for-updates' 事件
4. main.ts 中的事件监听器接收到事件
5. 调用 `autoUpdater.manualCheckForUpdates()`
6. AutoUpdater 执行更新检查

## 测试方法

### 开发模式测试
```bash
pnpm run dev
```

1. 应用启动后，右键点击托盘图标
2. 点击"检查更新"
3. 应该弹出对话框提示"自动更新在开发模式下不可用"

### 生产模式测试
```bash
pnpm run build
cd apps/desktop
pnpm run dist
```

1. 安装打包后的应用
2. 右键点击托盘图标
3. 点击"检查更新"
4. 应该开始检查 GitHub Releases 是否有新版本

## 相关文件

- `packages/core/src/TrayManager.ts` - 托盘菜单实现
- `apps/desktop/src/main.ts` - 主应用入口，事件监听
- `apps/desktop/src/AutoUpdater.ts` - 自动更新逻辑

## 技术细节

### 为什么使用 PluginManager 事件系统？

1. **统一的事件管理**: PluginManager 已经是应用的核心事件总线
2. **类型安全**: 事件名称可以集中管理
3. **解耦**: TrayManager 不需要直接引用 AutoUpdater
4. **可扩展**: 其他模块也可以监听或触发更新检查

### 事件流程图

```
用户点击托盘菜单
    ↓
TrayManager.click()
    ↓
pluginManager.emit('check-for-updates')
    ↓
main.ts 监听器接收事件
    ↓
autoUpdater.manualCheckForUpdates()
    ↓
electron-updater 检查 GitHub Releases
```

## 下一步

1. 配置 GitHub 仓库信息（见 AUTO_UPDATE_GUIDE.md）
2. 生成 GitHub Token
3. 设置环境变量
4. 发布第一个版本到 GitHub Releases
5. 测试完整的更新流程

## 已完成功能

✅ 启动时自动检查更新（5秒后）
✅ 定期检查更新（每小时）
✅ 托盘菜单手动检查更新
✅ 发现新版本后询问用户
✅ 下载进度显示
✅ 下载完成后询问安装
✅ 退出时自动安装
✅ 开发模式禁用更新

## 编译状态

✅ 所有包编译成功
✅ 无 TypeScript 错误
✅ 无 ESLint 警告
