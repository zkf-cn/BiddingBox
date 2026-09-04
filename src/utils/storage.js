/**
 * localStorage 封装
 * 统一读写入口，任何异常（隐私模式、配额超限、禁用存储）都降级为内存态，不阻断页面。
 */
import { STORAGE_KEYS, STATS_LIMIT } from '@/config'

/** 内存兜底：localStorage 不可用时保证功能不崩 */
const memory = new Map()

function available() {
  try {
    const k = '__probe__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch (e) {
    return false
  }
}

const hasLS = typeof window !== 'undefined' && available()

export function getItem(key, fallback = null) {
  try {
    if (!hasLS) return memory.has(key) ? memory.get(key) : fallback
    const raw = window.localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function setItem(key, value) {
  try {
    const raw = JSON.stringify(value)
    if (hasLS) window.localStorage.setItem(key, raw)
    else memory.set(key, value)
    return true
  } catch (e) {
    memory.set(key, value)
    return false
  }
}

export function removeItem(key) {
  try {
    if (hasLS) window.localStorage.removeItem(key)
  } catch (e) {
    /* 忽略 */
  }
  memory.delete(key)
}

/** 一键清空：清除 config.js 中登记的全部存储键 */
export function clearAll() {
  Object.values(STORAGE_KEYS).forEach(removeItem)
  memory.clear()
}

/** 估算已占用体积（字节，UTF-16 计） */
export function usedBytes() {
  let total = 0
  Object.values(STORAGE_KEYS).forEach((k) => {
    try {
      const raw = hasLS ? window.localStorage.getItem(k) : null
      if (raw) total += raw.length * 2
    } catch (e) {
      /* 忽略 */
    }
  })
  return total
}

/* ---------------- 统计列表 ---------------- */

export function getStatsList() {
  const list = getItem(STORAGE_KEYS.statsList, [])
  return Array.isArray(list) ? list : []
}

/**
 * 追加一条统计列表项（用户手动点击「加入统计列表」时调用；
 * 超出 STATS_LIMIT 条丢弃最旧的记录）
 * @param {object} record {calcId, calcName, docNo, unit, inputs, base, adjusted, isRange, discount}
 */
export function pushStats(record) {
  const list = getStatsList()
  list.unshift({ ...record, at: record.at || new Date().toISOString() })
  const trimmed = list.slice(0, STATS_LIMIT)
  setItem(STORAGE_KEYS.statsList, trimmed)
  return trimmed
}

export function clearStats() {
  removeItem(STORAGE_KEYS.statsList)
}

/* ---------------- 收藏 ---------------- */

/**
 * 切换收藏状态
 * @param {'quota'|'expert'} type 收藏类型
 * @param {object} item 至少含 id 字段
 * @returns {boolean} 切换后是否为已收藏
 */
export function toggleCollect(type, item) {
  const key = type === 'quota' ? STORAGE_KEYS.collectQuota : STORAGE_KEYS.collectExpert
  const list = getItem(key, [])
  const arr = Array.isArray(list) ? list : []
  const idx = arr.findIndex((x) => x && x.id === item.id)
  if (idx >= 0) {
    arr.splice(idx, 1)
    setItem(key, arr)
    return false
  }
  arr.unshift({ ...item, collectedAt: new Date().toISOString() })
  setItem(key, arr)
  return true
}

export function getCollects(type) {
  const key = type === 'quota' ? STORAGE_KEYS.collectQuota : STORAGE_KEYS.collectExpert
  const list = getItem(key, [])
  return Array.isArray(list) ? list : []
}

export function isCollected(type, id) {
  return getCollects(type).some((x) => x && x.id === id)
}

export function removeCollect(type, id) {
  const key = type === 'quota' ? STORAGE_KEYS.collectQuota : STORAGE_KEYS.collectExpert
  const arr = getCollects(type).filter((x) => x && x.id !== id)
  setItem(key, arr)
}
