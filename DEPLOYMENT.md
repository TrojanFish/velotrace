# VeloTrace Deployment Guide

## 部署平台选择

### 推荐平台: Vercel (优先推荐)

#### 优势:
- Next.js 原生支持，零配置
- 自动 HTTPS 和 CDN
- 免费计划包含 PWA 支持
- 环境变量管理方便
- 自动预览部署

#### 部署步骤:

1. **准备 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TrojanFish/velotrace.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录
   - 导入 `velotrace` 仓库
   - Vercel 会自动检测 Next.js 项目

3. **配置环境变量**
   在 Vercel Dashboard 中添加以下环境变量:
   ```
   STRAVA_CLIENT_ID=你的ID
   STRAVA_CLIENT_SECRET=你的SECRET
   NEXTAUTH_SECRET=你的SECRET
   NEXTAUTH_URL=https://your-domain.vercel.app
   QWEN_API_KEY=你的KEY (可选)
   GEMINI_API_KEY=你的KEY (可选)
   ```

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成(约2-3分钟)
   - 获取生产 URL

5. **配置 Strava 回调 URL**
   - 前往 https://www.strava.com/settings/api
   - 添加回调 URL: `https://your-domain.vercel.app/api/auth/callback/strava`

---

### 备选平台: Netlify

#### 部署配置文件 (netlify.toml):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 部署步骤:
1. 连接 GitHub 仓库
2. 配置构建命令: `npm run build`
3. 配置发布目录: `.next`
4. 添加环境变量(同上)
5. 点击 Deploy

---

### 自托管选项

#### 使用 Docker:

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

**部署命令**:
```bash
docker build -t velotrace .
docker run -p 3000:3000 --env-file .env velotrace
```

---

## 部署前检查清单

- [ ] `.env` 文件未提交到 Git
- [ ] `.env.example` 已创建
- [ ] PWA 图标已生成并放置在 `public/`
- [ ] `package.json` 版本号已更新
- [ ] `CHANGELOG.md` 已更新
- [ ] 生产构建测试成功 (`npm run build`)
- [ ] 所有环境变量已配置
- [ ] Strava API 回调 URL 已配置
- [ ] TypeScript 类型检查通过
- [ ] README 中的链接已更新

---

## 性能优化建议

### 1. 启用压缩
Vercel 和 Netlify 默认启用 Gzip/Brotli

### 2. 图片优化
Next.js Image 组件已配置远程图片模式

### 3. 缓存策略
PWA Service Worker 已配置离线缓存

### 4. 分析构建大小
```bash
npm run build
# 查看 .next/analyze/ 中的报告
```

---

## 监控和错误追踪

### 推荐工具:
- **Sentry**: 错误追踪
- **Vercel Analytics**: 性能监控
- **Google Analytics**: 用户行为分析

### 集成 Sentry (可选):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 域名配置

### 自定义域名 (Vercel):
1. 在 Vercel Dashboard 中点击 "Domains"
2. 添加你的域名 (例如: velotrace.app)
3. 按照指示配置 DNS 记录
4. 更新环境变量 `NEXTAUTH_URL`

### SSL 证书:
Vercel 自动提供免费 SSL 证书

---

## 故障排查

### 常见问题:

1. **构建失败**: 检查 `node_modules` 是否正确安装
2. **环境变量未生效**: 确保变量名拼写正确
3. **PWA 未安装**: 检查图标文件是否存在
4. **Strava 认证失败**: 验证回调 URL 配置

---

## 后续维护

### 更新部署:
```bash
git add .
git commit -m "Update: description"
git push
# Vercel 自动触发部署
```

### 回滚版本:
在 Vercel Dashboard 中选择之前的部署版本一键回滚
