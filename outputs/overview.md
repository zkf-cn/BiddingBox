# 任务概览：全站无障碍合规审查 + 修复

## 一、审查结论

对 `react-vite` 全站（6 个页面 + 共享组件层 + 设计令牌层 + HTML 外壳）做 WCAG 2.2 Level AA 无障碍审查。
采用源码静态审查 + 颜色对比度脚本实测双轨验证。

- **修复前**：无障碍 2/4，五维合计 14/20（P0 4 · P1 19 · P2 9 · P3 4）
- **修复后**：无障碍 4/4，五维合计 **19/20 Excellent**（唯一未满分项是包体积，本次不在范围）

## 二、修复执行

按 `/harden → /colorize → /normalize → /adapt → /polish` 五阶段全量修复，改动 10 个文件：

| 阶段 | 关键动作 |
|------|----------|
| `/harden` | 拆嵌套 `main`；政策卡改原生 button；专家搜索框补 label；修 `"hub"` 无效路由 ID（原点击后主区空白）；表单 hint/error 关联；SPA 焦点与标题同步；新增 Skip link |
| `/colorize` | 四组令牌按实测值校准（浅+暗）：`--text-muted` 3.69→5.02、`--text-quaternary` 2.52→4.74、`--success` 3.30→5.02、`--border-input` 1.26→3.45 |
| `/normalize` | `ui.jsx` 的 `Button` 把 `active` 自动映射为 `aria-pressed`/`aria-current`（一处改动消掉 20+ 处）；`Segmented` 改原生 radio；4 处半实现的 `tablist` 改 `role="group"` |
| `/adapt` | 移动端触摸目标统一提到 44px；横向滚动表格区键盘可达 |
| `/polish` | 卡片语义重构、Esc 关菜单、prefers-reduced-motion、input 焦点环、`type="number"` 降级、`role="alert"` 降级等 |

## 三、产出文件

| 文件 | 说明 |
|------|------|
| `outputs/accessibility-audit.md` | 审查报告正文：评分、P0–P3 问题清单、改动清单、复现工具说明 |
| `outputs/contrast_check.cjs` | 对比度实测脚本，含修复前/后对照，可复跑 |
| `outputs/ssr-smoke.mjs` | Vite SSR 渲染冒烟，真实渲染 7 个页面并统计 ARIA 标记 |
| `outputs/patch_calchub.cjs` | CalcHub 机械改造脚本（需配对的 JSX 标签替换），留档 |

## 四、验证结果

- `vite build` ✅ 通过（43 modules，928ms）
- SSR 渲染冒烟 ✅ 7/7 页面通过，ARIA 标记数量符合预期
- 对比度复跑 ✅ 修复值全部 PASS

## 五、报告更正与遗留

- **撤回误报**：原 P1-12「法规正文是 class 化伪标题」不成立，数据层用的就是真语义标签
- **新发现并已修**：法规正文 87 个表格零 `<th>`，已在渲染层用 `promoteTableHeaders()` 兜底补表头
- **遗留可选**：法规表头建议在数据层直接写出；产物 558KB 未做代码分割
