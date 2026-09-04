/**
 * 全局 Tooltip —— 全站唯一实现（S5）
 *
 * 背景：原先存在三套并行的 tooltip 实现
 *   1. [data-tooltip]::after  CSS 伪元素（会被任意祖先的 overflow:hidden 裁剪）
 *   2. .sidebar-tip           JS fixed 浮动层（侧边栏，为绕开 1 的裁剪打的补丁）
 *   3. .toggle-tip            JS fixed 浮动层（QuotaView 折叠按钮，同上）
 * 后两套都是补丁，且各自维护一套定位逻辑，导致"被遮挡 / 位置不对 / 点击后不消失"
 * 反复出现。现统一为一套：单个 fixed 浮动层 + 全局事件委托 + 边界翻转。
 *
 * 用法（三选一，效果完全一致）：
 *   1. 静态文本：      <button data-tooltip="提示文本">
 *   2. 原生 title：    <button title="提示文本">   （启动时自动转为 data-tooltip）
 *   3. 动态文本：      <button v-tooltip="text">   （指令只负责写入 data-tooltip）
 * 需要指定方向时加属性：data-tooltip-placement="top|bottom|left|right"（默认 top）
 */
import { nextTick, reactive } from 'vue'

/** 浮动层状态（由 TooltipLayer.vue 渲染） */
export const tipState = reactive({
  show: false,
  text: '',
  placement: 'top',
  x: 0,
  y: 0,
  ax: 0, // 箭头在浮层内的横向偏移（top/bottom 方向时用）
  ay: 0, // 箭头在浮层内的纵向偏移（left/right 方向时用）
  el: null, // 浮层 DOM 实例，供测量尺寸
})

const GAP = 10 // 浮层与触发元素间距
const EDGE = 8 // 视口安全边距
const ARROW_PAD = 12 // 箭头距浮层圆角的最小距离

let currentEl = null
let hideTimer = null

const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max))

function hideNow() {
  clearTimeout(hideTimer)
  currentEl = null
  tipState.show = false
}

function hideSoon() {
  clearTimeout(hideTimer)
  hideTimer = window.setTimeout(hideNow, 80)
}

async function showFor(el) {
  const text = el.getAttribute('data-tooltip') || ''
  if (!text.trim()) return hideNow()

  const r = el.getBoundingClientRect()
  if (!r.width && !r.height) return hideNow()

  const placement = el.getAttribute('data-tooltip-placement') || 'top'

  clearTimeout(hideTimer)
  // 先写文本、保持隐藏，等 DOM 更新后测量真实尺寸再定位，避免出现位置跳动
  tipState.text = text
  tipState.show = false
  await nextTick()

  const tip = tipState.el
  if (!tip) return
  const tw = tip.offsetWidth
  const th = tip.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight

  // 边界翻转：首选方向空间不足时自动换到对侧
  let p = placement
  if (p === 'top' && r.top - GAP - th < EDGE) p = 'bottom'
  else if (p === 'bottom' && r.bottom + GAP + th > vh - EDGE) p = 'top'
  else if (p === 'right' && r.right + GAP + tw > vw - EDGE) p = 'left'
  else if (p === 'left' && r.left - GAP - tw < EDGE) p = 'right'

  let x = 0
  let y = 0
  let ax = 0
  let ay = 0

  if (p === 'top' || p === 'bottom') {
    const center = r.left + r.width / 2
    x = center - tw / 2
    x = clamp(x, EDGE, vw - tw - EDGE) // 水平夹进视口
    y = p === 'top' ? r.top - GAP - th : r.bottom + GAP
    ax = clamp(center - x, ARROW_PAD, Math.max(ARROW_PAD, tw - ARROW_PAD))
  } else {
    const center = r.top + r.height / 2
    x = p === 'right' ? r.right + GAP : r.left - GAP - tw
    y = center - th / 2
    y = clamp(y, EDGE, vh - th - EDGE)
    ay = clamp(center - y, ARROW_PAD, Math.max(ARROW_PAD, th - ARROW_PAD))
  }

  tipState.placement = p
  tipState.x = Math.round(x)
  tipState.y = Math.round(y)
  tipState.ax = Math.round(ax)
  tipState.ay = Math.round(ay)
  tipState.show = true
}

/** 把原生 title 迁移到 data-tooltip，并补 aria-label 保证读屏可用 */
function convertTitles(root) {
  if (!root || !root.querySelectorAll) return
  root.querySelectorAll('[title]').forEach((el) => {
    const t = el.getAttribute('title')
    if (!t) return
    if (!el.hasAttribute('data-tooltip')) el.setAttribute('data-tooltip', t)
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', t)
    el.removeAttribute('title') // 移除原生 title，避免与自定义浮层双份显示
  })
}

function applyBinding(el, binding) {
  const v = binding.value
  const text = v && typeof v === 'object' ? v.text : v
  const placement = (v && typeof v === 'object' && v.placement) || binding.arg || null
  if (text) {
    el.setAttribute('data-tooltip', String(text))
    if (placement) el.setAttribute('data-tooltip-placement', placement)
  } else {
    el.removeAttribute('data-tooltip')
    el.removeAttribute('data-tooltip-placement')
    if (currentEl === el) hideNow()
  }
}

/** 在 createApp 之后调用一次即可 */
export function installTooltip(app) {
  app.directive('tooltip', {
    mounted: applyBinding,
    updated: applyBinding,
    unmounted(el) {
      if (currentEl === el) hideNow()
    },
  })

  // 全局事件委托：任何带 data-tooltip 的元素都自动生效（含运行时动态插入的）
  document.addEventListener('mouseover', (e) => {
    const el = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null
    if (!el) {
      if (currentEl) hideSoon()
      return
    }
    if (el === currentEl) return
    currentEl = el
    showFor(el)
  })

  document.addEventListener('mouseout', (e) => {
    const el = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null
    if (!el) return
    const rel = e.relatedTarget
    if (rel && el.contains(rel)) return // 在元素内部移动时不隐藏
    hideSoon()
  })

  // 点击后立即隐藏：解决「点击折叠按钮后鼠标未移动，tooltip 仍停留」的问题
  document.addEventListener('click', () => hideNow(), true)
  // 滚动/缩放时浮层不再跟随（fixed 定位会与内容脱节），直接隐藏
  window.addEventListener('scroll', hideNow, true)
  window.addEventListener('resize', hideNow)

  convertTitles(document.body)
  new MutationObserver((muts) => {
    muts.forEach((m) =>
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) convertTitles(n)
      })
    )
  }).observe(document.body, { childList: true, subtree: true })
}
