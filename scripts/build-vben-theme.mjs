// 把 Vben Admin 5 的权威设计令牌(default.css / dark.css) 转换为
// 工程计费工具可直接 var() 消费的格式，并注入项目特有 token + 14 套 data-accent 预设。
// 仅用于生成本项目的 src/styles/theme.css，不依赖运行时。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VBEN = 'E:/编程专用/招标百宝箱网页版/招标百宝箱网站/vben/vue-vben-admin-main/packages/@core/base/design/src/design-tokens';
const OUT = resolve('src/styles/theme.css');

// ---- 预设主色（取自 Vben packages/@core/preferences/src/constants.ts BUILT_IN_THEME_PRESETS.color）----
const PRESET_PRIMARY = {
  default: '212 100% 45%',
  violet: '245 82% 67%',
  pink: '347 77% 60%',
  yellow: '42 84% 61%',
  'sky-blue': '231 98% 65%',
  green: '161 90% 43%',
  zinc: '240 5% 26%',
  'deep-green': '181 84% 32%',
  'deep-blue': '211 91% 39%',
  orange: '18 89% 40%',
  rose: '0 75% 42%',
  neutral: '0 0% 25%',
  slate: '215 25% 27%',
  gray: '217 19% 27%',
};
// 深色模式下反转为主色（Vben: darkPrimaryColor || primaryColor）
const PRESET_PRIMARY_DARK = {
  ...PRESET_PRIMARY,
  zinc: '0 0% 98%',
  neutral: '0 0% 98%',
  slate: '0 0% 98%',
  gray: '0 0% 98%',
};

// 把 HSL 三元组包进 hsl()，已含 hsl()/rgb()/# 的保持原样
function wrapValue(v) {
  const s = v.trim();
  if (/^(hsl|rgb|#)/i.test(s)) return s;
  if (/%/.test(s)) return `hsl(${s})`;
  return s;
}

// 解析 css 文本为 { selector: { var: value } }
// 注意：必须先剥离 /* */ 注释，否则注释里的 --var: val; 会被误读为生效值
function parseBlocks(text) {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const selector = m[1].trim();
    const body = m[2];
    const vars = {};
    const vr = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let vm;
    while ((vm = vr.exec(body)) !== null) {
      vars[vm[1]] = wrapValue(vm[2]);
    }
    if (Object.keys(vars).length) blocks.push({ selector, vars });
  }
  return blocks;
}

const lightBlocks = parseBlocks(readFileSync(`${VBEN}/default.css`, 'utf8'));
const darkBlocks = parseBlocks(readFileSync(`${VBEN}/dark.css`, 'utf8'));

// 按选择器归类
function classify(blocks) {
  const base = {};
  const presets = {}; // type -> vars
  for (const b of blocks) {
    const s = b.selector;
    const themeMatch = s.match(/\[data-theme='([\w-]+)'\]/);
    const isDark = /\.dark\b/.test(s) || /\[data-theme='dark'\]/.test(s);
    const isLight = /\.light\b/.test(s) || /\[data-theme='light'\]/.test(s) || /:root\b/.test(s);
    if (!themeMatch) {
      // :root 或 .light（无 data-theme）或 .dark（无 data-theme）
      if (isDark) Object.assign(base, b.vars);
      else Object.assign(base, b.vars); // :root / .light -> 浅色 base
      continue;
    }
    const type = themeMatch[1];
    if (type === 'default' || type === 'custom' || type === 'light' || type === 'dark') {
      Object.assign(base, b.vars); // default/custom 视作 base
      continue;
    }
    presets[type] = presets[type] || {};
    Object.assign(presets[type], b.vars);
  }
  return { base, presets };
}

const light = classify(lightBlocks);
const dark = classify(darkBlocks);

// 项目特有 token（Vben 无对应项，按 Vben 调性对齐；保持项目原有 --radius 14/10/18 与圆角风格）
// 注意：项目组件以 var(--x) 直接消费，所有 HSL 三元组必须包进 hsl()
const EXTRA_LIGHT = `
  /* ===== 项目扩展 token（Vben 无对应项，按 Vben 调性对齐） ===== */
  /* 用 CSS Color 5 相对语法 hsl(from var(--primary) ...) 派生，
     切换 data-accent 时 --primary 变化，这些 token 自动跟随色相 */
  --primary-strong: hsl(from var(--primary) h s 38%);
  --primary-soft: hsl(from var(--primary) h s 95%);
  --primary-soft-strong: hsl(from var(--primary) h s 90%);
  --brand-gradient: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-strong)) 100%);
  --bg-sunken: hsl(216 20% 92%);
  --text-inverse: hsl(0 0% 100%);
  --border-strong: hsl(240 5.9% 84%);
  --radius: 14px;
  --radius-sm: 10px;
  --radius-lg: 18px;
  --shadow-sm: 0 1px 2px hsl(220 40% 20% / 0.05);
  --shadow: 0 1px 3px hsl(220 40% 20% / 0.06), 0 6px 18px hsl(220 40% 20% / 0.06);
  --shadow-lg: 0 12px 32px hsl(220 40% 20% / 0.12);
  --mark-bg: #ffe28a;
  --mark-text: #3f2d00;
  --tooltip-bg: hsl(222 47% 11%);
  --tooltip-text: hsl(0 0% 100%);
  --tooltip-arrow: hsl(222 47% 11%);
  --table-head-bg: hsl(216 20.11% 95.47%);
  --table-row-hover: hsl(216 20% 94%);
  --table-stripe: hsl(216 20% 97%);
  --success-soft: hsl(144 57% 94%);
  --destructive-soft: hsl(359.33 100% 95%);
  --warning-soft: hsl(42 84% 94%);
`;

const EXTRA_DARK = `
  /* ===== 项目扩展 token（深色） ===== */
  /* 用 CSS Color 5 相对语法 hsl(from var(--primary) ...) 派生，
     切换 data-accent 时 --primary 变化，这些 token 自动跟随色相 */
  --primary-strong: hsl(from var(--primary) h s 38%);
  --primary-soft: hsl(from var(--primary) h s 22%);
  --primary-soft-strong: hsl(from var(--primary) h s 26%);
  --brand-gradient: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-strong)) 100%);
  --bg-sunken: hsl(220 13% 11%);
  --text-inverse: hsl(222.34 10.43% 12.27%);
  --border-strong: hsl(240 3.7% 28%);
  --radius: 14px;
  --radius-sm: 10px;
  --radius-lg: 18px;
  --shadow-sm: 0 1px 2px hsl(220 40% 5% / 0.35);
  --shadow: 0 2px 6px hsl(220 40% 5% / 0.35), 0 8px 24px hsl(220 40% 5% / 0.28);
  --shadow-lg: 0 16px 40px hsl(220 40% 5% / 0.45);
  --mark-bg: hsl(43 60% 30%);
  --mark-text: hsl(48 100% 75%);
  --tooltip-bg: hsl(210 30% 92%);
  --tooltip-text: hsl(222 47% 11%);
  --tooltip-arrow: hsl(210 30% 92%);
  --table-head-bg: hsl(220 13.06% 11%);
  --table-row-hover: hsl(220 13% 13%);
  --table-stripe: hsl(220 13% 10%);
  --success-soft: hsl(144 50% 14%);
  --destructive-soft: hsl(359 70% 18%);
  --warning-soft: hsl(42 70% 16%);
`;

function emit(selector, vars, extra) {
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
  if (extra) lines.push(extra);
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

let out = `/**
 * 主题变量 —— 移植自 Vben Admin 5 设计令牌（packages/@core/base/design/src/design-tokens）
 * 命名与取值对齐 Vben shadcn token；主色采用 Vben 默认 hsl(212 100% 45%)。
 * 浅/深通过 <html data-theme="light|dark"> 或 .dark 切换；
 * 彩色预设通过 <html data-accent="sky-blue|green|..."> 切换（与 data-theme 正交）。
 * 所有组件只引用变量，不写死颜色。
 */

`;

// 浅色 base
out += emit(':root, :root[data-theme=\'light\']', light.base, EXTRA_LIGHT);

// 深色 base
out += emit('[data-theme=\'dark\'], .dark', dark.base, EXTRA_DARK);

// 彩色预设 light / dark（顺序对齐 Vben BUILT_IN_THEME_PRESETS）
const order = ['violet', 'pink', 'yellow', 'sky-blue', 'green', 'zinc', 'deep-green', 'deep-blue', 'orange', 'rose', 'neutral', 'slate', 'gray'];
for (const type of order) {
  const lv = light.presets[type] || {};
  lv['--primary'] = `hsl(${PRESET_PRIMARY[type]})`;
  out += emit(`[data-accent='${type}'], :root[data-accent='${type}']`, lv, EXTRA_LIGHT);

  const dv = dark.presets[type] || {};
  dv['--primary'] = `hsl(${PRESET_PRIMARY_DARK[type]})`;
  out += emit(`[data-theme='dark'][data-accent='${type}'], .dark[data-accent='${type}']`, dv, EXTRA_DARK);
}

writeFileSync(OUT, out);
console.log('written', OUT, 'bytes=', out.length);
