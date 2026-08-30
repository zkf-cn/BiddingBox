# Design System Inspired by Linear

> 本文件为本项目的视觉契约（Restyle 切换为 Linear 风格参考）。
> 执行阶段所有颜色、字体、组件样式必须来自本文件，不得编造新 token。
> Category: Productivity & SaaS —— Project management. Ultra-minimal, precise, purple accent.

## 1. Visual Theme & Atmosphere

Linear 是暗色原生的设计：近黑画布（`#08090a`）上内容如星光般浮现。层级不靠颜色变化，而靠白色不透明度的细微递进（`rgba(255,255,255,0.02→0.05)` 表面、`0.05–0.08` 半透明白边框）管理——"边框即阴影"，暗面上传统阴影几乎不可见。

字体完全建立在 Inter Variable 上，全局启用 OpenType `"cv01","ss03"`，赋予更几何、更干净的字形；签名字重 510（介于 400 与 500 之间，本项目以 500 近似）与 590（以 600 近似）。展示级字号使用强负字距（72px 时 -1.584px、48px 时 -1.056px）。

色彩几乎全为冷灰阶，唯一彩色是品牌靛紫：`#5e6ad2`（CTA 背景）/ `#7170ff`（交互强调）/ `#828fff`（悬停），只用于 CTA、激活态与品牌元素，不做装饰。

**Key Characteristics:**
- 暗色原生：`#08090a` 画布 / `#0f1011` 面板 / `#191a1b` 抬升面 / `#28282c` 悬停面
- Inter + `"cv01","ss03"` 全局；字重三档 400 / 510 / 590，禁用 700
- 展示级强负字距；正文 16px 1.5–1.6 行高
- 半透明白边框 `rgba(255,255,255,0.05–0.08)` 代替实色边框与阴影
- 表面亮度堆叠：越抬升白色不透明度越高，绝不用实色卡片底
- 单一靛紫强调；状态绿 `#27a644/#10b981` 仅用于状态点
- 圆角：6px 按钮/输入、8px 卡片、12px 特色面板、9999px 过滤芯片

## 2. Color Palette & Roles

### Background Surfaces
- **Marketing Black** (`#08090a`): 画布、Hero
- **Panel Dark** (`#0f1011`): 导航/侧栏/页脚面板
- **Level 3 Surface** (`#191a1b`): 卡片、下拉
- **Secondary Surface** (`#28282c`): 悬停抬升

### Text & Content
- **Primary Text** (`#f7f8f8`): 主文字（不用纯白）
- **Secondary Text** (`#d0d6e0`): 正文/描述
- **Tertiary Text** (`#8a8f98`): 占位/元信息
- **Quaternary Text** (`#62666d`): 时间戳/禁用

### Brand & Accent
- **Brand Indigo** (`#5e6ad2`): 主 CTA 背景
- **Accent Violet** (`#7170ff`): 链接/激活/选中
- **Accent Hover** (`#828fff`)

### Status
- **Green** (`#27a644`) / **Emerald** (`#10b981`): 仅状态指示
- **Red** (`#e5484d`): 错误（本项目表单校验）

### Border & Divider
- **Border Subtle** `rgba(255,255,255,0.05)`；**Border Standard** `rgba(255,255,255,0.08)`
- 实色边框仅浅色模式：`#d0d6e0` / `#e6e6e6`

### Light Mode Neutrals（浅色预设用）
- 背景 `#f7f8f8`；表面 `#f3f4f5`；卡片 `#ffffff`；边框 `#d0d6e0`

## 3. Typography Rules

- **Primary**: Inter Variable（本项目含 Noto Sans SC 中文回退），全局 `"cv01","ss03"`
- **Mono**: Berkeley Mono → ui-monospace, SF Mono, Menlo（代码/技术标签）

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display XL | 72px→56px(本项目) | 510 | 1.00 | -1.584px→-0.03em |
| Display | 48px→34px | 510 | 1.00–1.13 | -1.056px→-0.022em |
| Heading 3 / 卡片标题 | 20px | 590 | 1.33 | -0.24px |
| Body Large | 18px | 400 | 1.60 | -0.165px |
| Body | 16px | 400 | 1.50 | normal |
| Body Medium / 导航 | 14–16px | 510 | 1.4–1.5 | normal |
| Caption | 13px | 400–510 | 1.50 | -0.13px |
| Label / 按钮 | 12–14px | 500 | 1.4 | normal |
| Overline | 10–12px | 510 | 1.4 | 0.08em uppercase |

**Principles**: 510 是签名强调字重；展示级必负字距；三档字重 400/510/590，禁用 700；`"cv01","ss03"` 是身份，不可省略。

## 4. Component Stylings

### Buttons
- **Primary Brand**: `#5e6ad2` 底、白字、6px 圆角、8px 16px 内边距；悬停向 `#828fff` 偏移
- **Ghost**: `rgba(255,255,255,0.02)` 底、`#e2e4e7` 字、`1px solid rgb(36,40,44)` 边、6px 圆角
- **Subtle/工具**: `rgba(255,255,255,0.04–0.05)` 底
- **Pill 芯片**: 透明底、`#d0d6e0` 字、9999px、`1px solid #23252a`

### Cards & Containers
- 背景 `rgba(255,255,255,0.02–0.05)`（绝不实色）
- 边框 `1px solid rgba(255,255,255,0.08)`
- 圆角 8px（标准）/ 12px（特色）
- 悬停：背景不透明度微升

### Inputs
- 背景 `rgba(255,255,255,0.02)`；文字 `#d0d6e0`；边框 `rgba(255,255,255,0.08)`；12px 14px 内边距；6px 圆角
- 焦点：多层阴影环（本项目以 3px 焦点环实现，颜色 Accent Violet）

### Badges & Pills
- Neutral Pill: 透明底 + `#23252a` 边 + 9999px
- Subtle Badge: `rgba(255,255,255,0.05)` 底 + 2px 圆角

### Navigation
- 深色 sticky 头 `#0f1011`；链接 13–14px 510 `#d0d6e0`；悬停/激活提亮 `#f7f8f8`
- 底边 `1px solid rgba(255,255,255,0.05)`

## 5. Layout Principles

- 8px 基准；内容最大宽约 1200px
- Hero 单列居中、垂直留白慷慨；特性区 2–3 列卡片网格
- **黑暗即留白**：近黑背景本身就是空白，内容从中浮现
- **压缩标题、扩张四周**：高密度标题 +  vast 暗色留白形成张力
- 分区间 80px+ 垂直留白，不用可见分隔线

### Border Radius Scale
2px 内联徽章 → 4px 小容器 → 6px 按钮/输入 → 8px 卡片 → 12px 面板 → 9999px 芯片 → 50% 图标按钮/状态点

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | 无阴影 `#08090a` | 画布 |
| Surface (2) | `rgba(255,255,255,0.05)` 底 + `0.08` 边 | 卡片/输入 |
| Inset (2b) | `rgba(0,0,0,0.2) 0 0 12px inset` | 凹陷面板 |
| Ring (3) | `rgba(0,0,0,0.2) 0 0 0 1px` | 边框即阴影 |
| Elevated (4) | `rgba(0,0,0,0.4) 0 2px 4px` | 浮层 |
| Focus | 3px 环 Accent Violet | 键盘焦点 |

**哲学**：暗面上阴影不可见——用背景亮度递进（0.02→0.04→0.05）表达堆叠；若阴影可见，则过强。

## 7. Do's and Don'ts

### Do
- 全部 Inter 文本启用 `"cv01","ss03"`
- 510 作为默认强调字重
- 展示级强负字距
- 近黑背景 + 半透明白边框
- 按钮背景近透明（0.02–0.05）
- 靛紫只留给 CTA 与交互强调
- 主文字用 `#f7f8f8` 而非纯白
- 亮度堆叠模型表达层级

### Don't
- 不用纯白做主文字
- 不用实色按钮底（透明度即系统；主 CTA 靛紫除外）
- 不把靛紫当装饰色
- 展示级不用正字距
- 暗面不用可见/不透明实色边框
- 不用 700 字重
- 不引入暖色——只有冷灰 + 靛紫

## 8. Responsive Behavior

- <600 单列紧凑；640–768 两列起；768–1024 全卡片网格；>1280 居中留白
- Hero 72→48→32px，字距按比例收敛
- 导航 768px 折叠汉堡
- 深色分区全宽、移动端压缩内边距

## 9. Agent Prompt Guide（快速参考）

- 主 CTA: `#5e6ad2`；画布: `#08090a`；面板: `#0f1011`；表面: `#191a1b`
- 标题字: `#f7f8f8`；正文: `#d0d6e0`；弱化: `#8a8f98`；最弱: `#62666d`
- 强调: `#7170ff`；悬停: `#828fff`
- 边框: `rgba(255,255,255,0.08)`（标准）/ `0.05`（细微）
- 卡片: `rgba(255,255,255,0.02)` 底 + `0.08` 边 + 8px 圆角
- 导航: `#0f1011` sticky + 13–14px 510 链接

## 10. 中文实施备注（本项目附加，非模板内容）

- **中文字体栈**：Inter 仅覆盖西文与数字，中文回退 `Noto Sans SC` → `PingFang SC` → `Microsoft YaHei`；`"cv01","ss03"` 对中文无副作用，全局保留。
- **字重近似**：510→500、590→600；禁用 700（原文排版 .law-doc 标题用 600）。
- **默认暗色**：产品默认 Linear 暗；「外观」Nudges 提供 暗/浅/高对比 三档，浅色档使用第 2 节 Light Mode Neutrals。
- **数据合规标注**：「定额查询」为演示数据、「专家分类」为参考数据，徽章显著标注；费率测算附免责说明。徽章用 pill 芯片样式（9999px），符合 Linear 过滤芯片语言。
