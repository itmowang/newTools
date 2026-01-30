# 🤝 贡献指南

感谢你对 Toolbox Assistant 的关注！

## 如何贡献

### 报告 Bug
1. 在 GitHub Issues 中搜索是否已存在相同问题
2. 如果没有，创建新 Issue
3. 提供详细信息：
   - 操作系统版本
   - 应用版本
   - 复现步骤
   - 预期行为
   - 实际行为
   - 错误截图/日志

### 提出功能建议
1. 在 Issues 中描述你的想法
2. 说明使用场景和价值
3. 等待社区讨论

### 提交代码
1. Fork 项目
2. 创建功能分支: `git checkout -b feat/my-feature`
3. 编写代码
4. 提交: `git commit -m "feat: add my feature"`
5. 推送: `git push origin feat/my-feature`
6. 创建 Pull Request

## 开发规范

### 代码风格
- 使用 TypeScript
- 遵循 ESLint 规则
- 使用有意义的变量名
- 添加必要的注释

### 提交信息
遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

示例：
```
feat: add clipboard manager module
fix: port manager memory leak
docs: update API documentation
```

### 分支命名
- `feat/feature-name` - 新功能
- `fix/bug-name` - Bug 修复
- `docs/doc-name` - 文档
- `refactor/refactor-name` - 重构

## 开发流程

### 1. 环境准备
```bash
# 克隆项目
git clone <your-fork>
cd toolbox-assistant

# 安装依赖
pnpm install

# 构建
pnpm build
```

### 2. 开发
```bash
# 启动开发模式
pnpm dev

# 监听单个包
pnpm --filter @toolbox/core dev
```

### 3. 测试
```bash
# 运行测试（待实现）
pnpm test

# 类型检查
pnpm --filter @toolbox/core build
```

### 4. 提交
```bash
git add .
git commit -m "feat: your feature"
git push origin feat/your-feature
```

## PR 检查清单

提交 PR 前请确认：

- [ ] 代码遵循项目规范
- [ ] 提交信息符合规范
- [ ] 通过 TypeScript 编译
- [ ] 功能正常工作
- [ ] 更新相关文档
- [ ] 添加必要的注释

## 模块开发

参考 [模块开发指南](./docs/MODULE_DEVELOPMENT.md)

## 文档贡献

文档同样重要！欢迎：
- 修正错误
- 补充说明
- 添加示例
- 翻译文档

## 行为准则

- 尊重他人
- 友好交流
- 建设性反馈
- 包容多样性

## 获得帮助

- 查看 [FAQ](./docs/FAQ.md)
- 在 Issues 中提问
- 加入讨论

## 致谢

感谢所有贡献者！
