/**
 * 数据入口
 * 小数据（计费标准）同步引入；大数据集（工期定额 / 专家分类）按需异步加载，
 * 构建时会被拆成独立 chunk，不进入首屏包体。
 */
import standards from './standards.json'

/** 9 套计费计算器的费率表数据 */
export const STANDARDS = standards

/** 工期定额：{ tree, pages, notes } —— 异步加载，约 217 KB */
export function loadQuota() {
  return import('./quota.json').then((m) => m.default || m)
}

/** 评标专家专业分类：4 级数组 —— 异步加载，约 101 KB */
export function loadExpert() {
  return import('./expert.json').then((m) => m.default || m)
}
