# 自动更新功能使用指南

## 功能说明

应用已集成自动更新功能，可以从 GitHub Releases 自动检查和下载更新。

## 工作原理

1. **启动检查**: 应用启动 5 秒后自动检查更新
2. **定期检查**: 每小时自动检查一次更新
3. **手动检查**: 右键托盘图标 → "检查更新"
4. **自动下载**: 发现新版本后询问用户是否下载
5. **自动安装**: 下载完成后询问用户是否立即安装

## 配置步骤

### 1. 更新 GitHub 仓库信息

编辑 `apps/desktop/package.json`，修改 `publish` 配置：

```json
"publish": [
  {
    "provider": "github",
    "owner": "YOUR_GITHUB_USERNAME",  // 改成你的 GitHub 用户名
    "repo": "toolbox-assistant"        // 改成你的仓库名
  }
]
```

### 2. 生成 GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token

### 3. 设置环境变量

在项目根目录创建 `.env` 文件：

```bash
GH_TOKEN=your_github_token_here
```

或者在命令行设置：

**Windows (PowerShell)**:
```powershell
$env:GH_TOKEN="your_github_token_here"
```

**Windows (CMD)**:
```cmd
set GH_TOKEN=your_github_token_here
```

### 4. 发布新版本

#### 步骤 1: 更新版本号

编辑 `apps/desktop/package.json`：

```json
{
  "version": "1.0.1"  // 增加版本号
}
```

#### 步骤 2: 构建并发布

```bash
# 构建应用
pnpm run build

# 打包并发布到 GitHub
cd apps/desktop
pnpm run dist -- --publish always
```

这会：
1. 打包应用
2. 创建 GitHub Release
3. 上传安装包到 Release

#### 步骤 3: 编辑 Release 说明

访问 GitHub Releases 页面，编辑发布说明：

```markdown
## 新功能
- ✨ 添加了 XXX 功能
- 🐛 修复了 XXX 问题

## 改进
- ⚡ 优化了 XXX 性能
```

## 用户体验

### 发现新版本

```
┌─────────────────────────────────┐
│ 发现新版本                       │
├─────────────────────────────────┤
│ 发现新版本 1.0.1                 │
│                                 │
│ 是否立即下载更新？               │
│                                 │
│  [立即下载]  [稍后提醒]         │
└─────────────────────────────────┘
```

### 下载进度

- 窗口标题栏显示进度条
- 控制台显示下载百分比

### 下载完成

```
┌─────────────────────────────────┐
│ 更新已下载                       │
├─────────────────────────────────┤
│ 新版本 1.0.1 已下载完成          │
│                                 │
│ 应用将在退出后自动安装更新。     │
│ 是否立即重启安装？               │
│                                 │
│  [立即重启]  [稍后重启]         │
└─────────────────────────────────┘
```

## 测试自动更新

### 本地测试

1. 修改版本号为 `1.0.0`
2. 打包应用
3. 安装应用
4. 修改版本号为 `1.0.1`
5. 发布到 GitHub
6. 运行已安装的应用
7. 应该会检测到新版本

### 发布流程

```bash
# 1. 更新版本号
# 编辑 apps/desktop/package.json

# 2. 提交代码
git add .
git commit -m "chore: bump version to 1.0.1"
git push

# 3. 构建
pnpm run build

# 4. 发布
cd apps/desktop
pnpm run dist -- --publish always
```

## 版本号规范

遵循语义化版本 (Semantic Versioning):

- **主版本号** (Major): 不兼容的 API 修改
  - 例如: 1.0.0 → 2.0.0
  
- **次版本号** (Minor): 向下兼容的功能性新增
  - 例如: 1.0.0 → 1.1.0
  
- **修订号** (Patch): 向下兼容的问题修正
  - 例如: 1.0.0 → 1.0.1

## 自动更新配置

### 检查频率

在 `AutoUpdater.ts` 中配置：

```typescript
// 启动后延迟检查
setTimeout(() => {
  this.checkForUpdates();
}, 5000); // 5 秒

// 定期检查间隔
setInterval(() => {
  this.checkForUpdates();
}, 60 * 60 * 1000); // 1 小时
```

### 下载行为

```typescript
autoUpdater.autoDownload = false;  // 不自动下载，先询问
autoUpdater.autoInstallOnAppQuit = true;  // 退出时自动安装
```

## 禁用自动更新

如果需要禁用自动更新：

### 方法 1: 注释代码

在 `apps/desktop/src/main.ts` 中注释：

```typescript
// 启动定期检查更新
// this.autoUpdater.startPeriodicCheck();
```

### 方法 2: 环境变量

```typescript
if (process.env.DISABLE_AUTO_UPDATE !== 'true') {
  this.autoUpdater.startPeriodicCheck();
}
```

## 常见问题

### Q: 开发模式下会检查更新吗？

A: 不会。自动更新只在生产环境（打包后的应用）中启用。

### Q: 如何强制用户更新？

A: 修改 `AutoUpdater.ts`：

```typescript
autoUpdater.autoDownload = true;  // 自动下载
// 下载完成后强制安装
autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall(false, true);
});
```

### Q: 更新失败怎么办？

A: 应用会显示错误对话框，用户可以：
1. 稍后重试
2. 手动从 GitHub 下载
3. 联系技术支持

### Q: 如何回滚版本？

A: 
1. 从 GitHub Releases 下载旧版本
2. 卸载当前版本
3. 安装旧版本

## 发布检查清单

- [ ] 更新版本号
- [ ] 更新 CHANGELOG
- [ ] 测试所有功能
- [ ] 构建应用
- [ ] 发布到 GitHub
- [ ] 编辑 Release 说明
- [ ] 测试自动更新
- [ ] 通知用户

## 相关文件

- `apps/desktop/src/AutoUpdater.ts` - 自动更新逻辑
- `apps/desktop/package.json` - 版本号和发布配置
- `packages/core/src/TrayManager.ts` - 托盘菜单（检查更新）

## 参考资料

- [electron-updater 文档](https://www.electron.build/auto-update)
- [electron-builder 文档](https://www.electron.build/)
- [语义化版本](https://semver.org/lang/zh-CN/)
