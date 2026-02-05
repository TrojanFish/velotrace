# Changelog

All notable changes to VeloTrace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-05

### 🎉 Initial Release

#### Added
- **Core Dashboard**: Mobile-first PWA dashboard for professional cyclists
- **Strava Integration**: OAuth authentication and API sync for activities, routes, and segments
- **Tactical Weather Advisor**:
  - Real-time weather data from Open-Meteo API
  - Wind direction analysis for routes
  - Intelligent kit (clothing) recommendations based on temperature and wind chill
- **Performance Analytics**:
  - PMC (Performance Management Chart) with CTL, ATL, TSB tracking
  - Virtual CdA (Aerodynamic Drag) calculator
  - Metabolic engine for fat vs. carb consumption estimation
  - Mean Maximum Power (MMP) tracking for 5s, 1m, 5m, 20m intervals
- **Garage Management**:
  - Multi-bike tracking synced from Strava
  - Advanced multi-wheelset support with independent mileage tracking
  - Intelligent tire pressure calculator based on rider weight, tire specs, and road conditions
  - Maintenance alerts for chain lubrication, tire wear, and service intervals
- **Route Intelligence**:
  - Route polyline decoding and bearing calculations
  - Wind match scoring (tailwind vs. headwind analysis)
  - Tactical route recommendations
- **Data Persistence**:
  - IndexedDB storage via `idb-keyval` for high-capacity local-first architecture
  - Zustand state management with migration support
- **Progressive Web App**:
  - Service worker registration
  - Offline-first capabilities
  - Installable on mobile devices

#### Technical Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 with custom Cyber Cockpit design system
- **Maps**: Leaflet with React-Leaflet for route visualization
- **Charts**: Recharts for PMC trends
- **Authentication**: NextAuth.js with Strava OAuth provider
- **State**: Zustand with IndexedDB persistence

#### Design
- Cyber Cockpit aesthetic inspired by F1 telemetry interfaces
- High-contrast dark mode (Cyber Black / Neon Cyan)
- Premium micro-interactions and smooth transitions
- Mobile-optimized responsive layout

### Fixed
- TypeScript type safety improvements
- ESLint configuration and code quality enhancements
- Function declaration order issues
- State management type definitions

### Security
- Environment variables properly configured
- API keys secured with `.env.example` template
- Git ignore patterns for sensitive files

---

## [Unreleased]

### Planned Features (Roadmap)
- [ ] AI Tactical Briefing with GPT-powered personalized insights
- [ ] 3D Wind-Field Mapping for route visualization
- [ ] Advanced training plan generator
- [ ] Social features and leaderboards
- [ ] Export functionality for training data
