/**
 * 服务端渲染（SSR）冒烟测试
 *
 * 目的：在 Node 里真实执行每个页面的 setup()、computed、模板渲染（不依赖浏览器），
 * 用来抓构建期抓不到的「运行时引用错误 / 模板渲染异常 / 白屏」类问题。
 *
 * 说明：本沙箱无法下载 Chrome（storage.googleapis.com 被网络隔离），故用 SSR 作为
 * 真实运行时的替代验证——它确实执行了组件逻辑与模板，比「仅读取静态 HTML 含 #app」强。
 *
 * 关键盲点修复：早期版本只逐一渲染 view 组件，绕过了 App.vue 外壳，导致 App 的
 * setup（onMounted 注册、主题/Toast 初始化）从未被测。本次新增「集成渲染」用例，
 * 用真实路由把 App 外壳 + 首页一起渲染，可抓 App 级 setup 引用错误（如漏 import onMounted）。
 *
 * 用法： node scripts/ssr-smoke.mjs
 */
import { createServer } from 'vite'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

/* ---------- 浏览器全局垫片（组件在 setup / render 时可能访问） ---------- */
function makeStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  }
}
globalThis.localStorage = makeStorage()
globalThis.sessionStorage = makeStorage()
globalThis.window = globalThis
globalThis.document = {
  documentElement: { setAttribute() {}, getAttribute: () => null, classList: { add() {}, remove() {} } },
  title: '',
  querySelector: () => null,
  getElementById: () => null,
  addEventListener() {},
  removeEventListener() {},
  createElement: () => ({}),
  body: {},
  head: {},
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

async function load(file) {
  const mod = await vite.ssrLoadModule(file)
  return mod.default
}

/* ---------- 单 view 渲染（保留原用例） ---------- */
async function renderRoute(path, component, expectedMarkers = []) {
  const routes = [{ path: '/calc/:id', component }, { path: '/:rest(.*)*', component }]
  const router = createRouter({ history: createMemoryHistory(), routes })
  const app = createSSRApp(component)
  app.use(router)
  // 自定义指令 v-tooltip 仅客户端注册（installTooltip 依赖 document），
  // SSR 无法执行其逻辑；注册空 no-op 让 server-renderer 能解析、跳过浮层渲染
  app.directive('tooltip', {})
  try {
    await router.push(path)
    await router.isReady()
    const html = await renderToString(app)
    const missing = expectedMarkers.filter((m) => !html.includes(m))
    return { ok: true, len: html.length, missing }
  } catch (e) {
    return { ok: false, error: e.message, stack: e.stack }
  }
}

const cases = [
  { path: '/', file: '/src/views/HomeView.vue', name: '首页', markers: ['纯前端本地运算', '数据查询', '计费计算器'] },
  { path: '/calc/agent', file: '/src/views/calc/CalcView.vue', name: '招标代理费', markers: ['基准价', '计费参数'] },
  { path: '/calc/cost', file: '/src/views/calc/CalcView.vue', name: '造价咨询费', markers: ['基准价', '计费参数'] },
  { path: '/calc/design', file: '/src/views/calc/CalcView.vue', name: '工程设计费', markers: ['基准价'] },
  { path: '/calc/supervision', file: '/src/views/calc/CalcView.vue', name: '施工监理费', markers: ['基准价'] },
  { path: '/calc/preconsult', file: '/src/views/calc/CalcView.vue', name: '前期咨询费', markers: ['区间'] },
  { path: '/calc/eia', file: '/src/views/calc/CalcView.vue', name: '环评咨询费', markers: ['区间'] },
  { path: '/calc/buildmgmt', file: '/src/views/calc/CalcView.vue', name: '建设管理费', markers: ['基准价'] },
  { path: '/calc/daibuild', file: '/src/views/calc/CalcView.vue', name: '代建管理费', markers: ['基准价'] },
  { path: '/calc/transaction', file: '/src/views/calc/CalcView.vue', name: '交易服务费', markers: ['元/宗'] },
  { path: '/quota', file: '/src/views/QuotaView.vue', name: '工期定额', markers: ['定额列表', '查询定额'] },
  { path: '/expert', file: '/src/views/ExpertView.vue', name: '评标专家', markers: ['评标', '检索'] },
  { path: '/about', file: '/src/views/AboutView.vue', name: '数据版本', markers: ['数据版本'] },
]

let failed = 0
for (const c of cases) {
  const comp = await load(c.file)
  const res = await renderRoute(c.path, comp, c.markers)
  if (!res.ok) {
    failed++
    console.log(`× [${c.name}] ${c.path} 渲染抛错：${res.error}`)
    if (res.stack) console.log('   ' + res.stack.split('\n').slice(0, 3).join('\n   '))
  } else if (res.missing.length) {
    failed++
    console.log(`× [${c.name}] ${c.path} 缺失预期内容：${res.missing.join('、')}（渲染长度 ${res.len}）`)
  } else {
    console.log(`✓ [${c.name}] ${c.path} 渲染成功（${res.len} 字符）`)
  }
}

/* ---------- 额外：固定单价模式模板分支 ---------- */
{
  const defsMod = await vite.ssrLoadModule('/src/views/calc/defs.js')
  const cost = defsMod.CALC_DEFS.find((c) => c.id === 'cost')
  const prevItem = cost.defaults.item
  cost.defaults.item = '9' // 工程量清单钢筋精细计量：fixed=12元/吨
  const comp = await load('/src/views/calc/CalcView.vue')
  const res = await renderRoute('/calc/cost', comp, ['固定单价', '12元/吨', '计价说明'])
  cost.defaults.item = prevItem
  if (!res.ok) {
    failed++
    console.log(`× [固定单价模式] 渲染抛错：${res.error}`)
  } else if (res.missing.length) {
    failed++
    console.log(`× [固定单价模式] 缺失：${res.missing.join('、')}`)
  } else {
    console.log(`✓ [固定单价模式] 钢筋精细计量 渲染成功（${res.len} 字符，含「12元/吨」）`)
  }
}

/* ---------- 集成渲染：真实 App 外壳 + 路由（抓 App 级 setup 错误） ---------- */
{
  const HomeView = await load('/src/views/HomeView.vue')
  const CalcView = await load('/src/views/calc/CalcView.vue')
  const QuotaView = await load('/src/views/QuotaView.vue')
  const ExpertView = await load('/src/views/ExpertView.vue')
  const AboutView = await load('/src/views/AboutView.vue')
  const App = await load('/src/App.vue')

  const appRoutes = [
    { path: '/', component: HomeView },
    { path: '/calc/:id', component: CalcView },
    { path: '/quota', component: QuotaView },
    { path: '/expert', component: ExpertView },
    { path: '/about', component: AboutView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ]
  const router = createRouter({ history: createMemoryHistory(), routes: appRoutes })
  const app = createSSRApp(App)
  app.use(router)
  app.directive('tooltip', {})
  try {
    await router.push('/')
    await router.isReady()
    const html = await renderToString(app)
    const markers = ['招标百宝箱', 'BIDDING TOOLKIT']
    const missing = markers.filter((m) => !html.includes(m))
    if (missing.length) {
      failed++
      console.log(`× [集成 App 外壳] / 缺失：${missing.join('、')}（长度 ${html.length}）`)
    } else {
      console.log(`✓ [集成 App 外壳] / 渲染成功（${html.length} 字符，含 sidebar+header+首页）`)
    }
  } catch (e) {
    failed++
    console.log(`× [集成 App 外壳] / 渲染抛错：${e.message}`)
    if (e.stack) console.log('   ' + e.stack.split('\n').slice(0, 4).join('\n   '))
  }
}

await vite.close()
console.log('\n' + (failed === 0 ? 'SSR 冒烟全部通过' : `SSR 冒烟失败 ${failed} 项`))
process.exit(failed === 0 ? 0 : 1)
