/**
 * 表单校验工具
 * 规则：禁止负数、禁止非法 0 值、业务超上限校验；校验失败时由调用方清空计算结果区域。
 */

/**
 * 校验数值输入
 * @param {string|number} raw 原始输入
 * @param {object} opt 校验选项
 * @param {string} opt.label 字段中文名（用于错误提示）
 * @param {boolean} opt.allowZero 是否允许 0（默认 false，计费基数不允许为 0）
 * @param {number} opt.max 业务上限（含），超出即报错
 * @param {string} [opt.maxLabel] 上限的中文表述，用于错误提示（如「1亿万元」）
 * @param {number} [opt.min] 业务下限（含），默认 0（禁止负数）
 * @param {boolean} [opt.required] 是否必填，默认 true
 * @returns {{valid:boolean, value:number, message:string}}
 */
export function validateNumber(raw, opt = {}) {
  const { label = '该字段', allowZero = false, max, maxLabel, min = 0, required = true } = opt
  const text = raw === null || raw === undefined ? '' : String(raw).trim()

  if (text === '') {
    return required
      ? { valid: false, value: NaN, message: `请输入${label}` }
      : { valid: true, value: NaN, message: '' }
  }

  // 非数字（含中文、字母、多个小数点等）
  if (!/^-?\d*\.?\d+$/.test(text)) {
    return { valid: false, value: NaN, message: `${label}只能填写数字，请检查输入` }
  }

  const value = Number(text)
  if (!Number.isFinite(value)) {
    return { valid: false, value: NaN, message: `${label}不是有效数字` }
  }
  if (value < 0) {
    return { valid: false, value, message: `${label}不能为负数` }
  }
  if (min !== undefined && value < min) {
    return { valid: false, value, message: `${label}不能小于 ${min}` }
  }
  if (value === 0 && !allowZero) {
    return { valid: false, value, message: `${label}不能为 0` }
  }
  if (max !== undefined && value > max) {
    return { valid: false, value, message: `${label}超出上限（最大 ${maxLabel || formatLimit(max)}），请核对后重新输入` }
  }
  return { valid: true, value, message: '' }
}

/**
 * 校验下浮/上浮比例
 * @param {string|number} raw
 * @param {object} opt
 * @param {number} [opt.max] 最大下浮比例，默认 100
 * @param {number} [opt.min] 最小比例，默认 0（不支持负数上浮时）
 */
export function validatePercent(raw, opt = {}) {
  const { label = '调整比例', max = 100, min = 0, allowZero = true } = opt
  const text = raw === null || raw === undefined ? '' : String(raw).trim()
  if (text === '') return { valid: true, value: 0, message: '' }

  if (!/^-?\d*\.?\d+$/.test(text)) {
    return { valid: false, value: NaN, message: `${label}只能填写数字` }
  }
  const value = Number(text)
  if (value < min) return { valid: false, value, message: `${label}不能小于 ${min}%` }
  if (value > max) return { valid: false, value, message: `${label}不能大于 ${max}%` }
  if (value === 0 && !allowZero) return { valid: false, value, message: `${label}不能为 0` }
  return { valid: true, value, message: '' }
}

/** 上限数字格式化：100000000 → 1亿 */
function formatLimit(n) {
  if (n >= 100000000) return `${n / 100000000}亿`
  if (n >= 10000) return `${n / 10000}万`
  return String(n)
}
