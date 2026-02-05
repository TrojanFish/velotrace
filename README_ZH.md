# 🚴 VeloTrace: 专业骑行决策指挥台

**VeloTrace** 是一款专为硬核骑行者设计的“飞行前决策”与“深度体能分析”仪表盘。它通过集成 Strava API、实时高精气象预报和自研生理算法，将原始骑行数据转化为具有实战价值的战术建议。

[![状态](https://img.shields.io/badge/状态-测试版-purple?style=for-the-badge)](https://github.com/TrojanFish/velotrace)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![PWA](https://img.shields.io/badge/PWA-已就绪-orange?style=for-the-badge)
![IndexedDB](https://img.shields.io/badge/存储-IndexedDB-blue?style=for-the-badge)

[English Version](./README.md)

---

## 💎 核心创新模块

### 🌬️ 1. 战术环境感知
*   **智能气象策略**：实时追踪气温、风速及降水预警，提供前瞻性建议。
*   **动态穿衣算法**：基于环境风阻与骑手“怕冷体质”设置，自动推荐最科学的骑行服叠穿方案。
*   **顺风匹配评分 (Wind Match)**：深度解析路线航向，自动对比当日风向给出“顺风得分”，帮你一眼挑出今天的“免单路线”。

### 📊 2. 深度生理数据中心
*   **PMC 体能管理曲线**：追踪 90 天内的 **CTL** (体能)、**ATL** (疲劳) 与 **TSB** (状态)，科学预判巅峰期。
*   **骑行洞察详情**：
    *   **代谢引擎**：根据功率分区估算脂肪与碳水能量消耗占比。
    *   **虚拟 CdA 评估**：计算你的气动效率得分并给出专业评级。
*   **路段挑战监控**：自动映射 Strava 段位挑战，精准回溯表现提升。

### 🎡 3. 专业战术准备 (多轮组管理)
*   **车库资产管理**：从 Strava 同步全车辆 lifecycle，追踪单车累计里程。
*   **多轮组架构**：支持为同一台车配置多套轮组（如竞赛碳刀 vs 训练铝轮），并具备独立逻辑：
    *   **精准胎压计算**：根据路面材质、真空状态、胎宽及动态载荷计算最优 PSI。
    *   **资产里程审计**：轮组拥有独立 ODO 计价器，与车架里程解耦追踪。
*   **主动维护预警**：基于里程自动推送链条润滑、外胎更换及整车大保养提醒。

---

## 🎨 设计语言与交互

*   **Cyber Cockpit 交互美学**：采用高对比度深色模式（赛博黑 / 霓虹青），灵感源自 F1 赛车数据遥测界面。
*   **Local-First 极速架构**：使用 **IndexedDB** (`idb-keyval`) 替代 LocalStorage，支持秒级图表缩放与海量历史存贮。
*   **PWA 应用化**：支持作为独立应用安装至手机，具备离线优先的访问体验。

---

## 🛠️ 技术栈

*   **框架**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **数据持久化**: Zustand + `idb-keyval` (IndexedDB)
*   **认证/同步**: [Next-Auth](https://next-auth.js.org/) + Strava OAuth
*   **可视化引擎**: [Recharts](https://recharts.org/)
*   **算法逻辑**: 自研 CdA、TSS、代谢比及胎压物理模型。

---

## 🚀 快速开始

### 1. 克隆与安装
```bash
git clone https://github.com/TrojanFish/velotrace.git
cd velotrace
npm install
```

### 2. 环境配置
在根目录创建 `.env` 文件：
```env
STRAVA_CLIENT_ID=你的_ID
STRAVA_CLIENT_SECRET=你的_SECRET
NEXTAUTH_SECRET=随机_SECRET
NEXTAUTH_URL=http://localhost:3000
```

### 3. 启动开发服务器
```bash
npm run dev
```

---

## 📈 项目路线图 (Roadmap)

- [x] V1: Strava 基础同步与复盘
- [x] V2: PMC 体能趋势与虚拟 CdA
- [x] V3: IndexedDB 存贮与多轮组管理体系
- [ ] V4: AI 战术简报 (基于大模型的个性化解读)
- [ ] V5: 3D 路线动态风场可视化

---

**VeloTrace Pro Engine** - 让每一瓦特输出都有迹可循。
