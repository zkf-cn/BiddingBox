<script setup>
/** 左侧常驻可折叠侧边栏：收起后仅显示图标 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { groupCalcs } from '@/views/calc/defs'
import logoUrl from '@/assets/logo.svg'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])

const route = useRoute()
const groups = computed(() => groupCalcs())

const QUERY_MENU = [
  { to: '/quota', label: '工期定额查询', icon: 'clock' },
  { to: '/expert', label: '专家分类查询', icon: 'users' },
]

const isActive = (to) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <aside class="app-sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <img class="sidebar-logo__icon" :src="logoUrl" width="26" height="26" alt="招标百宝箱 LOGO" />
      </div>
      <div class="grow">
        <div class="sidebar-title">招标百宝箱</div>
        <div class="sidebar-sub">BIDDING TOOLKIT</div>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="主导航">
      <div class="sidebar-group">
        <RouterLink to="/" class="sidebar-link" :class="{ 'is-active': isActive('/') && route.path === '/' }" :aria-label="'首页'" v-tooltip:right="collapsed ? '首页' : ''">
          <span class="sidebar-icon"><AppIcon name="home" /></span>
          <span class="sidebar-label">首页</span>
        </RouterLink>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-divider"><span>计费计算器</span></div>
        <template v-for="g in groups" :key="g.group">
          <RouterLink
            v-for="c in g.items"
            :key="c.id"
            :to="`/calc/${c.id}`"
            class="sidebar-link"
            :class="{ 'is-active': isActive(`/calc/${c.id}`) }"
            :aria-label="c.name"
            v-tooltip:right="collapsed ? c.name : ''"
          >
            <span class="sidebar-icon"><AppIcon :name="c.icon || 'calculator'" /></span>
            <span class="sidebar-label">{{ c.name }}</span>
          </RouterLink>
        </template>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-divider"><span>查询模块</span></div>
        <RouterLink
          v-for="m in QUERY_MENU"
          :key="m.to"
          :to="m.to"
          class="sidebar-link"
          :class="{ 'is-active': isActive(m.to) }"
          :aria-label="m.label"
          v-tooltip:right="collapsed ? m.label : ''"
        >
          <span class="sidebar-icon"><AppIcon :name="m.icon" /></span>
          <span class="sidebar-label">{{ m.label }}</span>
        </RouterLink>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-divider"><span>其他</span></div>
        <RouterLink to="/about" class="sidebar-link" :class="{ 'is-active': isActive('/about') }" :aria-label="'数据版本与说明'" v-tooltip:right="collapsed ? '数据版本与说明' : ''">
          <span class="sidebar-icon"><AppIcon name="info" /></span>
          <span class="sidebar-label">数据版本与说明</span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button
        class="btn btn-sm btn-icon"
        style="width: 100%"
        :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
        v-tooltip:right="collapsed ? '展开侧边栏' : '收起侧边栏'"
        @click="emit('toggle')"
      >
        <!-- 收起态（点击展开）：右指三角 + 三条线 -->
        <svg v-if="collapsed" viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor">
          <path d="M904.14 180.99H120.27c-16.57 0-30-13.43-30-30s13.43-30 30-30h783.86c16.57 0 30 13.43 30 30s-13.42 30-29.99 30zM904.14 421.55H440.13c-16.57 0-30-13.43-30-30s13.43-30 30-30h464.01c16.57 0 30 13.43 30 30s-13.43 30-30 30zM904.14 662.12H440.13c-16.57 0-30-13.43-30-30s13.43-30 30-30h464.01c16.57 0 30 13.43 30 30s-13.43 30-30 30zM904.14 902.68H120.27c-16.57 0-30-13.43-30-30s13.43-30 30-30h783.86c16.57 0 30 13.43 30 30s-13.42 30-29.99 30zM306.79 505.58L127.46 402.05v207.06z"/>
        </svg>
        <!-- 展开态（点击收起）：左指三角 + 三条线 -->
        <svg v-else viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor">
          <path d="M904.14 180.99H120.27c-16.57 0-30-13.43-30-30s13.43-30 30-30h783.86c16.57 0 30 13.43 30 30s-13.42 30-29.99 30zM904.14 421.55H440.13c-16.57 0-30-13.43-30-30s13.43-30 30-30h464.01c16.57 0 30 13.43 30 30s-13.43 30-30 30zM904.14 662.12H440.13c-16.57 0-30-13.43-30-30s13.43-30 30-30h464.01c16.57 0 30 13.43 30 30s-13.43 30-30 30zM904.14 902.68H120.27c-16.57 0-30-13.43-30-30s13.43-30 30-30h783.86c16.57 0 30 13.43 30 30s-13.42 30-29.99 30zM127.46 505.58l179.33-103.53v207.06z"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* 分隔线样式（替代原 sidebar-group-title 文字标题） */
/* 左上角 LOGO 图标：固定尺寸，浅色主题用主题色、深色主题保持可见 */
.sidebar-logo__icon {
  width: 36px;
  height: 36px;
  display: block;
  border-radius: 50%;
}
.sidebar-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground, #8892a4);
  user-select: none;
}
.sidebar-divider::before,
.sidebar-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border, rgba(128, 138, 156, 0.25));
}
.sidebar-divider span {
  white-space: nowrap;
  flex-shrink: 0;
}
/* 收缩态：分隔线变为一条完整横线 */
.is-collapsed .sidebar-divider {
  padding: 12px 10px 6px;
  gap: 0;
}
.is-collapsed .sidebar-divider span {
  display: none;
}
.is-collapsed .sidebar-divider::before,
.is-collapsed .sidebar-divider::after {
  flex: 1;
}
</style>
