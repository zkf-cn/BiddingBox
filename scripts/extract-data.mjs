/**
 * 数据抽取脚本：把本地旧项目（招标百宝箱网页版 react-vite）中的三大数据集
 * 抽离为独立 JSON 文件，实现「数据与业务逻辑分离」。
 *
 * 后续政策/定额更新时，只需替换 src/data/*.json，无需改动任何业务代码。
 *
 * 用法： node scripts/extract-data.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SRC = 'E:/编程专用/招标百宝箱网页版/mtdvfpir3hnoqvwu/react-vite/src'
const OUT = path.resolve(__dirname, '../src/data')
const TMP = path.resolve(__dirname, '../.tmp-extract')

fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(TMP, { recursive: true })

/**
 * 把一个 ESM 源文件转成可 require 的 CJS 模块并加载。
 * @param {string} srcFile 源文件绝对路径
 * @param {string} alias   临时文件别名
 */
function loadEsmAsCjs(srcFile, alias) {
  if (!fs.existsSync(srcFile)) throw new Error(`源文件不存在: ${srcFile}`)
  let code = fs.readFileSync(srcFile, 'utf8')

  // 记录所有顶层 export 的名字
  const names = []
  code = code.replace(/^export\s+(?:default\s+)?(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm, (_m, kw, name) => {
    names.push(name)
    return `${kw} ${name}`
  })
  // 处理 export default <identifier>
  code = code.replace(/^export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm, () => '')

  const bridge = `\nmodule.exports = { ${names.join(', ')} };\n`
  const tmpFile = path.join(TMP, `${alias}.cjs`)
  fs.writeFileSync(tmpFile, code + bridge, 'utf8')
  return require(tmpFile)
}

function writeJson(file, data) {
  const p = path.join(OUT, file)
  fs.writeFileSync(p, JSON.stringify(data), 'utf8')
  const kb = (fs.statSync(p).size / 1024).toFixed(0)
  console.log(`  ✓ ${file}  (${kb} KB)`)
}

console.log('开始抽取数据集...\n')

/* ---------- 1. 工期定额 ---------- */
{
  const { QDATA } = loadEsmAsCjs(path.join(SRC, 'data/quotaData.js'), 'quota')
  const pages = QDATA.pages || []
  const total = pages.reduce((n, p) => n + (p.items ? p.items.length : 0), 0)
  console.log(`工期定额：${pages.length} 个定额表 / ${total} 条 / 说明 ${Object.keys(QDATA.notes || {}).length} 篇`)
  writeJson('quota.json', QDATA)
}

/* ---------- 2. 评标专家专业分类 ---------- */
{
  const { EXPERT_CATEGORIES } = loadEsmAsCjs(path.join(SRC, 'data/expertCategories.js'), 'expert')
  const stat = (list) =>
    list.reduce(
      (acc, c1) => ({
        lv1: acc.lv1 + 1,
        lv2: acc.lv2 + (c1.subcategories || []).length,
        lv3: acc.lv3 + (c1.subcategories || []).reduce((n, s) => n + (s.specialties || []).length, 0),
        lv4: acc.lv4 + (c1.subcategories || []).reduce((n, s) => n + (s.specialties || []).reduce((m, sp) => m + (sp.items || []).length, 0), 0),
      }),
      { lv1: 0, lv2: 0, lv3: 0, lv4: 0 }
    )
  const s = stat(EXPERT_CATEGORIES)
  console.log(`专家分类：一级 ${s.lv1} / 二级 ${s.lv2} / 三级 ${s.lv3} / 四级 ${s.lv4}`)
  writeJson('expert.json', EXPERT_CATEGORIES)
}

/* ---------- 3. 计费标准（9 套计算器费率表） ---------- */
{
  const mod = loadEsmAsCjs(path.join(SRC, 'data/feeStandards.js'), 'standards')
  const keyList = [
    'AGENT_REF_STANDARDS', 'COST_STANDARDS', 'DESIGN_10_POINTS', 'DESIGN_COMPLEXITY',
    'SUPERVISION_670_POINTS', 'SUPERVISION_REF_STANDARDS', 'PRE_1283_TYPES', 'PRE_1283_BANDS',
    'PRE_1283_LOW_NOTE', 'BUILDMGMT_504_BANDS', 'BUILDMGMT_504_RATES', 'EIA_125_TYPES',
    'EIA_125_BANDS', 'DAIBUILD_613_BANDS', 'DAIBUILD_613_RATES', 'TX_150_CATEGORIES',
    'TX_150_NOTES', 'CALCULATORS',
  ]
  const out = {}
  for (const k of keyList) {
    if (mod[k] === undefined) throw new Error(`feeStandards.js 缺少导出: ${k}`)
    out[k] = mod[k]
  }
  console.log(`计费标准：${out.CALCULATORS.length} 套计算器费率表`)

  // 为每套计算器补充政策文号与标准全称（导出 Excel 时自动附带）
  const DOC_MAP = {
    agent: { docNo: '计价格〔2002〕1980号 / 闽招协〔2018〕32号 / 厦建价协〔2019〕05号', stdName: '招标代理服务收费管理暂行办法及福建省地方标准' },
    cost: { docNo: '中价协〔2013〕35号', stdName: '建设工程造价咨询服务收费标准' },
    design: { docNo: '计价格〔2002〕10号', stdName: '工程勘察设计收费管理规定（工程设计收费基价表）' },
    supervision: { docNo: '发改价格〔2007〕670号', stdName: '建设工程监理与相关服务收费标准' },
    preconsult: { docNo: '计价格〔1999〕1283号', stdName: '建设项目前期工作咨询收费暂行规定' },
    eia: { docNo: '计价格〔2002〕125号', stdName: '建设项目环境影响咨询收费标准' },
    buildmgmt: { docNo: '财建〔2016〕504号', stdName: '基本建设项目建设成本管理规定（项目建设管理费总额控制数）' },
    daibuild: { docNo: '闽发改法规〔2016〕613号', stdName: '福建省省级政府投资项目代建管理费收费标准' },
    transaction: { docNo: '闽发改价格〔2024〕150号', stdName: '福建省工程交易服务收费标准' },
  }
  out.CALCULATORS = out.CALCULATORS.map((c) => ({ ...c, ...(DOC_MAP[c.id] || {}) }))
  out.CALCULATOR_DOC_MAP = DOC_MAP

  // 招标代理差累进费率表（计价格〔2002〕1980号）
  const { FEE_BANDS, PROJECT_TYPES, FEE_POLICY } = loadEsmAsCjs(path.join(SRC, 'data/bidding.js'), 'bidding')
  out.AGENT_FEE_BANDS = FEE_BANDS.map((b) => ({
    label: b.label,
    upper: b.upper === Infinity ? null : b.upper,
  }))
  out.AGENT_PROJECT_TYPES = PROJECT_TYPES
  out.AGENT_FEE_POLICY = FEE_POLICY
  console.log(`招标代理费率表：${out.AGENT_FEE_BANDS.length} 档 × ${out.AGENT_PROJECT_TYPES.length} 类`)

  writeJson('standards.json', out)
}

fs.rmSync(TMP, { recursive: true, force: true })
console.log('\n抽取完成，输出目录：src/data/')
