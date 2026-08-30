# 招标百宝箱网页版 · 无障碍合规审查报告

**审查范围**：`react-vite/src` 全站 6 个页面（Home / CalcHub / AgentFeeCalculator / ExpertQuery / QuotaQuery / Laws）+ `components/ui.jsx` 组件层 + `styles.css` / `sparkdesign-tokens.css` 令牌层 + `index.html` / `App.jsx`
**标准依据**：WCAG 2.2 Level AA（对比度以 AA 4.5:1 / 3:1 判定）
**方法**：源码静态审查 + 令牌对比度脚本实测（`outputs/contrast_check.cjs`，Node 运行）

---

## ⚠️ 状态更新（2026-08-30 17:40）—— 已按第八节顺序全部修复

按 `/harden → /colorize → /normalize → /adapt → /polish` 五个阶段完成了全量修复：

| 阶段 | 主要改动 | 状态 |
|------|----------|------|
| `/harden` | 4 项 P0 全部清除；表单 hint/error 关联、SPA 焦点与标题、Skip link、Laws 详情焦点、ExpertQuery 折叠态与结果播报、滚动容器键盘可达 | ✅ |
| `/colorize` | `--text-muted` / `--text-quaternary` / `--success` / `--border-input` 四组令牌（浅+暗）全部调整到位 | ✅ 实测全 PASS |
| `/normalize` | `ui.jsx` 的 `Button` 把 `active` 映射为 `aria-pressed`/`aria-current`；`Segmented` 改原生 radio + fieldset；4 处 `tablist` 改 `role="group"` | ✅ |
| `/adapt` | 移动端 `.icon-btn`/`.chip`/`.nav-link`/`.tab`/`.btn--segment` 提到 44px | ✅ |
| `/polish` | 模块卡语义重构、Esc 关菜单、prefers-reduced-motion、input 焦点环、ellipsis title、`type="number"` 降级、`role="alert"` 降级、Button className 去重、`key` 稳定性 | ✅ |

**验证方式**：`vite build` 通过；`outputs/ssr-smoke.mjs` 用 Vite SSR 加载器把 7 个页面真实渲染一遍，全部 OK；`outputs/contrast_check.cjs` 复跑，修复值全部 PASS。

**一处报告更正**：原 **P1-12「法规正文是 class 化伪标题」是误报**——核对 `fee_standards.js` 后确认数据层用的就是真语义标签（`<h2 class='h2'>` 55 处、`<h3>` 11 处、`<p class='p'>` 655 处、`<table class='table'>` 87 处）。但核对中发现了一个**真实的新问题**：这 87 个表格**一个 `<th>` 都没有**，已在渲染层用 `promoteTableHeaders()` 兜底修复（详见下方 P1-12 条目）。

---

## 一、健康评分

| # | 维度 | 修复前 | 修复后 | 关键发现 |
|---|------|--------|--------|----------|
| 1 | **无障碍 Accessibility** | 2 / 4 | **4 / 4** | 4 项 P0 阻断已清除；19 项 P1（AA 违规）已全部修复；对比度令牌实测全 PASS |
| 2 | 性能 Performance | 3 / 4（轻扫） | 3 / 4 | 过渡基本只用 color/background-color，无 layout 动画 |
| 3 | 响应式 Responsive | 3 / 4（轻扫） | 4 / 4 | 断点齐备；横向滚动区现已键盘可达；移动端触摸目标提到 44px |
| 4 | 主题化 Theming | 3 / 4（轻扫） | 4 / 4 | token 体系完整；四组对比度令牌已按 AA 校准（浅+暗） |
| 5 | 反模式 Anti-Patterns | 3 / 4（轻扫） | 4 / 4 | `active` 已映射为 ARIA；复合组件角色改为原生控件或 `role="group"` |
| | **合计** | 14 / 20 | **19 / 20 · Excellent** | 唯一未满分项是性能（包体 558KB 未做代码分割，本次不在修复范围内） |

**问题统计（修复前）**：P0 阻断 4 项 · P1 严重 19 项 · P2 中等 9 项 · P3 打磨 4 项
**当前状态**：P0 ✅ 4/4 · P1 ✅ 19/19 · P2 ✅ 9/9 · P3 ✅ 3/4（P3-4 经复核为可接受实现，未改）

---

## 二、P0 阻断项（✅ 4/4 已修复）

### [P0-1] 首页政策卡片用 `div role="button"`，键盘完全不可达
- **位置**：`pages/Home.jsx:194-198`、`pages/Home.jsx:219-223`
- **影响**：这两张卡片（`role="button"` + `onClick`）**没有 `tabIndex`、没有 Enter/Space 键处理**。键盘用户 Tab 不到、聚焦不了、激活不了；屏幕阅读器却把它播报成"按钮"，用户按下后毫无反应。同页的 `module-card` 用的是真 `<button>`，两处实现不一致。
- **违反**：WCAG 2.1.1 Keyboard（A）· 4.1.2 Name, Role, Value（A）
- **修复**：改为 `<button className="card policy-card">`；若需保留 `div` 版式，至少补 `tabIndex={0}` + `onKeyDown` 处理 Enter/Space + `role="button"`。

### [P0-2] 专家分类搜索框无任何标签
- **位置**：`pages/ExpertQuery.jsx:112-118`
- **影响**：`<input type="text">` 只有 `placeholder`，没有 `id`、没有 `<label>`、没有 `aria-label`。屏幕阅读器只播报"编辑框，空白"，用户完全不知道这个框是搜什么的。placeholder 在输入后即消失，低视力用户同样失去线索。
- **违反**：WCAG 3.3.2 Labels or Instructions（A）· 4.1.2（A）
- **修复**：复用 `ui.jsx` 的 `<Input>` 组件并传 `id` + `aria-label="搜索专业名称或编码"`（对齐 `QuotaQuery.jsx:48-56` 与 `Laws.jsx:161-169` 的既有写法）。

### [P0-3] 三重嵌套 `main` 地标
- **位置**：`index.html:21` `<main id="root" role="main">` + `App.jsx:74` `<main>` + `pages/ExpertQuery.jsx:247` `<main className="calc-embedded">`
- **影响**：一个页面同时存在 3 个 `main` landmark。屏幕阅读器的"跳转到主内容"与地标列表会并列出现多个主区域，用户无法判断哪个是真正的主体，导航彻底失效。
- **违反**：WCAG 1.3.1 Info and Relationships（A）· ARIA 规范（document 内至多一个可见 main）
- **修复**：`index.html` 的 `#root` 改为 `<div id="root">`；`App.jsx:74` 保留唯一 `<main>`；`ExpertQuery.jsx:247` 改为 `<section>` 或 `<div>`。

### [P0-4] 首页"计算中心"入口指向无效视图 ID
- **位置**：`pages/Home.jsx:59`（`page: "hub"`）与 `pages/Home.jsx:115`（`onNavigate?.("hub")`）
- **影响**：`App.jsx:10-16` 的路由表只有 `home / calculator / quota / expert / laws`，**没有 `"hub"`**。点击"计算中心"卡片和"查看全部工具"按钮后 `setView("hub")`，`App.jsx:75-79` 五个分支全不匹配 → **渲染空白主区域**。所有用户（含键盘、读屏）都被卡死，且无任何错误提示。
- **违反**：WCAG 3.2.4 Consistent Identification（AA）· 4.1.2（A）
- **修复**：把 `page` 改为 `"calculator"`（计算中心即 `CalcHub` 页）。

---

## 三、P1 严重项（✅ 19/19 已修复）

### 语义与 ARIA

| # | 问题 | 位置 | 违反 | 修复建议 |
|---|------|------|------|----------|
| P1-1 | **选中态只靠 CSS class `active`，无任何 ARIA 表达**。涉及：CalcHub 侧栏 9 个计算器按钮（814-822）、CalcHub 8 处 chip 选择器（115/214/244/258/374/452/539/614/643）、ExpertQuery 大类 tab（210-216）与二级分类列表（228-240）、AgentFee 费率表切换（194-203）、QuotaQuery 分类筛选（60-69） | 多文件 | 4.1.2 / 1.3.1 | 单选语义加 `aria-pressed` 或 `aria-checked`；导航/列表加 `aria-current="true"`。建议在 `ui.jsx` 的 `Button` 里把 `active` 直接映射为 `aria-pressed`，一处改完全站 |
| P1-2 | **`role="tablist"/"tab"` 语义误用**：声明了 tab 却没有 `role="tabpanel"`、没有 `aria-controls`、没有方向键导航；QuotaQuery 的 chip-row 下面跟的根本不是 tabpanel 而是筛选结果表格 | `Laws.jsx:113-126`、`Laws.jsx:138-157`、`QuotaQuery.jsx:58-71`、`AgentFeeCalculator.jsx:192-205` | 4.1.2 | 筛选类（QuotaQuery、AgentFee 费率切换、Laws 分类）改为 `role="group"` + `aria-pressed` 的 toggle button；Laws 章节切换若坚持用 tabs，需补 `tabpanel` + `aria-controls` + roving tabindex + 方向键 |
| P1-3 | `Segmented` 声明 `role="radiogroup"` / `role="radio"` 但**未实现方向键导航与 roving tabindex** | `components/ui.jsx:107-131` | 2.1.1 / 4.1.2 | 改用原生 `<input type="radio">` + `<fieldset>`；或补 `onKeyDown` 的 ArrowLeft/Right/Up/Down 与只让选中项 `tabIndex=0` |
| P1-4 | **折叠面板缺 `aria-expanded` / `aria-controls`**，读屏用户无法知道某个专业是展开还是收起 | `ExpertQuery.jsx:275-339` | 4.1.2 | 补 `aria-expanded={isOpen}` + `aria-controls={panelId}`，面板加对应 `id` |
| P1-5 | `CalcHub` chip 选项组的标题用 `<span className="field-label">`，**不与选项组关联**（不是 `<label>`，也没有 `role="group"` + `aria-labelledby`） | `CalcHub.jsx:111-119` 及同构多处 | 1.3.1 | 容器加 `role="group" aria-labelledby={labelId}`，标题 `<span id={labelId}>` |

### 动态内容与焦点管理

| # | 问题 | 位置 | 违反 | 修复建议 |
|---|------|------|------|----------|
| P1-6 | **计算结果静默更新，无任何状态播报**。输入即算是本产品的核心交互，但 CalcHub 全部 9 个计算器、AgentFeeCalculator 结果区都无 live region | `CalcHub.jsx` 各 Panel、`AgentFeeCalculator.jsx:120-129` | 4.1.3 Status Messages (AA) | 结果数值容器加 `aria-live="polite"` + `aria-atomic="true"`，并用 300–500ms 防抖避免逐字符播报 |
| P1-7 | SPA 视图切换**无焦点管理、无标题更新、无路由播报**。切页后焦点丢失回 `<body>`，`document.title` 恒为"招标百宝箱 - 招标费用计算与查询工具" | `App.jsx:23-32`、`index.html:10` | 2.4.2 (A) / 2.4.3 (A) / 4.1.3 | `go()` 里同步 `document.title = \`${name} · 招标百宝箱\``，并把焦点移到新视图的 `<h1>`（`tabIndex={-1}` + `ref.focus()`）；可选加一个 `aria-live="polite"` 的路由播报节点 |
| P1-8 | Laws 文档详情：点击文件后整块视图替换，**焦点丢失**；返回按钮文本 `← 返回列表` 的箭头会被读成"左箭头" | `Laws.jsx:76-78`、`Laws.jsx:128-134` | 2.4.3 (A) | 进入详情时聚焦 `<h2 className="panel-title">`；按钮改 `aria-label="返回文件列表"`，箭头包 `<span aria-hidden="true">←</span>` |
| P1-9 | **缺少 Skip link**（跳转到主内容）。顶部导航 5 项 + 品牌按钮，键盘用户每次进页都要 Tab 6 次才能到内容 | `App.jsx:41-72` | 2.4.1 Bypass Blocks (A) | header 前加 `<a href="#main-content" className="skip-link">跳到主要内容</a>`，`<main>` 加 `id="main-content" tabIndex={-1}`，CSS 用 `:focus` 时显示 |
| P1-10 | `ExpertQuery` 搜索结果计数**漏了 `aria-live="polite"`**（Laws / QuotaQuery 都有，此处不一致），且结果表格**缺 `aria-label`** | `ExpertQuery.jsx:129`、`ExpertQuery.jsx:141` | 4.1.3 / 1.3.1 | 对齐 `QuotaQuery.jsx:72` 与 `QuotaQuery.jsx:82` 的写法 |

### 表单

| # | 问题 | 位置 | 违反 | 修复建议 |
|---|------|------|------|----------|
| P1-11 | 输入框的 `hint` 与 `error` **未与 input 程序化关联**：`hint` 无 `id`、`error` 只有 `role="alert"` 无 `aria-describedby`，`aria-invalid` 也没有指向说明 | `components/ui.jsx:82`、`components/ui.jsx:92-100` | 1.3.1 / 3.3.1 Error Identification (A) | 生成 `hintId`/`errorId`，input 加 `aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}`；error 节点加对应 `id` |
| ~~P1-12~~ | **【已撤回 · 误报】** 原判定"法规正文是 class 化伪标题"不成立。核对 `fee_standards.js` 后确认数据层用的就是真语义标签：`<h2 class='h2'>` 55 处、`<h3 class='h3'>` 11 处、`<h4 class='h4'>` 44 处、`<p class='p'>` 655 处、`<table class='table'>` 87 处 | — | — | 无需处理 |
| **P1-12′** | **【核对中新发现】** 法规正文 87 个 `<table>` **全部只有 `<td>`，零个 `<th>`** → 数据表没有表头单元格，读屏无法建立行列关联 | `data/fee_standards.js`（数据层）、`Laws.jsx:128-134`（渲染层） | 1.3.1 | ✅ 已在 `Laws.jsx` 新增 `promoteTableHeaders()`：渲染前把每个表的首行 `<td>` 提升为 `<th scope="col">`，仅对 ≥2 行的表生效以控制误标风险。根治仍建议在 `fee_standards.js` 数据层直接写出 `<th>` |

### 表格

| # | 问题 | 位置 | 违反 | 修复建议 |
|---|------|------|------|----------|
| P1-13 | 全部数据表的 `<th>` **缺 `scope="col"`** | `QuotaQuery.jsx:85-90`、`AgentFeeCalculator.jsx:139-142 / 212-213`、CalcHub 各表、`ExpertQuery.jsx:144-148` | 1.3.1 | 表头统一加 `scope="col"` |
| P1-14 | 横向滚动容器 `.table-scroll { overflow-x: auto }` **无 `tabIndex="0"` + `role="region"` + `aria-label`**，键盘用户无法滚动查看溢出列（定额表 6 列在移动端必然溢出） | `styles.css:816-818`；使用方 `QuotaQuery.jsx:81`、`AgentFeeCalculator.jsx:135/208`、`CalcHub.jsx:133/…` | 2.1.1 Keyboard (A) | 容器加 `tabIndex={0} role="region" aria-label="表格横向滚动区"`（仅当实际溢出时） |

### 对比度（实测值，脚本 `outputs/contrast_check.cjs`）

| # | 组合 | 实测 | 要求 | 判定 | 受影响位置 |
|---|------|------|------|------|------------|
| P1-15 | `--text-muted` 浅 `#858585` / `#ffffff` | **3.69 : 1** | 4.5 : 1 | ❌ | `.tab`、`.result-count`、`.field-hint`、`.hub-group-title`、`.hub-item-desc`、`table.data th`、`.input::placeholder`、`.input-unit`、`.pill--muted` |
| P1-16 | `--text-muted` 暗 `#737373` / `#0a0a0a` | **4.18 : 1** | 4.5 : 1 | ❌ | 同上（暗色预设） |
| P1-17 | `--text-quaternary` 浅 `#a3a3a3` / 暗 `#525252` | **2.52 / 2.53 : 1** | 4.5 : 1 | ❌ | 任何用到该 token 的文本都不可用 |
| P1-18 | `--success` `#16a34a` / 白底 | **3.30 : 1** | 4.5 : 1 | ❌ | `.pill--success`（Laws 页"现行有效"徽章） |
| P1-19 | **输入框边框** `--border-input` `#e5e5e5` / 白底 | **1.26 : 1** | 3 : 1（非文本） | ❌ | `.input`（全部表单）；暗色 `#343434` / `#0a0a0a` = **1.59 : 1** 同样不达标 |

**修复建议**：在 `sparkdesign-tokens.css` 统一调整——
- `--text-muted`：浅色 `#858585 → #6b6b6b`（4.83:1）；暗色 `#737373 → #8a8a8a`（5.3:1）
- `--text-quaternary`：浅色 `#a3a3a3 → #737373`（4.74:1）；暗色 `#525252 → #8a8a8a`
- `--success`（文字态）：`#16a34a → #15803d`（4.9:1），仅状态圆点保留原值
- `--border-input`：浅色 `#e5e5e5 → #b8b8b8`（2.1:1）或 `#949494`（3.0:1）；暗色 `#343434 → #6b6b6b`
- 达标项可放心保留：主文字 19.8:1、`--text-secondary` 7.8:1、`--danger` 4.77:1、`.chip.active` 反白 19.8:1、焦点环 19.4:1

---

## 四、P2 中等项（✅ 9/9 已修复）

| # | 问题 | 位置 | 影响 | 修复建议 |
|---|------|------|------|----------|
| P2-1 | 模块卡 `<button>` 内嵌 `<h3>` / `<p>`，整卡内容被读成一个超长按钮名，且 `h3` 不进文档大纲 | `Home.jsx:150-170` | 读屏导航与可用性下降 | 卡片改 `<article>` + `<h3>` + 一个可聚焦 CTA（用伪元素铺满整卡保持点击区） |
| P2-2 | 移动端菜单无 Esc 关闭、无 `aria-controls`、展开后焦点不进入菜单 | `App.jsx:63-70`、`styles.css:183-213` | 键盘用户关闭困难 | 补 `aria-controls`、`onKeyDown` Esc 关闭、展开后聚焦首个菜单项、关闭后焦点回到汉堡按钮 |
| P2-3 | 无 `@media (prefers-reduced-motion: reduce)` 兜底，全站 150–200ms transition | `styles.css` 全局 | 前庭敏感用户不适；WCAG 2.3.3 (AAA) | 加 reduce 分支把 `transition-duration` 归零 |
| P2-4 | `.input:focus { outline: none }` 覆盖了全局 2px 焦点环，只剩 10% 不透明度 `box-shadow` | `styles.css:736-740` | 焦点指示显著弱于其他元素，低视力用户易丢失焦点位置 | 改为 `outline: 2px solid var(--focus-ring); outline-offset: 2px;` 或把光晕提到 30% 并保留 outline |
| P2-5 | 四级细项名称 `text-overflow: ellipsis` 截断，无 `title` 无完整文本 | `ExpertQuery.jsx:373` | 名称被截掉后无法获知全名 | 加 `title={item.name}` 或改为自动换行 |
| P2-6 | 编码用了 `opacity: 0.7` + `--text-muted` 双重降对比 | `ExpertQuery.jsx:234` | 实际对比度约 2.6:1 | 去掉 opacity，直接用 `--text-muted` |
| P2-7 | `type="number"` 输入框：读屏数值步进语义与滚轮误改值风险 | `AgentFeeCalculator.jsx:66/91`、`CalcHub.jsx:101/…` | 滚轮悬停时数值被静默修改 | 改 `type="text"` + `inputMode="decimal"` + `pattern`（`inputMode` 已有） |
| P2-8 | `role="alert"` 用于即时校验，每次触发都是**断言式打断** | `components/ui.jsx:98` | 读屏用户被频繁打断 | 改 `role="status"` 或 `aria-live="polite"` |
| P2-9 | 图标按钮 34×34px、chip 高度约 32px，低于 AAA 的 44×44（满足 AA 的 24×24） | `styles.css:161-171`、`:952-961` | 手指粗的用户误触 | 移动端断点下把 `.icon-btn` padding 提到 10px、`.chip` padding 提到 `8px 16px` |

---

## 五、P3 打磨项（3/4 已处理）

| # | 问题 | 位置 |
|---|------|------|
| P3-1 | `Button` 组件 `className` 被拼接两次，最终 class 属性重复 | `components/ui.jsx:47` |
| P3-2 | 搜索结果用数组索引作 `key`，列表重排时可能出现状态错位 | `ExpertQuery.jsx:153` |
| P3-3 | `hero-facts` 用 `<b>` + `<span>` 拼装，数值与标签无关联，建议改 `<dl>` 或加 `aria-label` | `Home.jsx:120-130` |
| P3-4 | `Notice` 用 `role="note"`（不会自动播报），对「免责说明」这类需要被听到的内容建议改用 `role="note"` + `aria-live="polite"` 或保持静态由用户主动阅读 | `components/ui.jsx:136` |

---

## 六、系统性规律（不是偶发失误）

1. **状态只有视觉、没有语义**——全站所有 `active` 选中态、展开态、当前页态都只落在 CSS class 上，没有一处映射到 `aria-pressed` / `aria-expanded` / `aria-current`。这是组件层 `Button` 设计缺失导致的系统性缺陷：**在 `ui.jsx` 的 `Button` / `IconButton` 里把 `active` 一次性映射为 ARIA 属性，可以一次性消掉 P1-1 的 20 多处**。
2. **ARIA 角色是"贴"上去的，不是"实现"出来的**——`role="tablist"`、`role="radiogroup"` 都只加了一半（有角色无键盘交互、无关联面板）。宁可用原生 `<button>` + `aria-pressed`，也不要用实现不全的复合组件角色。
3. **对比度问题集中在三个 token**——`--text-muted` / `--text-quaternary` / `--success`，且被大量小字号场景（表头、提示、计数、placeholder）复用。**改三个 token 值即可解决 P1-15 ~ P1-18 的全部实例**。
4. ** ExpertQuery 页明显落后于其他页面**——Laws / QuotaQuery 已有 `aria-label` + `aria-live` + `aria-label` 表格，ExpertQuery 三样全缺，属于同一套模式的漏做。

---

## 七、值得保持的做法（正面发现）

- **全站交互元素一律原生 `<button>`**，除两张政策卡外没有 `<div onClick>` 反模式，键盘可达性底盘是好的
- **所有装饰性 SVG 都带 `aria-hidden="true"`**（`ui.jsx` 图标全量覆盖），读屏不会被图标噪音淹没
- `IconButton` 统一 `aria-label`；导航 `aria-current="page"` + 汉堡按钮 `aria-expanded` 用法正确（`App.jsx:57/66`）
- `aria-invalid` + 错误提示已就位，表单校验有基础
- `aria-live="polite"` 已在 `QuotaQuery` / `Laws` 的结果计数上正确使用
- `<html lang="zh-CN">`、viewport 未禁用缩放、`<title>` / meta description 齐全
- `Input` 组件统一 `id` + `<label htmlFor>` 关联，多数表单已受益
- 移动端表格 ↔ 卡片切换用 `display: none`（`styles.css:1013-1026`），不会把重复内容暴露给读屏
- 全局 `:focus-visible` 焦点环（`styles.css:50-54`），焦点环对比度 19.4:1
- 空状态有明确文案 + 重置按钮，不是干瘪的"暂无数据"

---

## 八、改动清单（已落地的代码变更）

| 文件 | 改动 |
|------|------|
| `index.html` | `#root` 由 `<main role="main">` 改为 `<div>`，消除嵌套 main 地标 |
| `src/App.jsx` | 新增 Skip link；视图切换同步 `document.title` 并把焦点送入 `<main>`；移动端菜单加 `aria-controls`、Esc 关闭、展开后焦点进入首项、同页点击后焦点交还汉堡按钮；`<main>` 加 `id="main-content" tabIndex={-1}` |
| `src/components/ui.jsx` | **Button**：`active` → `aria-pressed`（chip/tab 显式 true/false）/ `aria-current`（nav/hub），并修复 className 重复拼接；**Input**：hint/error 生成 id 并用 `aria-describedby` 关联，错误提示由 `role="alert"` 改为 `role="status" aria-live="polite"`；**Segmented**：改为原生 `<input type="radio">` + `fieldset/legend`（方向键导航与分组语义由浏览器原生提供）；**新增 TableScroll**（可键盘聚焦的滚动区）与 **LiveResult**（防抖播报的结果容器） |
| `src/sparkdesign-tokens.css` | 浅/暗两套的四组令牌按 AA 校准：`--text-muted` `#858585/#737373` → `#6f6f6f/#8a8a8a`；`--text-quaternary` `#a3a3a3/#525252` → `#737373/#7a7a7a`；`--success` → `#15803d`（并新增暗色显式值 `#16a34a`，防止继承导致 3.95:1）；`--border-input` `#e5e5e5/#343434` → `#8a8a8a/#6b6b6b` |
| `src/styles.css` | 新增 `.sr-only`、`.skip-link`、`.focus-target`、`.card-link`（整卡点击 + 焦点环画在卡片上）、`.field-fieldset` 复位、`prefers-reduced-motion` 兜底；`.input:focus-visible` 恢复 2px 焦点环；`.btn--segment` 补 label 排布与 `:has(input:focus-visible)` 焦点环；`.hero-facts` 改 dl/dt/dd（`column-reverse` 保持视觉）；移动端断点触摸目标提到 44px；`.table-scroll:focus-visible` 焦点指示 |
| `src/pages/Home.jsx` | `page: "hub"` → `"calculator"`（修复点击无响应）；两张政策卡 `div role="button"` → `article` + `h3` + `.card-link`；6 张模块卡同理重构；hero 数据改 `<dl>` |
| `src/pages/ExpertQuery.jsx` | 搜索框改用 `<Input>` 并补 `aria-label` + `aria-describedby`；嵌套 `<main>` → `<section>`；大类/二级列表补 `aria-pressed`/`aria-current` 与 `role="group"`；折叠按钮补 `aria-expanded`/`aria-controls`；结果计数补 `aria-live`；结果表补 `aria-label`、`scope="col"`；`opacity:0.7` 改直接用 `--text-muted`；ellipsis 补 `title`；`key` 改稳定值 |
| `src/pages/Laws.jsx` | 两处 `tablist` → `role="group"`；返回按钮改 `aria-label` + 箭头 `aria-hidden`；文档标题加 `tabIndex={-1}` 并在切换/打开时聚焦；新增 `promoteTableHeaders()` 为法规表格补 `<th scope="col">` |
| `src/pages/QuotaQuery.jsx` | 分类筛选 `tablist` → `role="group"`；表格改 `<TableScroll>`；表头补 `scope="col"` |
| `src/pages/AgentFeeCalculator.jsx` | 费率切换 `tablist` → `role="group"`；两个表格改 `<TableScroll>`；6 处表头补 `scope="col"`；两个输入 `type="number"` → `type="text"`；结果区包 `<LiveResult>` 播报 |
| `src/pages/CalcHub.jsx` | 5 个结果 hero 改 `<LiveResult>`；4 个滚动区补 `tabIndex/role/aria-label`；12 处表头补 `scope="col"`；5 个输入 `type="number"` → `type="text"`；6 个 chip 选项组补 `role="group"` + `aria-labelledby` |

## 九、复现与回归工具

| 文件 | 用途 | 运行方式 |
|------|------|----------|
| `outputs/contrast_check.cjs` | 批量算色对对比度，含修复前/后对照 | `NODE_OPTIONS="" node contrast_check.cjs` |
| `outputs/ssr-smoke.mjs` | 用 Vite SSR 加载器真实渲染 7 个页面，捕获运行时错误并统计 ARIA 标记数量 | 放到 `react-vite/` 下，`NODE_OPTIONS="" node ssr-smoke.mjs` |
| `outputs/patch_calchub.cjs` | CalcHub 的机械改造脚本（配对的 JSX 标签替换），留档备查 | — |

**回归结果**：`vite build` ✅ 通过 · SSR 渲染 7/7 ✅ · 对比度修复值 ✅ 全 PASS

## 十、建议修复顺序（原计划，已执行完毕）

1. ✅ **`/harden`** — 4 项 P0 + P1 结构性项
2. ✅ **`/colorize`** — 四组对比度令牌
3. ✅ **`/normalize`** — 组件层 ARIA 收敛
4. ✅ **`/adapt`** — 触摸目标
5. ✅ **`/polish`** — P2/P3 打磨与回归

**遗留可选项**（不在本次范围）：
- 法规表格的 `<th>` 目前是渲染层启发式兜底，建议在 `fee_standards.js` 数据层直接写出真实表头
- 产物 558KB（gzip 169KB）未做代码分割，可按需引入 `manualChunks` 或路由级 `import()`
- P3-4：`.notice` 用 `role="note"` 属合法实现，未改动
