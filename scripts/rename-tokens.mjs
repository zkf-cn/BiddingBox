// 将工程计费工具组件里对旧 token 的引用重命名为 Vben shadcn 命名。
// 规则按最长优先 + 负向 lookahead，避免误伤 --brand-gradient / --text-inverse / --bg-sunken / --brand-soft-strong 等。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const SRC = resolve('src');
const SKIP = new Set([resolve('src/styles/theme.css')]); // 新主题定义本身不动

// [regex, replacement]，顺序敏感
const RULES = [
  [/(--brand-soft-strong)/g, '--primary-soft-strong'],
  [/(--brand-soft)/g, '--primary-soft'],
  [/(--brand-strong)/g, '--primary-strong'],
  // --brand 后不能紧跟字母/连字符，保护 --brand-gradient
  [/(--brand)(?![a-z-])/g, '--primary'],
  [/(--bg-elevated)/g, '--card'],
  [/(--bg-subtle)/g, '--muted'],
  // --bg 后不能紧跟字母/连字符，保护 --bg-sunken
  [/(--bg)(?![a-z-])/g, '--background-deep'],
  [/(--sidebar-bg)/g, '--sidebar'],
  [/(--text-secondary)/g, '--muted-foreground'],
  [/(--text-muted)/g, '--muted-foreground'],
  // --text 后不能紧跟字母/连字符，保护 --text-inverse
  [/(--text)(?![a-z-])/g, '--foreground'],
  [/(--danger-soft)/g, '--destructive-soft'],
  [/(--danger)(?![a-z-])/g, '--destructive'],
  [/(--warn-soft)/g, '--warning-soft'],
  [/(--warn)(?![a-z-])/g, '--warning'],
];

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (['.vue', '.css', '.ts', '.js'].includes(extname(p))) acc.push(p);
  }
  return acc;
}

const files = walk(SRC, []).filter((f) => !SKIP.has(f));
let total = 0;
const changed = [];
for (const f of files) {
  let s = readFileSync(f, 'utf8');
  let c = 0;
  for (const [re, rep] of RULES) {
    s = s.replace(re, (m) => {
      c++;
      return rep;
    });
  }
  if (c > 0) {
    writeFileSync(f, s);
    changed.push(`${f} (${c})`);
    total += c;
  }
}
console.log('files changed:', changed.length);
console.log('total replacements:', total);
changed.forEach((c) => console.log('  ', c));
