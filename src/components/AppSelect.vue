<script setup>
/** AppSelect —— 下拉选择器
 *  视觉与交互对齐 Vben Admin 5 的 Select（packages/@core/ui-kit/shadcn-ui/src/ui/select + components/select/select.vue）：
 *  · 触发器：h-9(36px) / h-8(32px) 圆角 6px、1px 边框、右侧 ChevronDown(16px, opacity .5)、聚焦 3px ring
 *  · 弹出层：Teleport 到 body，popper 定位（下方优先、空间不足向上翻转），宽≥触发器宽、最小 8rem
 *  · 动效：打开 fade-in + zoom-in-95 + 从上方/下方滑入 4px（Vben data-[state=open] 同款）
 *  · 选项：py-1.5 pl-2 pr-8、hover/focus 走 accent 配色、选中项右侧 Check 指示器
 *  · 清空：allowClear 时右侧显示 CircleX（Vben select.vue 的 data-clear-button）
 *  Vben 依赖 reka-ui，本项目未安装，故用 Teleport + 自算定位实现同等效果，不引入新依赖。
 *
 *  size 说明：default=36px(Vben) / sm=32px(Vben) / form=38px+10px 圆角(对齐本项目 .input 输入框)
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  /** [{ label, value, disabled? }] ，也接受原始值数组（['a','b']） */
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  size: { type: String, default: 'default' }, // default | sm | form
  allowClear: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  /** 弹出层内容区最大高度（Vben 用的是可用高度，这里给上限 + 自动压缩） */
  maxHeight: { type: Number, default: 300 },
  /** 弹出层最小宽度（Vben min-w-8rem） */
  minWidth: { type: Number, default: 128 },
})

const emit = defineEmits(['update:modelValue', 'change'])

const rootEl = ref(null)
const popEl = ref(null)
const open = ref(false)
const placement = ref('bottom')
const popStyle = ref({})
const highlight = ref(-1)

const items = computed(() =>
  (props.options || []).map((o) =>
    o && typeof o === 'object' ? o : { label: String(o), value: o }
  )
)
const selectedItem = computed(() => items.value.find((o) => o.value === props.modelValue) || null)
const hasValue = computed(
  () => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
)

function select(item) {
  if (item.disabled) return
  close()
  if (item.value === props.modelValue) return
  emit('update:modelValue', item.value)
  emit('change', item.value)
}

function clear(e) {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  emit('update:modelValue', '')
  emit('change', '')
  close()
}

/* ---------- 定位（Vben popper：下方优先，空间不足翻到上方） ---------- */
function position() {
  const el = rootEl.value
  if (!el || typeof window === 'undefined') return
  const r = el.getBoundingClientRect()
  const gap = 6 // Vben: data-[side=bottom]:translate-y-1(4px) + 余量
  const vh = window.innerHeight
  const vw = window.innerWidth
  const spaceBelow = vh - r.bottom - gap - 8
  const spaceAbove = r.top - gap - 8
  const want = Math.min(props.maxHeight, Math.max(spaceBelow, spaceAbove))
  placement.value = spaceBelow >= Math.min(want, 140) || spaceBelow >= spaceAbove ? 'bottom' : 'top'
  const maxH = Math.max(
    96,
    Math.min(props.maxHeight, placement.value === 'bottom' ? spaceBelow : spaceAbove)
  )
  const width = Math.max(r.width, props.minWidth)
  let left = r.left + window.scrollX
  // 右侧溢出时向左收，保证完整可见
  if (left + width > vw + window.scrollX - 8) left = Math.max(8, vw + window.scrollX - width - 8)
  popStyle.value = {
    left: `${left}px`,
    top:
      placement.value === 'bottom'
        ? `${r.bottom + window.scrollY + gap}px`
        : `${r.top + window.scrollY - gap}px`,
    minWidth: `${width}px`,
    maxWidth: 'min(560px, 92vw)',
    maxHeight: `${maxH}px`,
    transformOrigin: placement.value === 'bottom' ? 'top center' : 'bottom center',
  }
}

function scrollHighlightIntoView() {
  nextTick(() => {
    const list = popEl.value
    if (!list) return
    const el = list.querySelector('.select-item.is-highlighted')
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
  })
}

function moveHighlight(step) {
  const n = items.value.length
  if (!n) return
  let i = highlight.value
  if (i < 0) i = items.value.findIndex((o) => o.value === props.modelValue)
  for (let k = 0; k < n; k++) {
    i = (i + step + n) % n
    if (!items.value[i].disabled) break
  }
  highlight.value = i
  scrollHighlightIntoView()
}

function commitHighlight() {
  const item = items.value[highlight.value]
  if (item) select(item)
}

function onTriggerKey(e) {
  if (props.disabled) return
  const k = e.key
  if (!open.value) {
    if (k === 'ArrowDown' || k === 'Enter' || k === ' ' || k === 'Spacebar') {
      e.preventDefault()
      toggle()
    }
    return
  }
  if (k === 'ArrowDown') {
    e.preventDefault()
    moveHighlight(1)
  } else if (k === 'ArrowUp') {
    e.preventDefault()
    moveHighlight(-1)
  } else if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
    e.preventDefault()
    commitHighlight()
  } else if (k === 'Escape') {
    e.preventDefault()
    close()
  } else if (k === 'Home') {
    e.preventDefault()
    highlight.value = 0
    scrollHighlightIntoView()
  } else if (k === 'End') {
    e.preventDefault()
    highlight.value = items.value.length - 1
    scrollHighlightIntoView()
  } else if (k === 'Tab') {
    close()
  }
}

function onPointerDownOutside(e) {
  const t = e.target
  if (rootEl.value && rootEl.value.contains(t)) return
  if (popEl.value && popEl.value.contains(t)) return
  close()
}

let rafId = 0
function onViewportChange() {
  if (!open.value) return
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => position())
}

function toggle() {
  if (props.disabled) return
  open.value ? close() : openMenu()
}

async function openMenu() {
  if (props.disabled || open.value) return
  open.value = true
  highlight.value = items.value.findIndex((o) => o.value === props.modelValue)
  await nextTick()
  position()
  scrollHighlightIntoView()
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', onPointerDownOutside, true)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
  }
}

function close() {
  if (!open.value) return
  open.value = false
  if (typeof document !== 'undefined') document.removeEventListener('pointerdown', onPointerDownOutside, true)
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

// 禁用 / 选项变化时收起，避免残留浮层
watch(() => props.disabled, (v) => v && close())
watch(items, () => {
  if (open.value) nextTick(position)
})

onBeforeUnmount(close)
</script>

<template>
  <div ref="rootEl" class="vben-select" :class="[`is-${size}`, { 'is-disabled': disabled }]">
    <button
      :id="id"
      ref="triggerEl"
      type="button"
      class="select-trigger"
      :class="{ 'is-open': open }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="ariaLabel || undefined"
      :disabled="disabled"
      :data-placeholder="hasValue ? undefined : ''"
      @click="toggle"
      @keydown="onTriggerKey"
    >
      <span class="select-value" :class="{ 'is-placeholder': !hasValue }">
        {{ hasValue ? selectedItem?.label ?? String(modelValue) : placeholder }}
      </span>
      <AppIcon
        v-if="allowClear && hasValue && !disabled"
        name="circle-x"
        :size="16"
        class="select-clear"
        data-clear-button
        @pointerdown.stop
        @click.stop.prevent="clear"
      />
      <AppIcon name="chevron-down" :size="16" class="select-arrow" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="popEl"
        class="select-content"
        :class="`side-${placement}`"
        :style="popStyle"
        role="listbox"
      >
        <div class="select-viewport">
          <div
            v-for="(item, i) in items"
            :key="String(item.value)"
            class="select-item"
            :class="{
              'is-selected': item.value === modelValue,
              'is-highlighted': i === highlight,
              'is-disabled': item.disabled,
            }"
            role="option"
            :aria-selected="item.value === modelValue"
            :aria-disabled="!!item.disabled"
            @click="select(item)"
            @mousemove="highlight = i"
          >
            <span class="select-item-text">{{ item.label }}</span>
            <span v-if="item.value === modelValue" class="select-indicator">
              <AppIcon name="check" :size="14" />
            </span>
          </div>
          <div v-if="!items.length" class="select-empty">暂无选项</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ───── 触发器（Vben SelectTrigger：h-9 / rounded-md / border / px-3 / text-sm） ───── */
.vben-select {
  position: relative;
  width: 100%;
}
.select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--card);
  color: var(--foreground);
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}
.select-trigger:hover:not(:disabled) {
  border-color: var(--primary);
}
/* Vben：focus-visible:border-ring + ring-3 ring-ring/50，且 --ring 指向主色 */
.select-trigger:focus-visible,
.select-trigger.is-open {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.select-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.select-value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Vben：button[role=combobox][data-placeholder] 用 muted-foreground */
.select-value.is-placeholder {
  color: var(--muted-foreground);
}
.select-arrow {
  flex: none;
  color: var(--muted-foreground);
  opacity: 0.5;
  transition: transform 0.2s ease;
}
.select-trigger.is-open .select-arrow {
  transform: rotate(180deg);
}
.select-clear {
  flex: none;
  color: var(--muted-foreground);
  opacity: 0.5;
  transition: opacity 0.15s ease, color 0.15s ease;
}
.select-clear:hover {
  opacity: 1;
  color: var(--foreground);
}

/* 尺寸：default/sm 对齐 Vben；form 对齐本项目 .input */
.is-default .select-trigger {
  height: 36px;
}
.is-sm .select-trigger {
  height: 32px;
  font-size: 13.5px;
}
.is-form .select-trigger {
  height: 38px;
  border-radius: 10px;
}

/* ───── 弹出层（Vben SelectContent：z-popup / bg-popover / rounded-md / border / shadow-md） ───── */
.select-content {
  position: absolute;
  z-index: var(--popup-z-index, 2000);
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 6px 24px -6px rgb(0 0 0 / 18%), 0 2px 6px -2px rgb(0 0 0 / 12%);
  overflow: hidden;
  /* Vben data-[state=open]：fade-in-0 zoom-in-95 + slide-in-from-top-2(8px) */
  animation: select-in 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}
.side-top.select-content {
  animation-name: select-in-up;
}
.select-viewport {
  max-height: inherit;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

/* ───── 选项（Vben SelectItem：py-1.5 pl-2 pr-8 rounded-sm + focus:bg-accent + 右侧 Check） ───── */
.select-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 32px 6px 8px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.select-item-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
.select-item.is-highlighted {
  background: var(--accent);
  color: var(--accent-foreground);
}
.select-item.is-disabled {
  pointer-events: none;
  opacity: 0.5;
}
/* Vben：选中指示器绝对定位在 right-2 的 size-3.5 容器里 */
.select-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--primary);
}
.select-empty {
  padding: 10px 8px;
  font-size: 13.5px;
  color: var(--muted-foreground);
  text-align: center;
}

/* 注意：scoped 会把 keyframes 重命名，必须在本组件内定义，不能跨组件引用 */
@keyframes select-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes select-in-up {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
