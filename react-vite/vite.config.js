import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // GitHub Pages 项目站点部署在 https://zkf-cn.github.io/BiddingBox/ 子路径下。
  // 用相对路径，资源才会解析成 /BiddingBox/assets/...；
  // 若保留默认的 "/"，会去找站点根的 /assets/... 而 404。
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
