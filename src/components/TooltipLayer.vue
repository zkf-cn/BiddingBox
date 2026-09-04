<script setup>
/**
 * 全站唯一的 tooltip 浮动层（配合 src/directives/tooltip.js 使用）
 * 挂载在 App 根层，position:fixed 脱离所有 overflow 容器，永不被裁剪。
 */
import { ref, onMounted } from 'vue'
import { tipState } from '@/directives/tooltip'

const el = ref(null)
onMounted(() => {
  tipState.el = el.value
})
</script>

<template>
  <div
    ref="el"
    class="tip-layer no-print"
    :class="[`tip-layer--${tipState.placement}`, { 'is-show': tipState.show }]"
    :style="{
      left: tipState.x + 'px',
      top: tipState.y + 'px',
      '--tip-ax': tipState.ax + 'px',
      '--tip-ay': tipState.ay + 'px',
    }"
    role="tooltip"
    aria-hidden="true"
  >{{ tipState.text }}</div>
</template>
