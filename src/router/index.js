import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

/**
 * 使用 history 模式。部署到 GitHub Pages 时，
 * 由 public/404.html 做重定向（构建时自动生成，见 scripts/gen-404.mjs）。
 */
const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  {
    path: '/calc/:id',
    name: 'calc',
    component: () => import('@/views/calc/CalcView.vue'),
    meta: { title: '计费计算器' },
  },
  {
    path: '/quota',
    name: 'quota',
    component: () => import('@/views/QuotaView.vue'),
    meta: { title: '工期定额查询' },
  },
  {
    path: '/expert',
    name: 'expert',
    component: () => import('@/views/ExpertView.vue'),
    meta: { title: '评标专家分类查询' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '数据版本与说明' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const base = '招标百宝箱'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router
