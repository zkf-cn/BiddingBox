<script setup>
/** 轻量确认对话框（用于清空本地缓存等不可逆操作） */
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="open" class="dialog-mask no-print" @click.self="emit('cancel')">
    <div class="dialog" role="dialog" aria-modal="true" :aria-label="title">
      <div class="dialog-title">{{ title }}</div>
      <div class="dialog-body">{{ message }}</div>
      <div class="dialog-foot">
        <button class="btn" @click="emit('cancel')">{{ cancelText }}</button>
        <button :class="danger ? 'btn btn-danger' : 'btn btn-primary'" @click="emit('confirm')">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 300;
  padding: 20px;
}
.dialog {
  width: 100%;
  max-width: 420px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: dialog-in 0.16s ease;
}
@keyframes dialog-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.dialog-title {
  padding: 16px 18px 0;
  font-size: 15px;
  font-weight: 650;
}
.dialog-body {
  padding: 10px 18px 18px;
  font-size: 13.5px;
  color: var(--muted-foreground);
  line-height: 1.65;
}
.dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  background: var(--muted);
}
</style>
