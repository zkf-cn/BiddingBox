<script setup>
/**
 * 多标签页栏（1:1 复刻 Vben tabs-chrome + layout-tabbar）：
 * · 容器 38px、bg-background、底部 1px 描边；chrome 标签 = 圆角顶背景层 + 左右 7×7 SVG 反向圆角 + 相邻 -12px 重叠
 * · TransitionGroup name="slide-left"：关闭/新增标签滑动淡出，剩余标签平滑补位（Vben transition.css 同参数）
 * · 右键菜单（Vben use-tabbar.ts createContextMenus 同 9 项）：关闭/固定/最大化/重新加载/新窗口/关左/关右/关其它/关全部
 *   菜单样式对齐 shadcn ContextMenu：min-w-8rem rounded-md border p-1，项 px-2 py-1.5 text-sm，hover accent，禁用 opacity-50
 * · 固定标签显示图钉（点击取消固定，Vben Pin → unpin）；× 仅在多于 1 个标签时显示
 * · 右侧三个工具按钮（Vben tool-more / tool-refresh / tool-screen）：
 *   更多（当前标签菜单）、刷新（重挂载当前视图）、内容区最大化切换
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTabs } from '@/composables/useTabs'
import AppIcon from './AppIcon.vue'

const {
  tabs,
  activeKey,
  contentMaximize,
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
} = useTabs()
const { router } = bindRouteWatcher()

const activeTab = computed(() => tabs.value.find((t) => t.key === activeKey.value) || tabs.value[0])

function handleClick(tab) {
  if (tab.key !== activeKey.value) router.push(tab.key)
}

function handleClose(e, tab) {
  e.stopPropagation()
  const next = closeTab(tab.key)
  if (next) router.push(next)
}

function handleAuxClick(e, tab) {
  if (e.button === 1 && tabs.value.length > 1) {
    e.preventDefault()
    const next = closeTab(tab.key)
    if (next) router.push(next)
  }
}

/** 标签横向滚轮滚动（Vben wheelable：deltaY 转 scrollLeft，倍率 3） */
function onWheel(e) {
  const el = e.currentTarget
  el.scrollLeft += e.deltaY * 3
}

/* ─────────────── 溢出滚动按钮（Vben tabs-view.vue 左右 chevron） ─────────────── */
const scrollEl = ref(null)
const showScrollButton = ref(false)
const scrollIsAtLeft = ref(true)
const scrollIsAtRight = ref(false)

/** 溢出才显示按钮；记录是否已滚到两端（到边按钮置灰，Vben scrollIsAtLeft/Right） */
function updateScrollState() {
  const el = scrollEl.value
  if (!el) return
  showScrollButton.value = el.scrollWidth > el.clientWidth
  scrollIsAtLeft.value = el.scrollLeft <= 0
  scrollIsAtRight.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
}

/** 点击按钮滚动（Vben scrollDirection：±(视口宽 - 150)，平滑） */
function scrollDirection(direction) {
  const el = scrollEl.value
  if (!el) return
  el.scrollBy({
    behavior: 'smooth',
    left: direction === 'left' ? -(el.clientWidth - 150) : el.clientWidth - 150,
  })
}

/** 激活标签滚入视野（Vben scrollToActiveIntoView） */
function scrollToActiveIntoView() {
  const el = scrollEl.value
  if (!el) return
  nextTick(() => {
    el.querySelector('.tab.is-active')?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  })
}

watch(() => tabs.value.length, updateScrollState)
watch(activeKey, scrollToActiveIntoView)

let resizeObserver = null
onMounted(() => {
  updateScrollState()
  // 容器尺寸变化（折叠侧边栏 / 窗口缩放）时重算按钮显隐（Vben ResizeObserver 同职责）
  resizeObserver = new ResizeObserver(updateScrollState)
  if (scrollEl.value) resizeObserver.observe(scrollEl.value)
})
onBeforeUnmount(() => resizeObserver?.disconnect())

/* ─────────────── 右键菜单 / 更多菜单 ─────────────── */
const menu = ref(null) // { tab, x, y }
const menuEl = ref(null)

/** 菜单项（顺序与文案 1:1 对齐 Vben zh-CN preferences.tabbar.contextMenu） */
const menuItems = computed(() => {
  if (!menu.value) return []
  const tab = menu.value.tab
  const d = disableState(tab.key)
  const isCur = tab.key === activeKey.value
  return [
    {
      key: 'close',
      text: '关闭',
      icon: 'close',
      disabled: d.disabledCloseCurrent,
      run: () => closeTab(tab.key),
    },
    {
      key: 'affix',
      text: tab.affix ? '取消固定' : '固定',
      icon: tab.affix ? 'pin-off' : 'pin',
      run: () => togglePin(tab.key),
    },
    {
      key: 'maximize',
      text: contentMaximize.value ? '还原' : '最大化',
      icon: contentMaximize.value ? 'minimize' : 'fullscreen',
      run: () => {
        if (!contentMaximize.value && !isCur) router.push(tab.key)
        toggleMaximize()
      },
    },
    {
      key: 'reload',
      text: '重新加载',
      icon: 'rotate-cw',
      disabled: d.disabledRefresh,
      run: () => refresh(),
    },
    {
      key: 'open-in-new-window',
      text: '在新窗口打开',
      icon: 'external-link',
      separator: true,
      run: () => window.open(router.resolve(tab.key).href + '?newwin=1', '_blank'),
    },
    {
      key: 'close-left',
      text: '关闭左侧标签页',
      icon: 'arrow-left-to-line',
      disabled: d.disabledCloseLeft,
      run: () => closeLeft(tab.key),
    },
    {
      key: 'close-right',
      text: '关闭右侧标签页',
      icon: 'arrow-right-to-line',
      disabled: d.disabledCloseRight,
      separator: true,
      run: () => closeRight(tab.key),
    },
    {
      key: 'close-other',
      text: '关闭其它标签页',
      icon: 'fold-horizontal',
      disabled: d.disabledCloseOther,
      run: () => closeOthers(tab.key),
    },
    {
      key: 'close-all',
      text: '关闭全部标签页',
      icon: 'arrow-right-left',
      disabled: d.disabledCloseAll,
      run: () => closeAll(),
    },
  ]
})

async function openMenuAt(x, y, tab) {
  menu.value = { tab, x, y }
  await nextTick()
  // 视口边缘收敛（reka-ui ContextMenu 的碰撞翻转行为）
  const el = menuEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  let nx = x
  let ny = y + 2
  if (nx + rect.width > window.innerWidth - 8) nx = window.innerWidth - 8 - rect.width
  if (ny + rect.height > window.innerHeight - 8) ny = Math.max(8, y - rect.height - 2)
  menu.value = { ...menu.value, x: nx, y: ny }
}

function onContextMenu(e, tab) {
  e.preventDefault()
  openMenuAt(e.clientX, e.clientY, tab)
}

function openMenuForActive(e) {
  openMenuAt(e.clientX, e.clientY + 4, activeTab.value)
}

function runMenuItem(item) {
  if (item.disabled) return
  const redirect = item.run()
  closeMenu()
  if (redirect) router.push(redirect)
}

function closeMenu() {
  menu.value = null
}

function onMenuKeydown(e) {
  if (e.key === 'Escape') closeMenu()
}

watch(menu, (v) => {
  if (v) document.addEventListener('keydown', onMenuKeydown)
  else document.removeEventListener('keydown', onMenuKeydown)
})

watch(activeKey, closeMenu)

onBeforeUnmount(() => document.removeEventListener('keydown', onMenuKeydown))
</script>

<template>
  <div class="tabbar no-print" role="tablist" aria-label="页面标签">
    <!-- 左侧滚动按钮（Vben tabs-view：溢出才显示，到边置灰） -->
    <button
      v-show="showScrollButton"
      class="tab-scroll-btn is-left"
      :class="{ 'is-at-edge': scrollIsAtLeft }"
      aria-label="向左滚动"
      @click="scrollDirection('left')"
    >
      <AppIcon name="chevrons-left" :size="16" />
    </button>

    <div ref="scrollEl" class="tabbar-scroll" @wheel.prevent="onWheel" @scroll="updateScrollState">
      <TransitionGroup name="slide-left">
        <div
          v-for="(tab, i) in tabs"
          :key="tab.key"
          class="tab"
          :class="{ 'is-active': tab.key === activeKey }"
          role="tab"
          :aria-selected="tab.key === activeKey"
          @click="handleClick(tab)"
          @auxclick="handleAuxClick($event, tab)"
          @contextmenu="onContextMenu($event, tab)"
        >
          <!-- 分隔线：非首个、自身未激活、且前一个标签未激活时才渲染（避免贴着激活标签的关闭按钮） -->
          <div
            v-if="i !== 0 && tab.key !== activeKey && tabs[i - 1].key !== activeKey"
            class="tab-divider"
          />

          <!-- 背景层：圆角内容块 + 左右反向圆角 SVG（Vben tabs-chrome__background） -->
          <div class="tab-bg">
            <div class="tab-bg-content" />
            <svg class="tab-bg-before" height="7" width="7"><path d="M 0 7 A 7 7 0 0 0 7 0 L 7 7 Z" /></svg>
            <svg class="tab-bg-after" height="7" width="7"><path d="M 0 0 A 7 7 0 0 0 7 7 L 0 7 Z" /></svg>
          </div>

          <!-- 内容：图标 + 标题（Vben tabs-chrome__item-main） -->
          <div class="tab-main">
            <span class="tab-icon"><AppIcon :name="tab.icon" :size="16" /></span>
            <span class="tab-title">{{ tab.title }}</span>
          </div>

          <!-- 右侧动作区：固定标签=图钉（点击取消固定），普通标签=×关闭（Vben tabs-chrome__extra） -->
          <button
            v-show="tab.affix && tabs.length > 1"
            class="tab-pin"
            aria-label="取消固定"
            title="取消固定"
            @click.stop="togglePin(tab.key)"
          >
            <AppIcon name="pin" :size="14" />
          </button>
          <button
            v-show="!tab.affix && tabs.length > 1"
            class="tab-close"
            :aria-label="`关闭 ${tab.title}`"
            @click="handleClose($event, tab)"
          >
            <AppIcon name="close" :size="12" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 右侧滚动按钮 -->
    <button
      v-show="showScrollButton"
      class="tab-scroll-btn is-right"
      :class="{ 'is-at-edge': scrollIsAtRight }"
      aria-label="向右滚动"
      @click="scrollDirection('right')"
    >
      <AppIcon name="chevrons-right" :size="16" />
    </button>

    <!-- 右侧工具按钮（Vben tool-more / tool-refresh / tool-screen） -->
    <div class="tabbar-tools">
      <button class="tab-tool" title="更多" aria-label="更多操作" @click="openMenuForActive">
        <AppIcon name="layout-grid" :size="16" />
      </button>
      <button class="tab-tool" title="刷新" aria-label="刷新当前页" @click="refresh">
        <AppIcon name="rotate-cw" :size="16" />
      </button>
      <button
        class="tab-tool"
        :title="contentMaximize ? '还原' : '内容区最大化'"
        :aria-label="contentMaximize ? '还原内容区' : '内容区最大化'"
        @click="toggleMaximize"
      >
        <AppIcon :name="contentMaximize ? 'minimize' : 'fullscreen'" :size="16" />
      </button>
    </div>
  </div>

  <!-- 右键 / 更多 菜单（shadcn ContextMenu 同款样式，Teleport 到 body 防裁剪） -->
  <Teleport to="body">
    <div v-if="menu" class="ctx-layer" @click="closeMenu" @contextmenu.prevent="closeMenu">
      <div
        ref="menuEl"
        class="ctx-menu"
        :style="{ left: menu.x + 'px', top: menu.y + 'px' }"
        @click.stop
      >
        <template v-for="item in menuItems" :key="item.key">
          <button
            class="ctx-item"
            :class="{ 'is-disabled': item.disabled }"
            :disabled="item.disabled"
            @click="runMenuItem(item)"
          >
            <AppIcon :name="item.icon" :size="16" class="ctx-item-icon" />
            <span>{{ item.text }}</span>
          </button>
          <div v-if="item.separator" class="ctx-sep" />
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ───── 容器（Vben layout-tabbar.vue：h-38 bg-background border-b） ───── */
.tabbar {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  height: 38px;
  background: var(--background);
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.tabbar-scroll {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: stretch;
  height: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 3px; /* Vben pt-0.75：chrome 标签与栏顶留 3px，标签实际高 35px */
  padding-right: 24px; /* Vben pr-6：给激活标签右侧反向圆角留空间 */
  scrollbar-width: none;
}
.tabbar-scroll::-webkit-scrollbar {
  display: none;
}

/* ───── 单个标签（Vben tabs-chrome__item：-mr-3 重叠、h-full、select-none） ───── */
.tab {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: -12px; /* Vben -mr-3：相邻标签重叠，露出分隔线 */
  cursor: pointer;
  user-select: none;
}
.tab.is-active {
  z-index: 2; /* Vben is-active z-[2]：背景块盖住相邻分隔线 */
}

/* 分隔线：左侧 gap 处 1px×16px（Vben left-(--gap)）；
   悬停/激活/相邻激活时隐藏（激活相邻已由模板 v-if 兜底移除） */
.tab-divider {
  position: absolute;
  top: 50%;
  left: 7px;
  z-index: 0;
  width: 1px;
  height: 16px;
  background: var(--border);
  transform: translateY(-50%);
  transition: opacity 0.15s ease;
}
.tab:hover:not(.is-active) .tab-divider,
.tab:hover:not(.is-active) + .tab .tab-divider,
.tab.is-active .tab-divider,
.tab.is-active + .tab .tab-divider {
  opacity: 0;
}

/* ───── 背景层（Vben tabs-chrome__background：px-[gap-1px] + 左右 7×7 SVG） ───── */
.tab-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  padding: 0 6px;
  transition: all 0.15s ease;
}
.tab-bg-content {
  height: 100%;
  border-radius: 7px 7px 0 0;
  background: transparent;
  transition: background 0.15s ease;
}
.tab-bg-before,
.tab-bg-after {
  position: absolute;
  bottom: 0;
  fill: transparent;
  transition: fill 0.15s ease;
}
.tab-bg-before {
  left: -1px;
}
.tab-bg-after {
  right: -1px;
}

/* 悬停（未激活）：accent 圆角块 + 底部收缩 2px（Vben hover pb-0.5 + bg-accent rounded-md mx-0.5） */
.tab:hover:not(.is-active) .tab-bg {
  padding-bottom: 2px;
}
.tab:hover:not(.is-active) .tab-bg-content {
  margin: 0 2px;
  border-radius: 7px;
  background: var(--accent);
}

/* 激活：浅色 primary/15，深色 accent（固定中性）；SVG 同步填充形成连体 chrome 形状 */
.tab.is-active .tab-bg-content,
.tab.is-active .tab-bg-before,
.tab.is-active .tab-bg-after {
  background: none;
  fill: color-mix(in srgb, var(--primary) 15%, transparent);
}
.tab.is-active .tab-bg-content {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
}

/* ───── 内容区（Vben tabs-chrome__item-main：mx-[gap*2] pl-2 pr-4 rounded-t 5px） ───── */
.tab-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 14px; /* Vben mx-[calc(var(--gap)*2)] */
  padding: 0 16px 0 8px;
  border-radius: 5px 5px 0 0;
  color: var(--accent-foreground);
  transition: color 0.15s ease;
}
.tab.is-active .tab-main {
  color: var(--primary);
}
.tab-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  overflow: hidden;
}
/* 图标 hover 缩小还原（Vben group-hover:animate-[shrink_0.3s_ease-in-out]）
   注：keyframes 需在本组件内定义——AppHeader 里的同名 keyframes 是 scoped 哈希名，跨组件引用不到 */
.tab:hover .tab-icon svg {
  animation: tab-icon-shrink 0.3s ease-in-out;
}
@keyframes tab-icon-shrink {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(0.82);
  }
  100% {
    transform: scale(1);
  }
}
.tab-title {
  font-size: 14px; /* Vben text-sm */
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* ───── 关闭按钮（Vben X：size-3 圆形 hover accent） ─────
   几何以像素实测为准（对齐用户 Vben 实例截图）：× 盒子右缘距标签边 ≈14px，
   × 笔画（12px lucide 内缩 3px）距可见背景边缘（内缩6px）≈11px 视觉间隙 */
.tab-close {
  position: absolute;
  top: 50%;
  right: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: color-mix(in srgb, var(--accent-foreground) 80%, transparent);
  transform: translateY(-50%);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.tab-close:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
/* 激活标签关闭钮：accent-foreground（Vben group-[.is-active]:text-accent-foreground，不随主题色） */
.tab.is-active .tab-close {
  color: var(--accent-foreground);
}

/* ───── 固定图钉（Vben Pin：size-3.5，点击取消固定） ─────
   与 × 保持 2px 错位：右缘距标签边 14-2=12px */
.tab-pin {
  position: absolute;
  top: 50%;
  right: 12px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: color-mix(in srgb, var(--accent-foreground) 80%, transparent);
  transform: translateY(-50%);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.tab-pin:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
.tab.is-active .tab-pin {
  color: var(--accent-foreground);
}

/* ───── 右侧工具按钮（Vben tool-more/refresh/screen：px-2 border-l + muted → hover accent） ───── */
.tabbar-tools {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
}
.tab-tool {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px; /* Vben px-2 + size-4 ≈ 32px 命中区 */
  padding: 0;
  border: none;
  border-left: 1px solid var(--border);
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.tab-tool:hover {
  background: var(--muted);
  color: var(--foreground);
}

/* ───── 溢出滚动按钮（Vben tabs-view：px-2 + 左 border-r/右 border-l，muted → hover accent） ───── */
.tab-scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px; /* Vben px-2 + size-4 */
  padding: 0;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}
.tab-scroll-btn.is-left {
  border-right: 1px solid var(--border); /* Vben class border-r */
}
.tab-scroll-btn.is-right {
  border-left: 1px solid var(--border); /* Vben class border-l */
}
.tab-scroll-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}
/* 已滚到对应尽头：置灰不可点（Vben pointer-events-none opacity-30） */
.tab-scroll-btn.is-at-edge {
  opacity: 0.3;
  pointer-events: none;
}

/* ───── 标签关闭/新增动效（Vben transition.css slide-left 同参数） ───── */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: 0.25s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.slide-left-move {
  transition: transform 0.3s;
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

/* ───── 右键菜单（shadcn ContextMenu：min-w-8rem rounded-md border p-1 shadow-md） ───── */
.ctx-layer {
  position: fixed;
  inset: 0;
  z-index: 1000;
}
.ctx-menu {
  position: fixed;
  z-index: 1001;
  min-width: 8rem;
  max-height: calc(100vh - 16px);
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  overflow-x: hidden;
  overflow-y: auto;
  animation: ctx-in 0.15s ease;
}
@keyframes ctx-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px); /* shadcn zoom-in-95 + slide-in-from-top-2 */
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 24px 6px 8px; /* Vben item-class pr-6 + px-2 py-1.5 */
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--popover-foreground);
  font-size: 14px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  user-select: none;
  transition: background-color 0.1s ease;
}
.ctx-item:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
/* 图标保持 muted（shadcn [&_svg]:text-muted-foreground） */
.ctx-item :deep(.ctx-item-icon) {
  flex: 0 0 16px;
  color: var(--muted-foreground);
}
.ctx-item.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
/* 分隔线（shadcn Separator：-mx-1 my-1 h-px bg-border） */
.ctx-sep {
  height: 1px;
  margin: 4px -4px;
  background: var(--border);
}
</style>
