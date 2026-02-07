# 📁 VeloTrace 项目结构

```
VeloTrace/
├── 📄 配置文件
│   ├── .env.example              # 环境变量模板
│   ├── .gitignore               # Git 忽略规则
│   ├── .gitattributes           # Git 属性配置
│   ├── next.config.ts           # Next.js 配置
│   ├── tsconfig.json            # TypeScript 配置
│   ├── eslint.config.mjs        # ESLint 配置
│   ├── postcss.config.mjs       # PostCSS 配置
│   └── package.json             # 项目依赖和脚本
│
├── 📚 文档
│   ├── README.md                # 项目主文档 (英文)
│   ├── README_ZH.md             # 项目主文档 (中文)
│   ├── LICENSE                  # MIT 开源许可证
│   ├── CHANGELOG.md             # 版本变更记录
│   ├── CONTRIBUTING.md          # 贡献指南
│   ├── DEPLOYMENT.md            # 部署指南
│   ├── PWA_ICONS_GUIDE.md       # PWA 图标生成指南
│   ├── RELEASE_CHECKLIST.md     # 发布检查清单
│   ├── implementation_plan.md   # 实现计划
│   └── product_concept.md       # 产品概念
│
├── 📱 public/ - 静态资源
│   ├── manifest.json            # PWA manifest
│   ├── robots.txt               # SEO 爬虫配置
│   ├── favicon.ico              # 网站图标
│   ├── icon-192.png             # PWA 图标
│   ├── icon-512.png             # PWA 图标
│   └── *.svg                    # 其他 SVG 资源
│
└── 🎨 src/ - 源代码
    ├── app/ - Next.js App Router
    │   ├── layout.tsx           # 根布局
    │   ├── page.tsx             # 首页
    │   ├── globals.css          # 全局样式
    │   │
    │   ├── (main)/              # 主要功能路由组
    │   │   ├── analytics/       # 分析页面
    │   │   ├── pilot-office/    # 飞行员办公室 (个人中心与资产管理)
    │   │   └── tools/           # 工具箱
    │   │
    │   └── api/ - API 路由
    │       ├── auth/            # NextAuth 认证
    │       ├── ai/              # AI 功能 (简报生成)
    │       └── strava/          # Strava API 集成 (同步、历史、统计等)
    │
    ├── components/ - React 组件
    │   ├── Navigation.tsx       # 底部导航栏
    │   ├── Providers.tsx        # Context Providers
    │   │
    │   ├── modules/ - 功能模块组件
    │   │   ├── AIBriefingCard.tsx
    │   │   ├── BikeCard.tsx
    │   │   ├── WeatherCard.tsx
    │   │   └── ... (其他 20+ 功能卡片)
    │   │
    │   └── ui/ - 基础 UI 组件
    │       ├── Card.tsx
    │       └── ...
    │
    ├── hooks/ - 自定义 React Hooks
    │   ├── useWeather.ts        # 天气获取
    │   └── useStravaSync.ts     # Strava 批量同步逻辑
    │
    ├── lib/ - 工具函数和库
    │   ├── auth.ts              # NextAuth 配置
    │   ├── converters.ts        # 公英制转换工具
    │   ├── utils.tsx            # 通用工具函数
    │   │
    │   └── calculators/ - 专业计算模块
    │       ├── aerodynamics.ts  # 空气动力学 (CdA)
    │       ├── fueling.ts       # 能量补充建议
    │       ├── kitAdvisor.ts    # 穿搭建议
    │       ├── pmc.ts           # PMC (CTL/ATL/TSB) 计算
    │       ├── physiology.ts    # 生理指标 (BMR, Karvonen)
    │       └── tirePressure.ts  # 智能胎压计算
    │
    ├── store/ - 状态管理
    │   └── useStore.ts          # Zustand Store (持久化至 IndexedDB)
    │
    └── types/ - TypeScript 类型定义
```

## 🏗️ 架构特点

### 前端架构
- **框架**: Next.js 15+ App Router
- **状态管理**: Zustand + IndexedDB (`idb-keyval`) 实现持久化
- **样式**: Tailwind CSS 4 (极简配置，高性能)
- **渲染**: 混合模式 (AI 简报动态生成，数据面板 SSR/CSR 结合)

### 数据流与持久化 (Local-First)
- **离线能力**: 所有关键用户设置、车辆数据、轮组里程均存储在浏览器本地存储。
- **差异同步**: 与 Strava 同步时采用增量更新策略 (即将推出完全态)。

## 🎯 核心功能模块

### 1. 战术智脑 (AI Briefing)
- 基于实时气象、当前 TSB 形态、车辆维护状态生成每日骑行建议。

### 2. 战术气象 (Environment)
- 实时风场动态图 (Dynamic Wind Field)。
- 路线风向匹配度分析。

### 3. 专业资产管理 (Advanced Garage)
- 多车辆管理。
- **多轮组系统**: 为同一辆车切换不同轮组 (如爬坡轮 vs. 破风轮)，独立记录里程。
- 扭矩存根与维护日志。

---

**最后更新**: 2026-02-07
