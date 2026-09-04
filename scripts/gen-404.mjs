/**
 * 构建后处理：生成 GitHub Pages 的 SPA 404 重定向页 + .nojekyll
 *
 * 根路径部署（base=/）：404.html 直接复制 index.html，Vue Router 自行接管。
 * 子路径部署（base=/仓库名/）：404.html 走 redirect 参数跳回首页，由 App.vue 还原真实路由。
 *   原因：访问 /仓库名/calc/agent 时，相对资源会解析到错误路径，必须回落到 base 再交给前端路由。
 *
 * 用法：node scripts/gen-404.mjs（npm run build 后由 postbuild 自动调用）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, '../dist')
const indexFile = path.join(dist, 'index.html')

if (!fs.existsSync(indexFile)) {
  console.error('× 未找到 dist/index.html，请先执行 npm run build')
  process.exit(1)
}

// GitHub Pages 默认忽略下划线开头的目录，加上此文件可避免 assets 被跳过
fs.writeFileSync(path.join(dist, '.nojekyll'), '')
console.log('  ✓ .nojekyll')

const base = process.env.VITE_BASE || '/'

if (base === '/') {
  fs.copyFileSync(indexFile, path.join(dist, '404.html'))
  console.log('  ✓ 404.html（根路径部署：index.html 副本）')
} else {
  const b = base.endsWith('/') ? base : `${base}/`
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>正在跳转…</title>
    <script>
      (function () {
        var base = ${JSON.stringify(b)}
        var l = window.location
        var rest = l.pathname.slice(base.length) + l.search + l.hash
        l.replace(base + '?redirect=' + encodeURIComponent(rest))
      })()
    </script>
  </head>
  <body></body>
</html>
`
  fs.writeFileSync(path.join(dist, '404.html'), html)
  console.log(`  ✓ 404.html（子路径部署 base=${b}，重定向页）`)
}

console.log('构建后处理完成')
