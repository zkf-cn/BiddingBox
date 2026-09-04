/**
 * 计费计算引擎 —— 纯函数，无副作用，不依赖任何框架。
 *
 * 支持四种计费模式：
 *   1. progressive 差额定率分档累进（如招标代理、造价咨询、建设管理费、代建费）
 *   2. interpolate 基价表直线内插 × 调整系数（如工程设计、施工监理）
 *   3. bandRange 分档收费区间（如前期工作咨询、环境影响咨询）
 *   4. fixedCase 固定金额按宗（如工程交易服务费）
 */

const INF = Number.POSITIVE_INFINITY
/** 把 null / undefined 的档位上限视为无穷大 */
const upperOf = (band) => (band.upper === null || band.upper === undefined ? INF : band.upper)

/**
 * 差额定率分档累进
 * @param {number} amount 计费额
 * @param {{label:string, upper:number|null}[]} bands 分档表（按上限升序）
 * @param {number[]} rates 与 bands 一一对应的费率
 * @param {'percent'|'permille'} rateUnit 费率单位，percent=%，permille=‰
 * @returns {{total:number, breakdown:{label:string, rate:number, segAmount:number, segFee:number}[]}}
 */
export function calcProgressive(amount, bands, rates, rateUnit = 'percent') {
  const divisor = rateUnit === 'permille' ? 1000 : 100
  let lower = 0
  const breakdown = []
  let total = 0

  for (let i = 0; i < bands.length; i++) {
    const upper = upperOf(bands[i])
    const rate = rates[i]
    if (amount > lower && rate !== null && rate !== undefined) {
      const segAmount = Math.min(amount, upper) - lower
      const segFee = (segAmount * rate) / divisor
      breakdown.push({ label: bands[i].label, rate, segAmount, segFee })
      total += segFee
    }
    lower = upper
    if (amount <= lower) break
  }
  return { total, breakdown }
}

/**
 * 基价表直线内插法
 * @param {number} amount 计费额
 * @param {[number, number][]} points [计费额, 基价] 升序数组
 * @returns {number} 内插得到的基价
 */
export function calcInterpolate(amount, points) {
  if (!points || points.length === 0) return 0
  if (amount <= points[0][0]) return points[0][1]
  const last = points[points.length - 1]
  if (amount >= last[0]) return last[1]
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    // 计费额恰好落在基价表节点上时直接取该节点基价，
    // 否则会漏过区间判断、错误地返回末档基价（基价表常见的整数计费额即会踩中）
    if (amount === x1) return y1
    if (amount === x2) return y2
    if (amount > x1 && amount < x2) {
      return y1 + ((y2 - y1) * (amount - x1)) / (x2 - x1)
    }
  }
  return last[1]
}

/**
 * 分档区间命中
 * @param {number} amount 计费额
 * @param {{label:string, lower:number, upper:number|null}[]} bands
 * @returns {object|null} 命中的档位
 */
export function findBandRange(amount, bands) {
  if (!bands || bands.length === 0) return null
  for (const band of bands) {
    const upper = upperOf(band)
    // 下边界取闭区间：计费额正好等于档位下限时属于该档，
    // 否则（如前期咨询 3000 万元）会一路穿透到末档，得出完全错误的结果
    if (amount >= band.lower && amount <= upper) return band
  }
  return bands[bands.length - 1]
}

/** 固定金额（元/宗）档位命中，逻辑与分档区间一致 */
export function findFixedBand(amount, bands) {
  return findBandRange(amount, bands)
}

/** 保留 n 位小数并去除无意义的尾随 0 */
export function round(value, digits = 2) {
  if (!Number.isFinite(value)) return 0
  return Number(value.toFixed(digits))
}

/** 把万元换算为元 */
export const wanToYuan = (wan) => round(wan * 10000, 2)

/**
 * 应用调整系数（下浮/上浮）。
 * @param {number} base 基准金额
 * @param {number} percent 下浮百分比（0–100），正数表示下浮
 */
export const applyDiscount = (base, percent) => round(base * (1 - (percent || 0) / 100), 2)
