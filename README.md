# 🚴 VeloTrace: Pro Cycling Decision Cockpit

[English] | [简体中文](./README_ZH.md)

**VeloTrace** is a high-performance dashboard designed for hardcore cyclists, focusing on "pre-ride decision making" and "long-term physiological analysis." It transforms raw cycling data into actionable tactical insights by integrating Strava API, real-time meteorological forecasts, and advanced physiological models.

[![Status](https://img.shields.io/badge/Status-Beta-purple?style=for-the-badge)](https://github.com/TrojanFish/velotrace)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-blue?style=for-the-badge)

---

## 💎 Core Innovation Modules

### 🌬️ 1. Tactical Environment Sensor
*   **Intelligent Weather Strategy**: Real-time monitoring of temperature, wind speed, and precipitation alerts.
*   **Dynamic Apparel Recommendation**: Algorithm-driven clothing advice (Inner, Jersey, Accessories) based on aero-drag and rider's cold tolerance.
*   **Strategic Route Wind Scoring**: Decodes route polylines and scores "Wind Match" (Tailwind vs. Headwind) to help you choose the best route for today's wind.

### 📊 2. Deep Physiology Analytics Hub
*   **PMC (Performance Management Chart)**: Tracks your **CTL** (Fitness), **ATL** (Fatigue), and **TSB** (Form) over a 90-day window.
*   **Activity Insights**:
    *   **Metabolism Engine**: Estimates Fat vs. Carb consumption based on power zones.
    *   **Virtual CdA**: Calculates your aerodynamic efficiency (CdA) and provides a rating.
*   **Segment Challenges**: Integrated Strava segment tracking for post-ride performance review.

### 🎡 3. Advanced Tactical Preparation (Multi-Wheelset aware)
*   **Garage Management**: Full lifecycle tracking of multiple bikes synced from Strava.
*   **Multi-Wheelset Infrastructure**: Manage different wheelsets (e.g., Aero Carbon vs. Training Alloy) for the same bike with independent:
    *   **Tire Pressure Calculation**: Precision PSI advice based on surface, tubeless status, and tire width.
    *   **Mileage Tracking**: Each wheelset has its own ODO, separate from the bike's frame ODO.
*   **Maintenance Alerts**: Proactive notifications for chain lubrication, tire wear, and deep services based on mileage.

---

## 🎨 Design Language & UX

*   **Cyber Cockpit Aesthetic**: High-contrast, dark-mode UI (Cyber Black / Neon Cyan) inspired by F1 data telemetry.
*   **Local-First Architecture**: Powered by **IndexedDB** (`idb-keyval`) for ultra-fast, high-capacity local storage.
*   **Progressive Web App (PWA)**: Installable on mobile devices with offline-first capabilities.
*   **Micro-interactions**: Smooth transitions and skeletons for a premium, lightweight feel.

---

## 🛠️ Technical Stack

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Persistence**: Zustand + `idb-keyval` (IndexedDB)
*   **Authentication**: [Next-Auth](https://next-auth.js.org/) + Strava OAuth
*   **Visualization**: [Recharts](https://recharts.org/) for PMC trends
*   **Calculators**: Custom physics-based models for CdA, TSS, Metabolism, and Tire Pressure.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/TrojanFish/velotrace.git
cd velotrace
npm install
```

### 2. Configuration
Create a `.env` file in the root:
```env
STRAVA_CLIENT_ID=your_id
STRAVA_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Launch
```bash
npm run dev
```

---

## 📈 Roadmap

- [x] Version 1: Strava Sync & Basic Metrics
- [x] Version 2: PMC Trends & Virtual CdA
- [x] Version 3: IndexedDB & Multi-Wheelset Support
- [ ] Version 4: AI Tactical Briefing (GPT-powered)
- [ ] Version 5: 3D Wind-Field Mapping

---

**VeloTrace Pro Engine** - Making every watt traceble.
