/**
 * 计算引擎穷举扫描
 *
 * 与 verify-calc.mjs（政策算例回归）互补：
 * 本脚本不比对具体数值，而是穷举「9 套计算器 × 所有下拉选项组合 × 各档位边界金额」，
 * 目标是暴露抽样测试覆盖不到的运行时异常与脏数据 —— 例如某个下拉项没有对应费率、
 * 某个档位边界漏判、某项数据取到 undefined 导致结果 NaN。
 *
 * 用法： node scripts/sweep-calc.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toUrl = (absPath) => pathToFileURL(absPath).href
const SRC = path.resolve(__dirname, '../src')

/** 加载使用了 @/ 别名的 ESM 源文件（改写别名为绝对路径后以临时模块运行） */
async function loadSrcModule(relPath, tmpName) {
  const srcFile = path.join(SRC, relPath)
  let code = fs.readFileSync(srcFile, 'utf8')
  const jsonAlias = path.resolve(SRC, 'data')
  const absSrc = path.resolve(SRC)

  code = code.replace(/from '@\/data\/([\w.-]+\.json)'/g, (_m, file) => {
    return `from ${JSON.stringify(toUrl(path.join(jsonAlias, file)))} with { type: 'json' }`
  })
  code = code.replace(/from '@\/utils\/([\w.-]+)'/g, (_m, file) => {
    return `from ${JSON.stringify(toUrl(path.join(absSrc, 'utils', `${file}.js`)))}`
  })
  code = code.replace(/from '@\/config'/g, () => {
    return `from ${JSON.stringify(toUrl(path.join(absSrc, 'config.js')))}`
  })

  const tmp = path.resolve(__dirname, `../.tmp-sweep-${tmpName}.mjs`)
  fs.writeFileSync(tmp, code, 'utf8')
  try {
    return await import('file:///' + tmp.replace(/\\/g, '/'))
  } finally {
    fs.rmSync(tmp, { force: true })
  }
}

const { CALC_DEFS } = await loadSrcModule('views/calc/defs.js', 'defs')
const S = (await import(toUrl(path.join(SRC, 'data/standards.json')), { with: { type: 'json' } })).default

/* ---------------- 0. 数据键完整性检查 ---------------- */
console.log('数据完整性检查\n' + '='.repeat(72))

const defsRaw = fs.readFileSync(path.join(SRC, 'views/calc/defs.js'), 'utf8')
const referencedKeys = [...new Set([...defsRaw.matchAll(/\bS\.([A-Z_0-9]+)/g)].map((m) => m[1]))]
let missingKeys = 0
for (const k of referencedKeys) {
  if (S[k] === undefined) {
    console.log(`× defs.js 引用了 standards.json 中不存在的数据键：S.${k}`)
    missingKeys++
  }
}
if (missingKeys === 0) {
  console.log(`✓ defs.js 引用的 ${referencedKeys.length} 个数据键全部存在`)
}

/* ---------------- 1. 元数据检查 ---------------- */
let metaIssues = 0
for (const def of CALC_DEFS) {
  const problems = []
  if (!def.id) problems.push('缺少 id')
  if (!def.name) problems.push('缺少 name')
  if (!def.docNo) problems.push('缺少 docNo（导出 Excel 需附带政策文号）')
  if (!def.stdName) problems.push('缺少 stdName（导出 Excel 需附标准全称）')
  if (!def.amount || !def.amount.label) problems.push('缺少计费基数定义')
  if (!def.resultUnit) problems.push('缺少 resultUnit')
  if (typeof def.compute !== 'function') problems.push('缺少 compute 函数')

  for (const sel of def.selects || []) {
    if (!sel.key) problems.push(`下拉项缺少 key`)
    const hasOptions = Array.isArray(sel.options) || typeof sel.optionsFor === 'function'
    if (!hasOptions) problems.push(`下拉项 ${sel.key} 既无 options 也无 optionsFor`)
  }

  if (problems.length) {
    console.log(`× [${def.id}] ${problems.join('；')}`)
    metaIssues++
  }
}
if (metaIssues === 0) {
  console.log(`✓ ${CALC_DEFS.length} 套计算器元数据完整（含导出所需的文号与标准全称）`)
}

/* ---------------- 2. 穷举组合计算 ---------------- */
console.log('\n穷举组合计算\n' + '='.repeat(72))

/** 收集某个计算器所有下拉项的取值可能（按 optionsFor 级联逐项求解） */
function collectSelectCombos(def) {
  const selects = def.selects || []
  if (selects.length === 0) return [{}]

  let combos = [{}]
  for (const sel of selects) {
    const next = []
    for (const combo of combos) {
      const opts =
        typeof sel.optionsFor === 'function'
          ? sel.optionsFor(combo) || []
          : sel.options || []
      if (opts.length === 0) {
        next.push({ ...combo, [sel.key]: undefined })
        continue
      }
      for (const o of opts) {
        next.push({ ...combo, [sel.key]: o.value })
      }
    }
    combos = next
  }
  return combos
}

/** 针对某套计算器生成待测试的金额序列：档位边界 + 典型值 + 极值 */
function collectAmounts(def) {
  const set = new Set([0.01, 1, 100, 500, 1000, 3000, 5000, 8000, 10000, 50000, 100000])

  // 从该计算器用到的数据里抽出所有档位/基价表边界，逐个取边界值与边界±极小量
  const pools = []
  const push = (arr, key) => {
    if (Array.isArray(arr)) for (const b of arr) {
      const v = b && b[key]
      if (typeof v === 'number' && isFinite(v)) pools.push(v)
    }
  }
  push(S.AGENT_FEE_BANDS, 'lower')
  push(S.AGENT_FEE_BANDS, 'upper')
  ;(S.COST_STANDARDS || []).forEach((st) => push(st.bands, 'lower'))
  push(S.PRE_1283_BANDS, 'lower')
  push(S.PRE_1283_BANDS, 'upper')
  push(S.EIA_125_BANDS, 'lower')
  push(S.EIA_125_BANDS, 'upper')
  push(S.BUILDMGMT_504_BANDS, 'lower')
  push(S.BUILDMGMT_504_BANDS, 'upper')
  push(S.DAIBUILD_613_BANDS, 'lower')
  push(S.DAIBUILD_613_BANDS, 'upper')
  ;(S.DESIGN_10_POINTS || []).forEach((p) => { if (isFinite(p[0])) pools.push(p[0]) })
  ;(S.SUPERVISION_670_POINTS || []).forEach((p) => { if (isFinite(p[0])) pools.push(p[0]) })
  ;(S.TX_150_CATEGORIES || []).forEach((c) => (c.tiers || []).forEach((t) => {
    if (isFinite(t.lower)) pools.push(t.lower)
    if (isFinite(t.upper)) pools.push(t.upper)
  }))

  for (const v of pools) {
    if (v <= 0) continue
    // eia 计量单位为亿元，边界值来自同一池但量级不同，统一按计算器上限裁剪
    set.add(v)
    set.add(Math.max(0.01, v - 1e-6))
    set.add(v + 1e-6)
  }

  const max = (def.amount && def.amount.max) || 1e8
  return [...set].filter((v) => v > 0 && v <= max).sort((a, b) => a - b)
}

const isBadNumber = (v) => typeof v !== 'number' || !isFinite(v) || Number.isNaN(v)

let totalRuns = 0
const errors = []

for (const def of CALC_DEFS) {
  const combos = collectSelectCombos(def)
  const amounts = collectAmounts(def)
  let defRuns = 0
  const defErrors = []

  for (const selects of combos) {
    for (const amount of amounts) {
      for (const discount of [0, 0.5, 1]) {
        totalRuns++
        defRuns++
        let out
        try {
          out = def.compute({ amount, selects: { ...selects }, discount })
        } catch (e) {
          defErrors.push(`抛出异常 amount=${amount} selects=${JSON.stringify(selects)} → ${e.message}`)
          continue
        }
        if (!out || typeof out !== 'object') {
          defErrors.push(`返回非对象 amount=${amount} selects=${JSON.stringify(selects)}`)
          continue
        }

        // 固定单价模式（base 允许为 null），仅校验明细/费率表无脏值
        if (out.isFixed) {
          // 跳过数值校验
        } else if (Array.isArray(out.base)) {
          const [lo, hi] = out.base
          if (isBadNumber(lo)) {
            defErrors.push(`区间下限非法 amount=${amount} selects=${JSON.stringify(selects)} → ${lo}`)
          } else if (lo < 0) {
            defErrors.push(`区间下限为负 amount=${amount} selects=${JSON.stringify(selects)} → ${lo}`)
          }
          if (hi !== null && isBadNumber(hi)) {
            defErrors.push(`区间上限非法 amount=${amount} selects=${JSON.stringify(selects)} → ${hi}`)
          } else if (hi !== null && hi < lo) {
            defErrors.push(`区间上下限倒置 amount=${amount} → [${lo}, ${hi}]`)
          }
        } else if (isBadNumber(out.base)) {
          defErrors.push(`结果非法 amount=${amount} selects=${JSON.stringify(selects)} → ${out.base}`)
        } else if (out.base < 0) {
          defErrors.push(`结果为负 amount=${amount} selects=${JSON.stringify(selects)} → ${out.base}`)
        }

        // breakdown 里不允许出现 undefined / NaN 字样（会被渲染给用户看到）
        for (const b of out.breakdown || []) {
          if (b && typeof b.value === 'string' && /undefined|NaN|null/.test(b.value)) {
            defErrors.push(`计算过程含脏值 amount=${amount} → ${b.label}: ${b.value}`)
          }
        }
        // 费率表同样不允许脏值
        for (const r of out.rateTable || []) {
          if (r && /undefined|NaN/.test(String(r.rate))) {
            defErrors.push(`费率表含脏值 → ${r.label}: ${r.rate}`)
          }
        }
      }
    }
  }

  // 同一问题可能重复上百次，去重后只报前 3 条
  const uniq = [...new Set(defErrors.map((e) => e.replace(/amount=[\d.e-]+/, 'amount=*')))]
  if (uniq.length) {
    errors.push({ id: def.id, name: def.name, samples: defErrors.slice(0, 3), uniqCount: uniq.length })
    console.log(`× [${def.id}] ${def.name} — 发现 ${defErrors.length} 处异常（去重后 ${uniq.length} 类）`)
    defErrors.slice(0, 3).forEach((e) => console.log(`    ${e}`))
  } else {
    console.log(`✓ [${def.id}] ${def.name} — ${defRuns} 组组合全部通过`)
  }
}

/* ---------------- 3. 汇总 ---------------- */
console.log('\n' + '='.repeat(72))
console.log(`穷举计算总次数：${totalRuns}`)
console.log(`异常计算器：${errors.length} / ${CALC_DEFS.length}`)
if (missingKeys > 0) console.log(`缺失数据键：${missingKeys}`)
if (metaIssues > 0) console.log(`元数据问题：${metaIssues}`)

const ok = errors.length === 0 && missingKeys === 0 && metaIssues === 0
console.log(ok ? '\n全部通过' : '\n存在问题，请修复后重跑')
process.exit(ok ? 0 : 1)
