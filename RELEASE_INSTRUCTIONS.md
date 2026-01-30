# 发布到 GitHub Releases 指南

## 📦 需要上传的文件

在 `apps/desktop/release` 目录中，需要上传以下 3 个文件：

1. ✅ `Toolbox Assistant Setup 1.0.0.exe` - 安装程序（145 MB）
2. ✅ `Toolbox Assistant Setup 1.0.0.exe.blockmap` - 更新校验文件
3. ✅ `latest.yml` - 自动更新配置文件

**注意：** `ToolboxAssistant-Portable.exe` 是便携版，可选上传。

## 🚀 发布步骤

### 方法 1：通过 GitHub 网页界面（推荐）

1. **访问仓库 Releases 页面**
   ```
   https://github.com/itmowang/newTools/releases
   ```

2. **创建新 Release**
   - 点击 "Create a new release" 或 "Draft a new release"

3. **填写 Release 信息**
   - **Tag version**: `v1.0.0` （已存在，直接选择）
   - **Release title**: `Toolbox Assistant v1.0.0`
   - **Description**: 复制下面的发布说明

4. **上传文件**
   - 将以下 3 个文件拖拽到 "Attach binaries" 区域：
     - `Toolbox Assistant Setup 1.0.0.exe`
     - `Toolbox Assistant Setup 1.0.0.exe.blockmap`
     - `latest.yml`
   - （可选）上传 `ToolboxAssistant-Portable.exe`

5. **发布**
   - 点击 "Publish release"

### 方法 2：使用 GitHub CLI

如果你安装了 GitHub CLI (`gh`)：

```bash
# 创建 Release 并上传文件
gh release create v1.0.0 ^
  "apps/desktop/release/Toolbox Assistant Setup 1.0.0.exe" ^
  "apps/desktop/release/Toolbox Assistant Setup 1.0.0.exe.blockmap" ^
  "apps/desktop/release/latest.yml" ^
  --title "Toolbox Assistant v1.0.0" ^
  --notes-file RELEASE_NOTES_V1.md
```

## 📝 发布说明（复制到 Release Description）

```markdown
# Toolbox Assistant v1.0.0

Windows 桌面工具箱助手首个正式版本！🎉

## ✨ 主要功能

### 🔌 端口管理器
- 快速查看所有占用的端口
- 一键结束占用端口的进程
- 自动请求管理员权限
- 支持中文显示，无乱码

### 🎨 取色器
- 全屏取色，支持多显示器
- 实时预览颜色
- 自动复制到剪贴板
- 高性能缓存机制

### 🧰 浮动工具栏
- 右下角快速访问
- 收起/展开动画
- 一键退出应用

### 🔄 自动更新
- 启动时自动检查更新
- 每小时定期检查
- 托盘菜单手动检查
- 后台下载，无感更新

## 🎯 快捷键

- `Ctrl+Shift+P` - 打开端口管理器
- `Ctrl+Shift+C` - 启动取色器

## 📥 安装方式

### 安装版（推荐）
下载 `Toolbox Assistant Setup 1.0.0.exe`，双击安装。

特点：
- 自动创建桌面快捷方式
- 自动创建开始菜单项
- 支持自动更新
- 可选择安装目录

### 便携版
下载 `ToolboxAssistant-Portable.exe`，直接运行。

特点：
- 无需安装
- 可放在 U 盘使用
- 不支持自动更新

## 💻 系统要求

- Windows 10 或更高版本
- 64 位系统
- 至少 200 MB 可用空间

## 🐛 已知问题

- 首次启动可能需要几秒钟加载
- 某些杀毒软件可能误报（请添加信任）

## 📖 使用文档

详细使用说明请查看仓库中的文档：
- [快速开始](https://github.com/itmowang/newTools/blob/master/QUICK_START.md)
- [使用指南](https://github.com/itmowang/newTools/blob/master/USAGE_GUIDE.md)
- [自动更新指南](https://github.com/itmowang/newTools/blob/master/AUTO_UPDATE_GUIDE.md)

## 🙏 反馈

如有问题或建议，请在 [Issues](https://github.com/itmowang/newTools/issues) 中反馈。

---

**文件说明：**
- `Toolbox Assistant Setup 1.0.0.exe` - 安装程序
- `Toolbox Assistant Setup 1.0.0.exe.blockmap` - 自动更新校验文件（必须）
- `latest.yml` - 自动更新配置文件（必须）
- `ToolboxAssistant-Portable.exe` - 便携版（可选）
```

## ⚠️ 重要提示

### 文件命名问题

`latest.yml` 中的文件名是 `Toolbox-Assistant-Setup-1.0.0.exe`（带连字符），但实际文件名是 `Toolbox Assistant Setup 1.0.0.exe`（带空格）。

**上传时请确保：**
1. 上传的文件名保持原样（带空格）
2. GitHub 会自动处理 URL 编码

或者，你可以重命名文件以匹配 `latest.yml`：
```bash
# 在 apps/desktop/release 目录执行
ren "Toolbox Assistant Setup 1.0.0.exe" "Toolbox-Assistant-Setup-1.0.0.exe"
ren "Toolbox Assistant Setup 1.0.0.exe.blockmap" "Toolbox-Assistant-Setup-1.0.0.exe.blockmap"
```

然后更新 `latest.yml` 或保持原样上传。

## ✅ 验证发布

发布完成后，访问：
```
https://github.com/itmowang/newTools/releases/tag/v1.0.0
```

确认：
- ✅ 3 个必需文件都已上传
- ✅ 文件可以正常下载
- ✅ Release 说明清晰完整

## 🔄 测试自动更新

1. 下载并安装 v1.0.0
2. 修改版本号为 v1.0.1
3. 重新构建并发布
4. 运行 v1.0.0 应用
5. 应该会自动检测到 v1.0.1 更新

---

**当前状态：**
- ✅ 代码已推送到 GitHub
- ✅ Tag v1.0.0 已创建
- ✅ 安装包已构建
- ⏳ 等待手动上传到 GitHub Releases
