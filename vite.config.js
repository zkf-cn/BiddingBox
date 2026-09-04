import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * VITE_BASE：部署到 GitHub Pages 项目站时设为 /<仓库名>/（首尾都要带斜杠）。
 * 例：VITE_BASE=/gongcheng-jifei/ npm run build
 * 部署到根域名或自有服务器根目录时留空即可（默认 '/'）。
 */
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2018',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 大数据集与第三方库拆包，避免首屏一次性加载 500KB+
        manualChunks(id) {
          if (id.includes('node_modules/xlsx')) return 'vendor-xlsx'
          if (id.includes('node_modules/vue')) return 'vendor-vue'
          if (id.includes('src/data/quota.json')) return 'data-quota'
          if (id.includes('src/data/expert.json')) return 'data-expert'
          return undefined
        },
      },
    },
  },
})
