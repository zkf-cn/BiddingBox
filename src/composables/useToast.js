/** 全局轻提示（中文提示语） */
import { ref } from 'vue'

const items = ref([])
let seq = 0

export function useToast() {
  /**
   * @param {string} message 提示内容
   * @param {'info'|'success'|'error'|'warn'} type
   * @param {number} duration 毫秒
   */
  function toast(message, type = 'info', duration = 2600) {
    const id = ++seq
    items.value.push({ id, message, type })
    window.setTimeout(() => {
      items.value = items.value.filter((t) => t.id !== id)
    }, duration)
    return id
  }
  return {
    toasts: items,
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d),
    warn: (m, d) => toast(m, 'warn', d),
  }
}
