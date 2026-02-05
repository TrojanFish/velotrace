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
│   ├── ⚠️ icon-192.png          # PWA 图标 (待添加)
│   ├── ⚠️ icon-512.png          # PWA 图标 (待添加)
│   └── *.svg                    # 其他 SVG 资源
│
└── 🎨 src/ - 源代码
    ├── app/ - Next.js App Router
    │   ├── layout.tsx           # 根布局
    │   ├── page.tsx             # 首页
    │   ├── globals.css          # 全局样式
    │   ├── favicon.ico          # Favicon
    │   │
    │   ├── analytics/           # 分析页面
    │   │   └── page.tsx
    │   │
    │   ├── garage/              # 车库管理页面
    │   │   └── page.tsx
    │   │
    │   ├── tools/               # 工具页面
    │   │   └── page.tsx
    │   │
    │   └── api/ - API 路由
    │       ├── auth/            # NextAuth 认证
    │       │   └── [...nextauth]/
    │       │       └── route.ts
    │       │
    │       ├── ai/              # AI 功能
    │       │   └── briefing/
    │       │       └── route.ts
    │       │
    │       └── strava/          # Strava API 集成
    │           ├── history/route.ts
    │           ├── latest-activity/route.ts
    │           ├── routes/route.ts
    │           ├── segments/route.ts
    │           ├── stats/route.ts
    │           └── sync/route.ts
    │
    ├── components/ - React 组件
    │   ├── Navigation.tsx       # 底部导航栏
    │   ├── Providers.tsx        # Context Providers
    │   │
    │   ├── modules/ - 功能模块组件
    │   │   ├── AIBriefingCard.tsx
    │   │   ├── BikeCard.tsx
    │   │   ├── DynamicWindFieldMap.tsx
    │   │   ├── FuelCard.tsx
    │   │   ├── GearCalculator.tsx
    │   │   ├── KitAdvisorCard.tsx
    │   │   ├── MaintenanceCard.tsx
    │   │   ├── MMPTrendCard.tsx
    │   │   ├── PMCTrendCard.tsx
    │   │   ├── RideInsightCard.tsx
    │   │   ├── RouteWindForecastCard.tsx
    │   │   ├── SegmentChallengeCard.tsx
    │   │   ├── TirePressureCalculator.tsx
    │   │   ├── VirtualCdACard.tsx
    │   │   ├── WeatherCard.tsx
    │   │   ├── WeeklyStatsCard.tsx
    │   │   └── WheelsetManager.tsx
    │   │
    │   └── ui/ - 基础 UI 组件
    │       ├── Card.tsx
    │       └── InteractiveRouteMap.tsx
    │
    ├── hooks/ - 自定义 React Hooks
    │   └── useWeather.ts
    │
    ├── lib/ - 工具函数和库
    │   ├── auth.ts              # NextAuth 配置
    │   ├── utils.tsx            # 通用工具函数
    │   │
    │   └── calculators/ - 物理计算模块
    │       ├── cdaCalculator.ts      # 空气动力学计算
    │       ├── fuelCalculator.ts     # 能量消耗计算
    │       ├── kitAdvisor.ts         # 装备建议
    │       ├── pmcCalculator.ts      # PMC 计算
    │       ├── routeIntel.ts         # 路线智能分析
    │       ├── tirePressure.ts       # 胎压计算
    │       └── tssCalculator.ts      # TSS 计算
    │
    ├── store/ - 状态管理
    │   └── useStore.ts          # Zustand store
    │
    └── types/ - TypeScript 类型定义
        ├── next-auth.d.ts       # NextAuth 类型扩展
        └── polyline-encoded.d.ts # Polyline 模块类型

```

## 📊 项目统计

### 代码行数估算
- TypeScript/TSX: ~5,000+ 行
- CSS: ~500+ 行
- 配置文件: ~200+ 行
- 文档: ~2,000+ 行

### 文件数量
- 组件文件: 20+ 个
- API 路由: 7 个
- 计算器模块: 7 个
- 配置文件: 8 个
- 文档文件: 10+ 个

### 依赖包数量
- 生产依赖: 17 个
- 开发依赖: 8 个

## 🏗️ 架构特点

### 前端架构
- **框架**: Next.js 16 App Router
- **组件化**: 模块化的 React 组件
- **状态管理**: Zustand + IndexedDB
- **样式**: Tailwind CSS 4

###后端架构
- **API 路由**: Next.js API Routes
- **认证**: NextAuth.js + OAuth
- **数据来源**: Strava API + Open-Meteo API

### 数据流
```
用户操作 
  ↓
React 组件 
  ↓
Zustand Store 
  ↓
IndexedDB (持久化) 
  ↓
API 路由 
  ↓
外部 API (Strava, Weather)
```

## 🎯 核心功能模块

### 1. 仪表盘 (Dashboard)
- 天气卡片
- PMC 趋势
- 每周统计
- 路线风向预测

### 2. 分析 (Analytics)
- 骑行洞察
- 虚拟 CdA
- MMP 趋势
- 路段挑战

### 3. 车库 (Garage)
- 多车辆管理
- 多轮组系统
- 维护提醒
- 胎压计算器

### 4. 工具 (Tools)
- 装备建议
- 能量计算
- 齿比计算器
- AI 简报

---

**最后更新**: 2026-02-05
