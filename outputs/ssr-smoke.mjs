/**
 * 运行时冒烟：用 Vite 的 SSR 模块加载器把每个页面真正渲染一遍，
 * 捕获构建期发现不了的运行时错误（Hook 用法、组件契约、undefined 取值等）。
 * 用法：NODE_OPTIONS="" node ssr-smoke.mjs
 */
import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "warn",
});

const targets = [
  ["App(首页)", "/src/App.jsx"],
  ["Home", "/src/pages/Home.jsx"],
  ["CalcHub", "/src/pages/CalcHub.jsx"],
  ["AgentFeeCalculator", "/src/pages/AgentFeeCalculator.jsx"],
  ["ExpertQuery", "/src/pages/ExpertQuery.jsx"],
  ["QuotaQuery", "/src/pages/QuotaQuery.jsx"],
  ["Laws", "/src/pages/Laws.jsx"],
];

let failed = 0;
for (const [name, path] of targets) {
  try {
    const mod = await vite.ssrLoadModule(path);
    const Component = mod.default;
    const html = renderToString(React.createElement(Component, { onNavigate: () => {}, onOpenLaw: () => {} }));
    const marks = {
      "aria-pressed": (html.match(/aria-pressed/g) || []).length,
      "aria-current": (html.match(/aria-current/g) || []).length,
      "scope=col": (html.match(/scope="col"/g) || []).length,
      "role=region": (html.match(/role="region"/g) || []).length,
      "aria-live": (html.match(/aria-live/g) || []).length,
      "sr-only": (html.match(/sr-only/g) || []).length,
    };
    console.log(
      `OK   ${name.padEnd(22)} ${String(html.length).padStart(7)}B  ` +
        Object.entries(marks).map(([k, v]) => `${k}=${v}`).join(" ")
    );
  } catch (err) {
    failed += 1;
    console.log(`FAIL ${name.padEnd(22)} ${err.message.split("\n")[0]}`);
  }
}

await vite.close();
console.log(failed === 0 ? "\n全部页面渲染通过" : `\n${failed} 个页面渲染失败`);
process.exit(failed === 0 ? 0 : 1);
