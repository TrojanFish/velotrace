# VeloTrace MVP 2.0 实施计划

# 目标描述
构建一个集成“瞬时决策”与“专业计算”的公路车骑手工具箱。重点在于 PWA 体验和高度可用的计算模型。

## 关键技术点
1.  **PWA 支持**：配置 manifest.json 和 Service Worker，实现“桌面快捷方式”和离线基础工具。
2.  **SILCA/SRAM 模拟算法**：集成专业的胎压算法模型。
3.  **坐标转换与天气**：使用 OpenMeteo 获取风向/降水预测。

---

## 方案变更 (v2 整合版)

### 1. 页面结构调整
*   `app/page.tsx`: **仪表盘中心** (天气、补给、今日胎压)。
*   `app/tools/page.tsx`: **工具箱** (胎压计算器、齿比计算器、FTP计算器)。
*   `app/garage/page.tsx`: **虚拟车库** (车辆参数、维护记录)。
*   `app/settings/page.tsx`: **偏好设置** (体重、FTP、单位制)。

### 2. 核心逻辑组件

#### [新增] `lib/calculators/tirePressure.ts`
*   功能：基于 Silca 算法简化版，输入体重、胎宽、路况，输出精准 PSI。

#### [新增] `lib/calculators/gearRatio.ts`
*   功能：计算不同盘片组合下的各挡位速度比。

#### [增强] `components/modules/WeatherModule.tsx`
*   增加“风向策略”：将风向角转化为相对于骑手骑行趋势的描述。

### 3. 持久化存储
*   使用 `zustand` 处理全局状态，结合 `persist` 中间件自动同步到 `localStorage`。

---

## 验证计划

### 自动化测试
*   针对 `tirePressure.ts` 编写 10 组标准对照测试（参考 SRAM AXS 官方值）。
*   针对 `fuelLogic.ts` 验证不同强度下的碳水消耗梯度。

### 手动验证
1.  **PWA 测试**：在 Chrome/Safari 中选择“添加到主屏幕”，验证全屏体验。
2.  **工具易用性**：在移动端模拟单手操作“齿比计算器”，确保滑块和按钮响应灵敏。
3.  **计算准确性**：对比真实骑行数据，验证补给量建议是否在合理区间（60g-90g/h）。
