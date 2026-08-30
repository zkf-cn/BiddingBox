/**
 * 对 CalcHub.jsx 做一批机械但需配对的 JSX 改造（脚本化以保证配对准确，避免手改漏闭合标签）
 *   1. <th> 补 scope="col"
 *   2. type="number" -> type="text"（消除滚轮误改值 + 读屏数值步进语义噪音）
 *   3. .table-scroll 容器补 tabIndex/role/aria-label（键盘可滚动）
 *   4. 结果 hero 换成 <LiveResult>（防抖播报，WCAG 4.1.3）
 *   5. chip 选项组补 role="group" + aria-labelledby
 *   6. 补齐 ui 导入
 */
const fs = require("fs");
const path = require("path");

const file = path.resolve(
  __dirname,
  "../react-vite/src/pages/CalcHub.jsx"
);
let src = fs.readFileSync(file, "utf8");
const lines = src.split("\n");
const stats = { th: 0, numeric: 0, scroll: 0, hero: 0, chipGroup: 0 };

// 1 + 2
for (let i = 0; i < lines.length; i++) {
  lines[i] = lines[i].replace(/<th(?=[\s>])/g, () => {
    stats.th += 1;
    return '<th scope="col"';
  });
  const before = lines[i];
  lines[i] = lines[i].replaceAll('type="number"', 'type="text"');
  stats.numeric += (before.length - lines[i].length) / 5;
}

// 3
for (let i = 0; i < lines.length; i++) {
  if (!lines[i].includes('<div className="table-scroll"')) continue;
  let label = "表格";
  for (let j = i; j < Math.min(i + 12, lines.length); j++) {
    const m = lines[j].match(/aria-label="([^"]+)"/);
    if (m && !lines[j].includes("table-scroll")) {
      label = `${m[1]}（可横向滚动）`;
      break;
    }
    const m2 = lines[j].match(/aria-label=\{`([^`]*)`\}/);
    if (m2) {
      label = `${m2[1].replace(/\$\{[^}]*\}/g, "")}（可横向滚动）`;
      break;
    }
  }
  lines[i] = lines[i].replace(
    '<div className="table-scroll"',
    `<div className="table-scroll" tabIndex={0} role="region" aria-label="${label}"`
  );
  stats.scroll += 1;
}

// 4
for (let i = 0; i < lines.length; i++) {
  if (!/^\s*<div className="mt-16 result-hero"/.test(lines[i])) continue;
  const indent = lines[i].match(/^\s*/)[0];
  lines[i] = lines[i].replace(
    '<div className="mt-16 result-hero"',
    '<LiveResult className="mt-16 result-hero"'
  );
  for (let j = i + 1; j < Math.min(i + 14, lines.length); j++) {
    if (lines[j] === `${indent}</div>`) {
      lines[j] = `${indent}</LiveResult>`;
      stats.hero += 1;
      break;
    }
  }
}

// 5
let gid = 0;
for (let i = 0; i < lines.length; i++) {
  if (!/<span className="field-label"/.test(lines[i])) continue;
  let target = -1;
  for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
    if (/<div className="chip-row/.test(lines[j])) {
      target = j;
      break;
    }
  }
  if (target < 0) continue;
  gid += 1;
  const id = `hub-field-label-${gid}`;
  lines[i] = lines[i].replace(
    '<span className="field-label"',
    `<span className="field-label" id="${id}"`
  );
  lines[target] = lines[target].replace(
    /<div className="chip-row/,
    `<div role="group" aria-labelledby="${id}" className="chip-row`
  );
  stats.chipGroup += 1;
}

// 6
src = lines.join("\n");
src = src.replace(
  'import { Button, Input, Notice, Pill, IconEmpty } from "@/components/ui";',
  'import {\n  Button,\n  Input,\n  Notice,\n  Pill,\n  IconEmpty,\n  LiveResult,\n} from "@/components/ui";'
);

fs.writeFileSync(file, src, "utf8");
console.log("CalcHub 改造完成:", JSON.stringify(stats));
