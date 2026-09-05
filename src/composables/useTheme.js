/** 主题状态：浅色 / 深色（data-theme）+ Vben 式预设主色（data-accent），均持久化到 localStorage
 *  纯手动切换：无有效保存值时默认浅色，不跟随系统偏好 */
import { ref } from 'vue'
import { STORAGE_KEYS } from '@/config'
import { getItem, setItem } from '@/utils/storage'

/* 标签与排列顺序对齐 Vben Admin 5 BUILT_IN_THEME_PRESETS（constants.ts） */
export const ACCENTS = [
  { type: 'default',   label: '默认',     color: 'hsl(212 100% 45%)' },
  { type: 'violet',    label: '紫罗兰',   color: 'hsl(245 82% 67%)' },
  { type: 'pink',      label: '樱花粉',   color: 'hsl(347 77% 60%)' },
  { type: 'yellow',    label: '柠檬黄',   color: 'hsl(42 84% 61%)' },
  { type: 'sky-blue',  label: '天蓝色',   color: 'hsl(231 98% 65%)' },
  { type: 'green',     label: '浅绿色',   color: 'hsl(161 90% 43%)' },
  { type: 'zinc',      label: '锌色灰',   color: 'hsl(240 5% 26%)' },
  { type: 'deep-green',label: '深绿色',   color: 'hsl(181 84% 32%)' },
  { type: 'deep-blue', label: '深蓝色',   color: 'hsl(211 91% 39%)' },
  { type: 'orange',    label: '橙黄色',   color: 'hsl(18 89% 40%)' },
  { type: 'rose',      label: '玫瑰红',   color: 'hsl(0 75% 42%)' },
  { type: 'neutral',   label: '中性色',   color: 'hsl(0 0% 25%)' },
  { type: 'slate',     label: '石板灰',   color: 'hsl(215 25% 27%)' },
  { type: 'gray',      label: '中灰色',   color: 'hsl(217 19% 27%)' },
]

const VALID_ACCENTS = new Set(ACCENTS.map((a) => a.type))

const current = ref(readInitial())
const accent = ref(readAccentInitial())

function readInitial() {
  if (typeof document === 'undefined') return 'light'
  const saved = getItem(STORAGE_KEYS.theme, null)
  if (saved === 'light' || saved === 'dark') return saved
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' ? 'dark' : 'light'
}

function readAccentInitial() {
  if (typeof document === 'undefined') return 'default'
  const saved = getItem(STORAGE_KEYS.accent, null)
  if (saved && VALID_ACCENTS.has(saved)) return saved
  const attr = document.documentElement.getAttribute('data-accent')
  return VALID_ACCENTS.has(attr) ? attr : 'default'
}

function applyTheme(value) {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', value)
    // 同步 html 内联底色，保证切换/过渡时画布底色与目标主题一致（避免浅色内联底色透出）
    document.documentElement.style.backgroundColor = value === 'dark' ? '#16141a' : '#f2f0f5'
  }
  setItem(STORAGE_KEYS.theme, value)
}

function applyAccent(value) {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-accent', value)
  }
  setItem(STORAGE_KEYS.accent, value)
}

// 初始即应用（保证首屏即正确着色，与 index.html 预置脚本值一致）
applyAccent(accent.value)
applyTheme(current.value)

// 单例：整个应用共享同一个 theme / accent ref
export function useTheme() {
  function setTheme(value) {
    current.value = value === 'dark' ? 'dark' : 'light'
    applyTheme(current.value)
  }
  function toggleTheme() {
    setTheme(current.value === 'dark' ? 'light' : 'dark')
  }
  function setAccent(value) {
    if (!VALID_ACCENTS.has(value)) value = 'default'
    accent.value = value
    applyAccent(value)
  }
  return { theme: current, accent, setTheme, toggleTheme, setAccent, ACCENTS }
}
