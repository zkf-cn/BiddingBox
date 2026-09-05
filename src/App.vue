<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppTabBar from './components/AppTabBar.vue'
import TooltipLayer from './components/TooltipLayer.vue'
import ToastHost from './components/ToastHost.vue'
import { useTabs } from './composables/useTabs'

const route = useRoute()
const router = useRouter()
/** 标签栏联动：refreshTick 供 RouterView 重挂载当前视图；contentMaximize 内容区最大化 */
const { refreshTick, contentMaximize } = useTabs()

/** 侧边栏折叠状态存 sessionStorage：属于临时界面状态 */
const SB_KEY = 'ui_sidebar_collapsed'
const collapsed = ref(sessionStorage.getItem(SB_KEY) === '1')
const mobileOpen = ref(false)

function toggleSidebar() {
  collapsed.value = !collapsed.value
  sessionStorage.setItem(SB_KEY, collapsed.value ? '1' : '0')
}

function openMobile() {
  mobileOpen.value = true
}

// 路由变化时收起移动端抽屉
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)

// 修复 GitHub Pages 404 重定向场景：若带 ?redirect= 参数则回跳真实路由
onMounted(() => {
  const redirect = new URLSearchParams(window.location.search).get('redirect')
  if (redirect && redirect.startsWith('/')) {
    router.replace(redirect)
  }
})
</script>

<template>
  <!-- 全站唯一 tooltip 浮动层（fixed 定位，不受任何 overflow 容器裁剪） -->
  <TooltipLayer />

  <div class="app-shell" :class="{ 'is-content-maximize': contentMaximize }">
    <div v-if="mobileOpen" class="sidebar-mask no-print" @click="mobileOpen = false" />

    <div :class="{ 'is-open': mobileOpen }" style="display: contents">
      <AppSidebar :collapsed="collapsed" @toggle="toggleSidebar" />
    </div>

    <div class="app-main">
      <AppHeader
        :collapsed="collapsed"
        @toggle-sidebar="toggleSidebar"
        @open-mobile="openMobile"
      />

      <AppTabBar />

      <main class="app-content">
        <div class="app-content-inner">
          <RouterView v-slot="{ Component }">
            <Transition name="fade-slide" appear>
              <!-- page-view：动效元素兼内边距载体——绝对定位锚点 app-content-inner 无内边距，
                   离场页 top/left:0 不会向左上跳变 -->
              <div :key="route.path + '-' + refreshTick" class="page-view">
                <component :is="Component" />
              </div>
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <ToastHost />
  </div>
</template>
