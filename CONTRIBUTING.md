# Contributing to VeloTrace

感谢你对 VeloTrace 的贡献兴趣！🚴

## 开发设置

### 前置要求
- Node.js 20+
- npm 或 yarn
- Strava API 账号

### 本地开发

1. **Fork 并克隆仓库**
   ```bash
   git clone https://github.com/YOUR_USERNAME/velotrace.git
   cd velotrace
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 填入你的 API 密钥
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问**
   打开 http://localhost:3000

## 代码规范

### TypeScript
- 所有新代码必须使用 TypeScript
- 避免使用 `any` 类型
- 为所有公共 API 添加类型定义

### 代码风格
- 使用 ESLint 配置
- 运行 `npm run lint` 检查
- 提交前确保没有 linting 错误

### 文件结构
```
src/
├── app/              # Next.js App Router 页面和 API
├── components/       # React 组件
│   ├── modules/      # 功能模块组件
│   └── ui/           # 基础 UI 组件
├── hooks/            # 自定义 React Hooks
├── lib/              # 工具函数和计算器
│   └── calculators/  # 物理计算模块
├── store/            # Zustand 状态管理
└── types/            # TypeScript 类型定义
```

## 提交规范

### Commit Message 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(pmc): add 90-day PMC trend visualization

- Implement PMC calculation algorithm
- Add Recharts integration
- Create PMCTrendCard component

Closes #123
```

## Pull Request 流程

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**
   - 编写代码
   - 添加必要的测试
   - 运行 `npm run lint`
   - 运行 `npm run build` 确保构建成功

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 提供清晰的 PR 描述
   - 引用相关 Issue
   - 等待代码审查

## 测试指南

### 运行测试
```bash
# TypeScript 类型检查
npm run build

# Linting
npm run lint
```

### 手动测试检查清单
- [ ] 功能在 Chrome、Firefox、Safari 中正常工作
- [ ] 移动端响应式布局正常
- [ ] PWA 安装和离线功能正常
- [ ] Strava 认证流程完整
- [ ] 没有控制台错误

## 报告 Bug

### 使用 GitHub Issues

**Bug 报告应包含**:
1. **环境信息**
   - 浏览器和版本
   - 操作系统
   - VeloTrace 版本

2. **重现步骤**
   - 详细的步骤列表
   - 预期行为 vs 实际行为

3. **截图/视频**
   - 如果可能，提供视觉证据

4. **错误日志**
   - 浏览器控制台错误
   - 网络请求失败信息

## 功能请求

我们欢迎功能建议！请在 GitHub Issues 中:

1. 描述你想要的功能
2. 解释为什么这个功能有用
3. 提供使用场景示例
4. (可选) 提供设计草图或参考

## 社区准则

- 尊重所有贡献者
- 保持建设性的讨论
- 欢迎新手提问
- 遵循开源精神

## 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。

---

感谢你帮助让 VeloTrace 变得更好！🚀
