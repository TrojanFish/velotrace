---
description: 执行项目的自我迭代升级 (Audit, Fix, Upgrade)
---

这个工作流用于自动化地分析项目现状、修复技术债并升级核心功能。

1. **健康检查 (Health Check)**
   运行项目诊断工具，识别当前的 Lint 错误和类型警告。
   ```powershell
   npm run lint
   ```

2. **国际化审计 (i18n Audit)**
   - 检查新组件是否硬编码了文本字符串。
   - 确保 `messages/zh-CN.json` 和 `en-US.json` 保持同步。
   - 验证日期、数字、单位是否使用了 `useLocale` 或动态格式化。

3. **核心逻辑加固 (Fortify Logic & Types)**
   - 检查并移除潜在的 `any` 类型声明，使用更严谨的 `interface` 或 `unknown` + casting。
   - 为核心计算模块编写或运行单元测试，确保升级过程中不会产生逻辑退化。
   ```powershell
   npm test
   ```

4. **功能进化 (Feature Evolution)**
   分析 `src/lib/calculators` 下的算法。
   - 检查公式是否简化过头？
   - 是否可以引入更多专业参数（如风阻计算中的风向向量）？
   - 是否需要增加新的单位转换支持？

5. **UI/UX 抛光 (Aesthetic Polish)**
   - 检查 `src/app/globals.css` 中的设计令牌。
   - 增加微互动或玻璃拟态效果。
   - 确保所有新组件符合 Premium 设计标准。

6. **总结报告 (Report)**
   向用户汇报本次迭代的改动点、性能提升以及待处理的长期建议。
