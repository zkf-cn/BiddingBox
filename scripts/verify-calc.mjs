/**
 * 计算引擎回归验证脚本
 * 用政策原文的已知算例核对 9 套计算器的计算结果，防止改数据/改逻辑引入偏差。
 *
 * 用法： node scripts/verify-calc.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** 生成 node ESM 可直接使用的 file:// URL（自动处理中文路径编码与扩展名） */
const toUrl = (absPath) => pathToFileURL(absPath).href
const SRC = path.resolve(__dirname, '../src')

/**
 * 加载使用了 @/ 别名的 ESM 源文件：改写别名为绝对路径后以临时模块运行。
 */
async function loadSrcModule(relPath, tmpName) {
  const srcFile = path.join(SRC, relPath)
  let code = fs.readFileSync(srcFile, 'utf8')

  // @/data/xxx.json → 绝对路径 + import attributes
  const jsonAlias = path.resolve(SRC, 'data')
  const absSrc = path.resolve(SRC)
  code = code.replace(/from '@\/data\/([\w.-]+\.json)'/g, (_m, file) => {
    return `from ${JSON.stringify(toUrl(path.join(jsonAlias, file)))} with { type: 'json' }`
  })
  // @/data → 入口 index.js（含动态 import，测试环境不需要，替换为空实现）
  code = code.replace(/from '@\/data'/g, () => `from ${JSON.stringify('data:text/javascript,export const STANDARDS={};export function loadQuota(){return Promise.resolve({})};export function loadExpert(){return Promise.resolve([])}')}`)
  // @/utils/xxx → 绝对路径（补 .js 扩展名）
  code = code.replace(/from '@\/utils\/([\w.-]+)'/g, (_m, file) => {
    const p = path.join(absSrc, 'utils', `${file}.js`)
    return `from ${JSON.stringify(toUrl(p))}`
  })
  // @/config → 绝对路径
  code = code.replace(/from '@\/config'/g, () => {
    return `from ${JSON.stringify(toUrl(path.join(absSrc, 'config.js')))}`
  })

  const tmp = path.resolve(__dirname, `../.tmp-verify-${tmpName}.mjs`)
  fs.writeFileSync(tmp, code, 'utf8')
  try {
    return await import('file:///' + tmp.replace(/\\/g, '/'))
  } finally {
    fs.rmSync(tmp, { force: true })
  }
}

const { getCalcDef, CALC_DEFS } = await loadSrcModule('views/calc/defs.js', 'defs')

/* ---------------- 测试用例（期望值来自政策原文算例 / 费率表手算） ---------------- */
const CASES = [
  {
    id: 'agent',
    name: '招标代理服务费 · 工程招标 6000万元',
    inputs: { amount: 6000, selects: { type: 'construction', std: 'national1980' } },
    expect: 22.55,
    source: '计价格〔2002〕1980号 附件2 原文算例：1+2.8+2.75+14+2=22.55万元',
  },
  {
    id: 'agent',
    name: '招标代理服务费 · 货物招标 500万元',
    inputs: { amount: 500, selects: { type: 'goods', std: 'national1980' } },
    expect: 1 * 1.5 + 400 * 0.011,
    source: '100×1.5%+400×1.1% = 5.9万元',
  },
  {
    id: 'cost',
    name: '造价咨询服务费 · 中价协35号 工程量清单编制 3000万元',
    inputs: { amount: 3000, selects: { std: 'zjx35', item: '2' } },
    expect: 200 * 0.005 + 300 * 0.004 + 1500 * 0.003 + 1000 * 0.0022,
    source: '200×5‰+300×4‰+1500×3‰+1000×2.2‰ = 8.9万元',
  },
  {
    id: 'design',
    name: '工程设计服务费 · 计费额 5000万元（基价表节点值）',
    inputs: { amount: 5000, selects: { complexity: '1' } },
    expect: 163.9,
    source: '计价格〔2002〕10号 基价表：5000万元 → 163.9万元',
  },
  {
    id: 'design',
    name: '工程设计服务费 · 计费额 3000万元 复杂系数1.15',
    inputs: { amount: 3000, selects: { complexity: '1.15' } },
    expect: 103.8 * 1.15,
    source: '基价表 3000万元 → 103.8万元 × 1.15',
  },
  {
    id: 'supervision',
    name: '施工监理服务费 · 计费额 5000万元（基价表节点值）',
    inputs: { amount: 5000, selects: { complexity: '1', std: 'fgw670' } },
    expect: 120.8,
    source: '发改价格〔2007〕670号 基价表：5000万元 → 120.8万元',
  },
  {
    id: 'supervision',
    name: '施工监理服务费 · 计费额 20000万元（内插）',
    inputs: { amount: 20000, selects: { complexity: '1', std: 'fgw670' } },
    expect: 393.4,
    source: '670号 基价表：20000万元 → 393.4万元',
  },
  {
    id: 'buildmgmt',
    name: '项目建设管理费 · 总投资 20000万元',
    inputs: { amount: 20000, selects: {} },
    expect: 1000 * 0.02 + 4000 * 0.015 + 5000 * 0.012 + 10000 * 0.01,
    source: '财建〔2016〕504号：20+60+60+100 = 240万元',
  },
  {
    id: 'daibuild',
    name: '项目代建管理费 · 总投资 20000万元',
    inputs: { amount: 20000, selects: {} },
    expect: 5000 * 0.03 + 5000 * 0.02 + 10000 * 0.015,
    source: '闽发改法规〔2016〕613号：5000×3%+5000×2%+10000×1.5% = 150+100+150 = 400万元',
  },
  {
    id: 'transaction',
    name: '工程交易服务费 · 施工类 3000万元',
    inputs: { amount: 3000, selects: { category: 'construction' } },
    expect: 13500,
    source: '闽发改价格〔2024〕150号：1000–5000万元档 → 13500 元/宗',
  },
  {
    id: 'design',
    name: '工程设计服务费 · 计费额 6000万元（非节点，直线内插）',
    inputs: { amount: 6000, selects: { complexity: '1' } },
    expect: 163.9 + ((249.6 - 163.9) * (6000 - 5000)) / (8000 - 5000),
    source: '163.9 + (249.6−163.9)×1000/3000 ≈ 192.4667万元',
  },
  {
    id: 'preconsult',
    name: '前期工作咨询费 · 估算投资 3000万元（档位下边界）',
    inputs: { amount: 3000, selects: { type: 'jianyishu' } },
    expect: [6, 14],
    source: '边界回归：3000万元应命中「3000万–1亿元」档，不得穿透到末档',
  },
  {
    id: 'preconsult',
    name: '前期工作咨询费 · 编制项目建议书 8000万元',
    inputs: { amount: 8000, selects: { type: 'jianyishu' } },
    expect: [6, 14],
    source: '计价格〔1999〕1283号：3000万–1亿元档 → 6~14万元',
  },
  {
    id: 'eia',
    name: '环境影响咨询费 · 编制报告书 1.5亿元',
    inputs: { amount: 1.5, selects: { type: 'baogaoshu' } },
    expect: [6, 15],
    source: '计价格〔2002〕125号：0.3–2亿元档 → 6~15万元',
  },
]

console.log('计算引擎回归验证\n' + '='.repeat(72))

let pass = 0
let fail = 0

for (const c of CASES) {
  const def = getCalcDef(c.id)
  if (!def) {
    console.log(`× ${c.name}\n  找不到计算器定义：${c.id}\n`)
    fail++
    continue
  }
  let out
  try {
    out = def.compute({ amount: c.inputs.amount, selects: { ...c.inputs.selects }, discount: 0 })
  } catch (e) {
    console.log(`× ${c.name}\n  计算抛出异常：${e.message}\n`)
    fail++
    continue
  }

  const got = out.base
  // 计算结果统一保留 4 位小数，容差取 1e-4
  const EPS = 1e-4
  let ok
  if (Array.isArray(c.expect)) {
    ok = Array.isArray(got) && Math.abs(got[0] - c.expect[0]) < EPS && Math.abs(got[1] - c.expect[1]) < EPS
  } else {
    ok = Math.abs(Number(got) - c.expect) < EPS
  }

  const fmt = (v) => (Array.isArray(v) ? `[${v[0]}, ${v[1]}]` : Number(v).toFixed(4))
  if (ok) {
    pass++
    console.log(`✓ ${c.name}`)
    console.log(`  结果 ${fmt(got)} ${def.resultUnit}　期望 ${fmt(c.expect)}`)
    console.log(`  依据 ${c.source}`)
  } else {
    fail++
    console.log(`× ${c.name}`)
    console.log(`  结果 ${fmt(got)} ${def.resultUnit}　期望 ${fmt(c.expect)}　<-- 不一致`)
    console.log(`  依据 ${c.source}`)
  }
  console.log('')
}

console.log('='.repeat(72))
console.log(`通过 ${pass} 项 / 失败 ${fail} 项 / 共 ${CASES.length} 项`)
console.log(`计算器定义总数：${CALC_DEFS.length}`)

process.exit(fail === 0 ? 0 : 1)
