/**
 * 多标签页（1:1 对齐 Vben tabbar / use-tabbar.ts）：
 * · 打开的路由自动生成标签，首页为固定标签（affix，不可关闭），其余标签可右键「固定」
 * · 标签列表持久化到 localStorage（ui_tabbar），固定状态一并持久化
 * · 批量关闭：左侧 / 右侧 / 其它 / 全部（Vben closeLeftTabs / closeRightTabs / closeOtherTabs / closeAllTabs）
 * · 禁用态对齐 Vben getTabDisableState（最左不可关左、最右不可关右、非当前不可刷新等）
 * · refreshTick：RouterView :key 绑定，重新加载当前视图（Vben refreshTab）
 * · contentMaximize：内容区最大化（隐藏侧边栏与顶栏，对齐 Vben useContentMaximize）
 */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { groupCalcs } from '@/views/calc/defs'

const TABS_KEY = 'ui_tabbar'

/** 固定标签（始终存在，不可关闭） */
const AFFIX_TAB = { key: '/', title: '首页', icon: 'home', affix: true }

/** 由路由解析页面元信息（标题 + 图标），与 AppHeader 的 TITLES/PAGE_ICON 保持一致 */
function resolvePageMeta(path, routeName, params = {}) {
  if (routeName === 'calc' && params.id) {
    for (const g of groupCalcs()) {
      const hit = g.items.find((c) => c.id === params.id)
      if (hit) return { title: hit.name, icon: hit.icon || 'calculator' }
    }
  }
  const STATIC = {
    '/': { title: '首页', icon: 'home' },
    '/quota': { title: '工期定额查询', icon: 'clock' },
    '/expert': { title: '评标专家分类查询', icon: 'users' },
    '/about': { title: '数据版本与说明', icon: 'info' },
  }
  return STATIC[path] || { title: '招标百宝箱', icon: 'home' }
}

function loadTabs() {
  try {
    const raw = JSON.parse(localStorage.getItem(TABS_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    // 只保留合法对象，且过滤掉首页固定标签（避免重复）；恢复 pin 状态
    return raw
      .filter((t) => t && typeof t.key === 'string' && t.key !== AFFIX_TAB.key)
      .map((t) => ({ ...t, affix: t.affix === true }))
  } catch {
    return []
  }
}

/**
 * 「在新窗口打开」标记（URL 带 ?newwin=1）：
 * 新窗口只保留固定标签 + 打开的目标标签，不恢复历史标签；随后从地址栏清掉标记
 */
function openedInNewWindow() {
  if (typeof window === 'undefined' || !window.location) return false
  const sp = new URLSearchParams(window.location.search)
  if (sp.get('newwin') !== '1') return false
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete('newwin')
    window.history.replaceState(null, '', url)
  } catch {
    /* 忽略 */
  }
  return true
}

const tabs = ref(openedInNewWindow() ? [AFFIX_TAB] : [AFFIX_TAB, ...loadTabs()])
const activeKey = ref('/')
/** 重新加载当前视图的计数器（RouterView :key 拼接） */
const refreshTick = ref(0)
/** 内容区最大化（隐藏侧边栏 + 顶栏） */
const contentMaximize = ref(false)

function persist() {
  try {
    localStorage.setItem(
      TABS_KEY,
      JSON.stringify(
        tabs.value
          .filter((t) => t.key !== AFFIX_TAB.key)
          .map((t) => ({ key: t.key, title: t.title, icon: t.icon, ...(t.affix ? { affix: true } : {}) }))
      )
    )
  } catch {
    /* 存储满等异常静默 */
  }
}

/** 路由变化时调用：不存在则新增标签并激活 */
function ensureTab(route) {
  const key = route.path
  activeKey.value = key
  if (!tabs.value.some((t) => t.key === key)) {
    const meta = resolvePageMeta(key, route.name, route.params)
    tabs.value.push({ key, ...meta })
    persist()
  }
}

const findIdx = (key) => tabs.value.findIndex((t) => t.key === key)
const affixCount = () => tabs.value.filter((t) => t.affix).length

/** 关闭单个标签：返回应跳转的路径（关闭的是当前标签时跳相邻标签，否则停留原地） */
function closeTab(key) {
  const idx = findIdx(key)
  if (idx === -1 || tabs.value[idx].affix) return null
  tabs.value.splice(idx, 1)
  persist()
  if (activeKey.value !== key) return null
  const next = tabs.value[Math.min(idx, tabs.value.length - 1)]
  return next ? next.key : AFFIX_TAB.key
}

/** 关闭左侧标签（保留固定标签与目标标签，对齐 Vben closeLeftTabs） */
function closeLeft(key) {
  const idx = findIdx(key)
  if (idx <= 0) return null
  tabs.value = tabs.value.filter((t, i) => t.affix || i >= idx)
  persist()
  return tabs.value.some((t) => t.key === activeKey.value) ? null : key
}

/** 关闭右侧标签（对齐 Vben closeRightTabs） */
function closeRight(key) {
  const idx = findIdx(key)
  if (idx === -1 || idx >= tabs.value.length - 1) return null
  tabs.value = tabs.value.filter((t, i) => t.affix || i <= idx)
  persist()
  return tabs.value.some((t) => t.key === activeKey.value) ? null : key
}

/** 关闭其它标签（保留固定标签与目标标签，对齐 Vben closeOtherTabs） */
function closeOthers(key) {
  tabs.value = tabs.value.filter((t) => t.affix || t.key === key)
  persist()
  return tabs.value.some((t) => t.key === activeKey.value) ? null : key
}

/** 关闭全部标签（仅保留固定标签，对齐 Vben closeAllTabs；当前页会回到首页） */
function closeAll() {
  tabs.value = tabs.value.filter((t) => t.affix)
  persist()
  return tabs.value.some((t) => t.key === activeKey.value) ? null : AFFIX_TAB.key
}

/** 固定 / 取消固定（对齐 Vben toggleTabPin：取消固定后可关闭） */
function togglePin(key) {
  const tab = tabs.value.find((t) => t.key === key)
  if (!tab) return null
  tab.affix = !tab.affix
  persist()
  return null
}

/**
 * 右键菜单禁用态（逐项对齐 Vben getTabDisableState）：
 * · 仅剩 1 个标签 → 关闭当前/其它/全部禁用
 * · 固定标签 → 关闭当前禁用
 * · 目标不是当前标签 → 刷新/关左/关右/关其它禁用
 * · 目标已最左（扣除固定）→ 关左禁用；已最右 → 关右禁用
 */
function disableState(key) {
  const idx = findIdx(key)
  if (idx === -1) return {}
  const tab = tabs.value[idx]
  const only = tabs.value.length <= 1
  const isCurrent = activeKey.value === key
  const nAffix = affixCount()
  return {
    disabledCloseAll: only,
    disabledCloseCurrent: tab.affix || only,
    disabledCloseLeft: !isCurrent || idx === 0 || idx - nAffix <= 0,
    disabledCloseRight: !isCurrent || idx === tabs.value.length - 1,
    disabledCloseOther: only || !isCurrent || tabs.value.length - nAffix <= 1,
    disabledRefresh: !isCurrent,
  }
}

/** 重新加载当前视图（对齐 Vben refreshTab：重挂载当前路由组件） */
function refresh() {
  refreshTick.value++
}

/** 内容区最大化切换（对齐 Vben useContentMaximize.toggleMaximize） */
function toggleMaximize() {
  contentMaximize.value = !contentMaximize.value
}

/** 供 App.vue 挂载后跟随路由 */
function bindRouteWatcher() {
  const route = useRoute()
  const router = useRouter()
  ensureTab(route)
  watch(
    () => route.fullPath,
    () => ensureTab(route)
  )
  return { route, router }
}

export function useTabs() {
  return {
    tabs,
    activeKey,
    refreshTick,
    contentMaximize,
    ensureTab,
    closeTab,
    closeLeft,
    closeRight,
    closeOthers,
    closeAll,
    togglePin,
    disableState,
    refresh,
    toggleMaximize,
    bindRouteWatcher,
    AFFIX_TAB,
  }
}
