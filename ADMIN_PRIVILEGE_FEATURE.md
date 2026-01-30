# 管理员权限提升功能

## 功能说明

当用户尝试结束需要管理员权限的进程时，系统会自动请求管理员权限。

## 实现原理

### 1. 两步尝试策略

```typescript
async killProcess(pid: number) {
  try {
    // 第一步：尝试普通权限
    await execAsync(`taskkill /F /PID ${pid}`);
    return { success: true };
  } catch (error) {
    // 检查是否是权限问题
    if (errorMessage.includes('拒绝访问') || 
        errorMessage.includes('Access is denied')) {
      
      // 第二步：使用管理员权限重试
      const command = `powershell -Command "Start-Process taskkill -ArgumentList '/F','/PID','${pid}' -Verb RunAs -Wait"`;
      await execAsync(command);
      return { success: true };
    }
  }
}
```

### 2. PowerShell 管理员提升

使用 Windows PowerShell 的 `Start-Process -Verb RunAs` 命令：

```powershell
Start-Process taskkill -ArgumentList '/F','/PID','12345' -Verb RunAs -Wait
```

**参数说明**:
- `Start-Process`: 启动新进程
- `taskkill`: 要执行的命令
- `-ArgumentList`: 传递给 taskkill 的参数
- `-Verb RunAs`: 以管理员身份运行（触发 UAC 提示）
- `-Wait`: 等待进程完成

### 3. UAC 提示

当执行管理员命令时，Windows 会显示 UAC（用户账户控制）提示：

```
用户账户控制
你要允许此应用对你的设备进行更改吗？

Windows PowerShell
已验证的发布者: Microsoft Windows

[是(Y)]  [否(N)]
```

用户点击"是"后，命令会以管理员权限执行。

## 用户体验流程

### 场景 1: 普通进程（无需管理员权限）

1. 用户点击"结束进程"按钮
2. 显示确认对话框："确定要结束进程 12345 吗？"
3. 用户点击"确定"
4. 显示加载提示："正在结束进程..."
5. 进程成功结束
6. 显示成功提示："✅ 进程已成功结束"
7. 自动刷新端口列表

### 场景 2: 系统进程（需要管理员权限）

1. 用户点击"结束进程"按钮（例如 PID 80 的系统服务）
2. 显示确认对话框："确定要结束进程 80 吗？"
3. 用户点击"确定"
4. 显示加载提示："正在结束进程..."
5. 第一次尝试失败（权限不足）
6. 自动触发 UAC 提示
7. 用户在 UAC 对话框中点击"是"
8. 以管理员权限重新执行
9. 进程成功结束
10. 显示成功提示："✅ 进程已成功结束"
11. 自动刷新端口列表

### 场景 3: 用户拒绝 UAC 提示

1. 用户点击"结束进程"按钮
2. 显示确认对话框
3. 用户点击"确定"
4. 显示加载提示
5. 第一次尝试失败
6. 触发 UAC 提示
7. **用户点击"否"拒绝**
8. 显示错误提示：
   ```
   ⚠️ 需要管理员权限
   
   系统已尝试请求管理员权限。
   如果 UAC 提示出现，请点击"是"以继续。
   
   如果仍然失败，请以管理员身份运行此应用。
   ```

## 前端 UI 改进

### 1. 加载提示

```javascript
const loadingMsg = document.createElement('div');
loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; ...';
loadingMsg.textContent = '正在结束进程...';
document.body.appendChild(loadingMsg);
```

### 2. 成功提示

```javascript
const successMsg = document.createElement('div');
successMsg.style.cssText = '... background: #10B981; ...';
successMsg.innerHTML = '✅ 进程已成功结束';
```

- 绿色背景 (#10B981)
- 显示 2 秒后自动消失
- 居中显示

### 3. 错误提示

```javascript
const errorDiv = document.createElement('div');
errorDiv.style.cssText = '... background: #EF4444; ...';
errorDiv.innerHTML = errorMsg;
```

- 红色背景 (#EF4444)
- 显示 5 秒后自动消失
- 支持多行文本
- 居中显示

## 返回值结构

```typescript
interface KillProcessResult {
  success: boolean;        // 是否成功
  needsAdmin?: boolean;    // 是否需要管理员权限
  error?: string;          // 错误信息
}
```

### 示例返回值

**成功**:
```json
{
  "success": true
}
```

**需要管理员权限（已自动处理）**:
```json
{
  "success": true
}
```

**需要管理员权限（用户拒绝）**:
```json
{
  "success": false,
  "needsAdmin": true,
  "error": "需要管理员权限才能结束此进程"
}
```

**其他错误**:
```json
{
  "success": false,
  "error": "进程不存在"
}
```

## 错误检测

系统会检测以下错误信息来判断是否需要管理员权限：

```typescript
if (errorMessage.includes('拒绝访问') ||      // 中文 Windows
    errorMessage.includes('Access is denied') || // 英文 Windows
    errorMessage.includes('ERROR: The process')) {
  // 需要管理员权限
}
```

## 安全考虑

### 1. 用户确认

在执行任何操作前，都会显示确认对话框：
```javascript
if (!confirm(`确定要结束进程 ${pid} 吗？`)) return;
```

### 2. UAC 保护

Windows UAC 会：
- 显示要执行的命令
- 显示发布者信息
- 要求用户明确授权

### 3. 最小权限原则

- 首先尝试普通权限
- 只在必要时请求管理员权限
- 不会永久提升应用权限

## 常见进程类型

### 无需管理员权限
- 用户启动的应用程序
- 开发服务器（Node.js, Python, etc.）
- 浏览器进程
- 编辑器进程

### 需要管理员权限
- 系统服务（如 HTTP.sys 占用的 80 端口）
- Windows 核心进程
- 以管理员身份运行的程序
- 某些驱动程序进程

## 测试场景

### 测试 1: 结束普通进程
1. 启动一个 Node.js 服务器（占用 3000 端口）
2. 在端口管理器中找到该进程
3. 点击"结束进程"
4. 应该直接成功，无需 UAC 提示

### 测试 2: 结束系统进程
1. 找到占用 80 端口的系统进程
2. 点击"结束进程"
3. 应该弹出 UAC 提示
4. 点击"是"后成功结束

### 测试 3: 拒绝 UAC
1. 找到系统进程
2. 点击"结束进程"
3. 在 UAC 提示中点击"否"
4. 应该显示友好的错误提示

## 替代方案

如果用户经常需要结束系统进程，可以：

### 方案 1: 以管理员身份运行应用

右键应用图标 → "以管理员身份运行"

**优点**:
- 所有操作都有管理员权限
- 无需每次都弹 UAC

**缺点**:
- 安全性降低
- 需要手动操作

### 方案 2: 使用任务计划程序

创建一个以管理员权限运行的任务计划

**优点**:
- 可以自动以管理员权限启动
- 更专业的解决方案

**缺点**:
- 配置复杂
- 需要额外设置

## 总结

通过这个功能，用户可以：
- ✅ 无缝结束普通进程
- ✅ 自动请求管理员权限结束系统进程
- ✅ 获得清晰的反馈和提示
- ✅ 保持系统安全性（UAC 保护）

关键是在**便利性**和**安全性**之间找到平衡。
