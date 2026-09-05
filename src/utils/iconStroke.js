/**
 * 全站 SVG 描边图标的统一线宽计算（单一真源）
 *
 * 背景：图标是 24×24 viewBox 的矢量路径，stroke-width 是"用户坐标"单位，
 * 渲染后的物理线宽 = strokeWidth × (渲染尺寸 / 24)。
 * 若 stroke-width 固定写死，12px 的小图标会被缩到 0.9px（发虚），
 * 30px 的大图标会被放大到 2.25px（笨重）——视觉上线宽并不统一。
 *
 * 方案：反算 stroke-width，使各尺寸渲染出接近一致的物理线宽。
 * 完全恒定（指数 0）会让大图标过细、失去分量，故用 0.35 的温和补偿指数
 * （0 = 完全恒定，1 = 完全等比缩放）。
 *
 * 调参入口：改 BASE_PX 即整体粗细；改 COMP 即在"完全统一 ↔ 完全等比"间移动。
 */

/** 基准物理线宽（CSS px）：以全屏图标原样式为准 —— 18px 下用户坐标 2.0 → 物理 1.5px（同 lucide 默认视觉） */
export const BASE_PX = 1.5

/** 补偿指数：0 = 所有尺寸物理线宽完全一致；1 = 传统等比缩放 */
export const COMP = 0.35

/** 基准尺寸（px） */
export const BASE_SIZE = 18

/**
 * 计算指定渲染尺寸下的 stroke-width（用户坐标值）
 * @param {number|string} size 图标渲染尺寸（px）
 * @returns {number} 该尺寸下应使用的 stroke-width
 */
export function iconStroke(size = BASE_SIZE) {
  const s = Number(size) || BASE_SIZE
  const physical = BASE_PX * Math.pow(s / BASE_SIZE, COMP) // 目标物理线宽
  return +(physical * (24 / s)).toFixed(3) // 换算回 24 viewBox 的用户坐标
}

/** 常用尺寸下的物理线宽（便于核对：数值越接近说明视觉越统一） */
export function physicalStroke(size = BASE_SIZE) {
  const s = Number(size) || BASE_SIZE
  return +(BASE_PX * Math.pow(s / BASE_SIZE, COMP)).toFixed(3)
}
