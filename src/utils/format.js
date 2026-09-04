/** 数字与金额格式化工具 */

/** 千分位 + 固定小数位 */
export function fmtNumber(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** 金额：万元显示，并附带元换算 */
export function fmtWan(value, digits = 2) {
  if (!Number.isFinite(Number(value))) return '—'
  return fmtNumber(value, digits)
}

/** 万元 → 元 的中文表述，用于结果卡片副标题 */
export function wanToYuanText(value) {
  if (!Number.isFinite(Number(value))) return '—'
  const yuan = Number(value) * 10000
  return `${fmtNumber(yuan, 2)} 元`
}

/** 把可能含 null 的区间格式化为「5 ~ 8」或「7 以上」 */
export function fmtRange(min, max, unit = '') {
  const lo = min === null || min === undefined ? null : Number(min)
  const hi = max === null || max === undefined ? null : Number(max)
  if (lo === null && hi === null) return '—'
  if (hi === null) return `${fmtNumber(lo, 2)}${unit} 以上`
  if (lo === null) return `${fmtNumber(hi, 2)}${unit} 以下`
  return `${fmtNumber(lo, 2)} ~ ${fmtNumber(hi, 2)}${unit}`
}

/** 日期时间：2026-09-01 23:20 */
export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 字节数友好显示 */
export function fmtBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
