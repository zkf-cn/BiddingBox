import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installTooltip } from './directives/tooltip'
import './styles/base.css'

const app = createApp(App)
app.use(router)
// 全站唯一 tooltip 实现：注册 v-tooltip 指令 + 全局事件委托
installTooltip(app)
app.mount('#app')

// 首屏渲染完成后启用主题过渡：初始着色（含深色刷新）不过渡，避免背景扫过蓝色；
// 之后手动切换明暗/配色才平滑过渡。
requestAnimationFrame(() => {
  document.documentElement.classList.add('theme-transition')
})
