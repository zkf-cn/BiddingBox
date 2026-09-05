<script setup>
/** 顶部导航栏：移动端菜单、侧栏切换、全屏、主题切换（日/月形变+圆形扩散动效） */
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { iconStroke } from '@/utils/iconStroke'
import { useTheme } from '@/composables/useTheme'
import { groupCalcs } from '@/views/calc/defs'

// 顶栏内联 SVG 均为 18px，线宽取全站统一真源（18px → 用户坐标 2.0，与全屏图标一致）
const ICON_STROKE = iconStroke(18)

const emit = defineEmits(['toggle-sidebar', 'open-mobile'])

const props = defineProps({
  collapsed: { type: Boolean, default: false },
})

const route = useRoute()
const { theme, accent, setTheme, setAccent, ACCENTS } = useTheme()

/* ---------- 主题预设（Vben 式 data-accent 色板） ---------- */
const showAccent = ref(false)
const accentBtn = ref(null)
function onAccentClick(event) {
  event.stopPropagation()
  showAccent.value = !showAccent.value
}
function pickAccent(type) {
  setAccent(type)
  showAccent.value = false
}
function onDocClick(e) {
  if (showAccent.value && accentBtn.value && !accentBtn.value.contains(e.target)) {
    showAccent.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const TITLES = {
  '/': { title: '首页', sub: '计费计算器 · 定额查询 · 专家分类' },
  '/quota': { title: '工期定额查询', sub: '建筑安装工程工期定额（TY01-89-2016）' },
  '/expert': { title: '评标专家分类查询', sub: '公共资源交易评标专家专业分类标准' },
  '/about': { title: '数据版本与说明', sub: '标准文号、数据来源与免责声明' },
}

const current = computed(() => {
  if (route.name === 'calc') {
    const id = route.params.id
    for (const g of groupCalcs()) {
      const hit = g.items.find((c) => c.id === id)
      if (hit) return { title: hit.name, sub: `${hit.docNo} · ${hit.stdName}` }
    }
  }
  return TITLES[route.path] || { title: '招标百宝箱', sub: '' }
})

const PAGE_ICON = {
  '/': 'home',
  '/quota': 'clock',
  '/expert': 'users',
  '/about': 'info',
}

const GROUP_ICON = {
  计费工具: 'calculator',
}

const pageIcon = computed(() => {
  if (route.name === 'calc') {
    const id = route.params.id
    for (const g of groupCalcs()) {
      const hit = g.items.find((c) => c.id === id)
      if (hit) return hit.icon || GROUP_ICON[g.group] || 'calculator'
    }
  }
  return PAGE_ICON[route.path] || 'home'
})

/* ---------- 全屏（移植自招标百宝箱网站） ---------- */
const isFullscreen = ref(false)
function syncFullscreen() {
  isFullscreen.value = !!document.fullscreenElement
}
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
onMounted(() => document.addEventListener('fullscreenchange', syncFullscreen))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', syncFullscreen))

/* ---------- 主题切换：1:1 复刻 Vben theme-button.vue 的圆形动效 ----------
   方向语义（与 Vben 一致）：
   · 浅 → 深：动画作用在【旧(浅)快照】上，circle(满) → circle(0)，浅色向点击点收起；
   · 深 → 浅：动画作用在【新(浅)快照】上，circle(0) → circle(满)，浅色从点击点展开。
   时长 450ms / easing ease-in，结束后 skipTransition()。
   兜底：不支持 VT（Firefox 等）、动画进行中、用户开启「减少动态效果」时即时切换。 */
let themeTransitioning = false
function onThemeClick(event) {
  const next = theme.value === 'light' ? 'dark' : 'light'
  const doc = document

  const isAppearanceTransition =
    typeof doc.startViewTransition === 'function' &&
    !themeTransitioning &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    setTheme(next)
    return
  }

  // 圆心取点击坐标（键盘触发时退化为按钮中心），半径为覆盖全屏的最短值
  const btn = event?.currentTarget
  let x, y
  if (event && (event.clientX || event.clientY)) {
    x = event.clientX
    y = event.clientY
  } else if (btn) {
    const r = btn.getBoundingClientRect()
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  } else {
    x = window.innerWidth / 2
    y = window.innerHeight / 2
  }
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )
  const goingDark = next === 'dark'

  themeTransitioning = true
  const reset = () => {
    themeTransitioning = false
  }

  let transition
  try {
    transition = doc.startViewTransition(async () => {
      setTheme(next)
      await nextTick()
    })
  } catch (e) {
    reset()
    setTheme(next)
    return
  }

  // finished 终会 settle（成功/跳过/出错），用 finally 兜底复位，避免标志位卡死
  if (transition && typeof transition.finished?.finally === 'function') {
    transition.finished.finally(reset)
  } else {
    reset()
  }

  transition?.ready
    ?.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
      const animate = doc.documentElement.animate(
        { clipPath: goingDark ? clipPath.slice().reverse() : clipPath },
        {
          duration: 450,
          easing: 'ease-in',
          pseudoElement: goingDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        },
      )
      animate.onfinish = () => transition.skipTransition?.()
    })
    .catch(() => {
      // ready 未兑现（如伪元素动画不支持）时立即结束过渡，避免旧快照滞留在顶层
      transition.skipTransition?.()
      reset()
    })
}
</script>

<template>
  <header class="app-header no-print">
    <button class="btn btn-icon btn-sm mobile-menu" aria-label="打开菜单" @click="emit('open-mobile')">
      <AppIcon name="menu" />
    </button>
    <div class="page-icon-badge">
      <AppIcon :name="pageIcon" :size="20" />
    </div>

    <div class="grow" style="min-width: 0">
      <div class="truncate" style="font-weight: 650; font-size: 14.5px">{{ current.title }}</div>
      <div class="truncate text-sm text-muted" style="line-height: 1.3">{{ current.sub }}</div>
    </div>

    <!-- 主题切换（日/月形变 + 圆形扩散动效，移植自招标百宝箱网站） -->
    <button
      id="themeToggle"
      class="btn btn-icon theme-toggle"
      :class="theme === 'dark' ? 'is-light' : 'is-dark'"
      :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
      :title="theme === 'dark' ? '浅色主题' : '深色主题'"
      @click="onThemeClick"
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <mask id="theme-toggle-moon" class="theme-toggle__moon">
          <rect fill="white" x="0" y="0" width="100%" height="100%" />
          <circle cx="40" cy="8" r="11" fill="black" />
        </mask>
        <circle class="theme-toggle__sun" cx="12" cy="12" r="11" mask="url(#theme-toggle-moon)" fill="currentColor" />
        <g class="theme-toggle__sun-beams" stroke="currentColor" :stroke-width="ICON_STROKE">
          <line x1="12" x2="12" y1="1" y2="3" />
          <line x1="12" x2="12" y1="21" y2="23" />
          <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
          <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
          <line x1="1" x2="3" y1="12" y2="12" />
          <line x1="21" x2="23" y1="12" y2="12" />
          <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
          <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
        </g>
      </svg>
    </button>

    <!-- 主题配色预设（Vben 式 data-accent 切换） -->
    <div class="accent-wrap" ref="accentBtn">
      <button
        class="btn btn-icon accent-trigger"
        :class="{ 'is-active': showAccent }"
        aria-label="主题配色预设"
        title="主题配色预设"
        @click="onAccentClick"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="ICON_STROKE" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="6.5" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
          <path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h1.5a4.5 4.5 0 0 0 4.5-4.5c0-3.9-3.1-7-7-7Z" />
        </svg>
      </button>
      <div v-show="showAccent" class="accent-pop no-print">
        <div class="accent-pop__title">主题配色</div>
        <div class="accent-grid">
          <button
            v-for="a in ACCENTS"
            :key="a.type"
            class="accent-dot"
            :class="{ 'is-active': accent === a.type }"
            :title="a.label"
            :aria-label="a.label"
            @click="pickAccent(a.type)"
          >
            <span class="accent-dot__sw" :style="{ background: a.color }"></span>
            <span class="accent-dot__label">{{ a.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 全屏（移植自招标百宝箱网站：图标随状态切换） -->
    <button
      class="btn btn-icon fullscreen-toggle"
      :class="{ 'is-fullscreen': isFullscreen }"
      :aria-label="isFullscreen ? '退出全屏' : '全屏'"
      :title="isFullscreen ? '退出全屏' : '全屏'"
      @click="toggleFullscreen"
    >
      <svg class="icon-fullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="ICON_STROKE" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
      <svg class="icon-exit-fullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="ICON_STROKE" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3" />
        <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
        <path d="M3 16h3a2 2 0 0 1 2 2v3" />
        <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
      </svg>
    </button>
  </header>
</template>

<style scoped>
.mobile-menu {
  display: none;
}

/* 当前页面图标（替代原折叠按钮） */
.page-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--primary);
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .mobile-menu {
    display: inline-flex;
  }
  .page-icon-badge {
    display: none;
  }
}

/* 全屏图标交换（移植自招标百宝箱网站） */
.fullscreen-toggle .icon-exit-fullscreen {
  display: none;
}
.fullscreen-toggle.is-fullscreen .icon-fullscreen {
  display: none;
}
.fullscreen-toggle.is-fullscreen .icon-exit-fullscreen {
  display: block;
}

/* 主题切换图标：日/月形变（移植自招标百宝箱网站） */
.theme-toggle svg {
  display: block;
  overflow: visible;
}
.theme-toggle__moon > circle {
  transition: transform 0.5s cubic-bezier(0, 0, 0.3, 1);
}
.theme-toggle__sun {
  transform-origin: center center;
  transition: transform 1.6s cubic-bezier(0.25, 0, 0.2, 1);
}
.theme-toggle__sun-beams {
  transform-origin: center center;
  transition:
    transform 1.6s cubic-bezier(0.5, 1.5, 0.75, 1.25),
    opacity 0.6s cubic-bezier(0.25, 0, 0.3, 1);
}
.theme-toggle.is-light .theme-toggle__sun {
  transform: scale(0.5);
}
.theme-toggle.is-light .theme-toggle__sun-beams {
  transform: rotateZ(0.25turn);
}
.theme-toggle.is-dark .theme-toggle__moon > circle {
  transform: translateX(-20px);
}
.theme-toggle.is-dark .theme-toggle__sun-beams {
  opacity: 0;
}
.theme-toggle:hover {
  color: var(--primary);
}

/* 主题配色预设色板 */
.accent-wrap {
  position: relative;
}
.accent-trigger {
  color: var(--foreground);
}
.accent-trigger.is-active,
.accent-trigger:hover {
  color: var(--primary);
}
.accent-pop {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  width: 232px;
  padding: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
}
.accent-pop__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted-foreground);
  margin-bottom: 10px;
}
.accent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.accent-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted-foreground);
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.accent-dot:hover {
  background: var(--muted);
}
.accent-dot.is-active {
  border-color: var(--primary);
  color: var(--foreground);
}
.accent-dot__sw {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
}

/* 顶栏图标按钮：去掉边框 + 圆形 + 软 hover + 按压反馈，对齐 Vben VbenIconButton(ghost) */
.app-header .btn-icon {
  border: none;                 /* Vben ghost：无边框 */
  background: transparent;      /* Vben ghost：透明底 */
  border-radius: 50%;           /* Vben rounded-full：圆形 */
  color: var(--primary);        /* 浅色跟随主题色（延续上一轮要求） */
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.app-header .btn-icon:hover:not(:disabled) {
  background: var(--primary-soft);     /* Vben 同款软高亮（中性灰改为主题浅色，避免色跳变） */
  color: var(--primary);               /* 保持主题色，不加重（不加粗） */
}
.app-header .btn-icon:active:not(:disabled) {
  transform: scale(0.94);              /* 轻微按压（点击效果） */
  background: var(--primary-soft);
  color: var(--primary);
}
.app-header .btn-icon:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--ring);  /* Vben focus-visible:ring-1 ring-ring */
}
/* 深色：固定中性（与你定的规则一致） */
[data-theme='dark'] .app-header .btn-icon,
.dark .app-header .btn-icon {
  color: var(--foreground);
}
[data-theme='dark'] .app-header .btn-icon:hover:not(:disabled),
.dark .app-header .btn-icon:hover:not(:disabled),
[data-theme='dark'] .app-header .btn-icon:active:not(:disabled),
.dark .app-header .btn-icon:active:not(:disabled) {
  background: hsl(216 5% 19%);   /* 固定中性深色（Vben 默认深色 --accent） */
  color: var(--foreground);
}

/* 图标 hover 动效（鼠标进入：图标先缩小再还原，不放大超过原尺寸）
   作用于 svg 根元素，与 .theme-toggle 子元素（日/月形变）互不冲突 */
.app-header .btn-icon svg {
  transition: transform 0.2s ease;
}
.app-header .btn-icon:hover svg {
  animation: icon-shrink-restore 0.3s ease both;
}
@keyframes icon-shrink-restore {
  0%   { transform: scale(1); }
  45%  { transform: scale(0.82); }   /* 缩小 */
  100% { transform: scale(1); }      /* 还原，不放大于原尺寸 */
}
</style>
