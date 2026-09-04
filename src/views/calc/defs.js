/**
 * 9 套计算器定义（配置驱动）
 *
 * 每个计算器只需在这里描述：输入项、可选项、计算逻辑。
 * 页面渲染、校验、结果展示、Excel 导出、统计列表全部由通用引擎自动完成。
 * 新增计算器 = 在这里加一个对象 + 在 src/data/standards.json 的 CALCULATORS 里登记。
 */
import S from '@/data/standards.json'
import { calcProgressive, calcInterpolate, findBandRange, findFixedBand, round } from '@/utils/fee'

/** 通用金额上限：1亿万元 */
const MAX_WAN = 100000000

/** 复杂程度系数（设计与监理通用） */
const COMPLEXITY_OPTIONS = (S.DESIGN_COMPLEXITY || []).map((c) => ({
  value: String(c.value),
  label: c.label,
}))

const toOptions = (list, valueKey, labelKey) =>
  (list || []).map((x) => ({ value: String(x[valueKey]), label: x[labelKey] }))

/**
 * 造价咨询：按当前下拉值定位「标准 + 服务类别」。
 * 供级联选项、金额框显隐、计算逻辑共用，避免三处各写一遍导致口径不一致。
 */
function findCostItem(values) {
  const std = S.COST_STANDARDS.find((x) => x.id === values.std) || S.COST_STANDARDS[0]
  const item = (std.items || []).find((x) => x.no === values.item) || std.items[0]
  return { std, item: item || {} }
}

export const CALC_DEFS = [
  /* ---------------- 1. 招标代理服务费 ---------------- */
  {
    id: 'agent',
    name: '招标代理服务费',
    group: '计费工具',
    icon: 'briefcase',
    desc: '1980号差额定率累进 / 闽招协32号 / 厦建价协05号',
    docNo: '计价格〔2002〕1980号',
    stdName: '招标代理服务收费管理暂行办法',
    mode: 'progressive',
    resultUnit: '万元',
    amount: {
      label: '中标金额（中标通知书金额）',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 500',
      defaultValue: '500',
    },
    selects: [
      {
        key: 'std',
        label: '执行标准',
        options: [
          { value: 'national1980', label: '计价格〔2002〕1980号（国家）' },
          ...(S.AGENT_REF_STANDARDS || []).map((x) => ({ value: x.id, label: `${x.doc}（${x.name}）` })),
        ],
      },
      {
        key: 'type',
        label: '项目类型（对应不同费率表）',
        options: toOptions(S.AGENT_PROJECT_TYPES, 'id', 'name'),
      },
    ],
    compute({ amount, selects }) {
      const type = (S.AGENT_PROJECT_TYPES || []).find((t) => t.id === selects.type) || S.AGENT_PROJECT_TYPES[0]
      const { total, breakdown } = calcProgressive(amount, S.AGENT_FEE_BANDS, type.rates, 'percent')
      const ref = (S.AGENT_REF_STANDARDS || []).find((x) => x.id === selects.std)
      return {
        base: round(total, 4),
        breakdown,
        note: ref ? ref.note : (S.AGENT_FEE_POLICY && S.AGENT_FEE_POLICY.disclaimer) || '',
        rateTable: S.AGENT_FEE_BANDS.map((b, i) => ({ label: b.label, rate: `${type.rates[i]}%` })),
        extraLabel: '项目类型',
        extraValue: type.name,
      }
    },
  },

  /* ---------------- 2. 造价咨询服务费 ---------------- */
  {
    id: 'cost',
    name: '造价咨询服务费',
    group: '计费工具',
    icon: 'calculator',
    desc: '中价协35号等多套标准，差额定率分档累进',
    docNo: '中价协〔2013〕35号',
    stdName: '建设工程造价咨询服务收费标准',
    mode: 'progressive',
    resultUnit: '万元',
    amount: {
      label: '计费基数（建安工程费用）',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 3000',
      defaultValue: '3000',
      // 钢筋精细计量、造价师计时咨询等类目按固定单价执行，无分档费率，无需输入计费基数
      hiddenFor: (values) => !!findCostItem(values).fixed,
    },
    selects: [
      {
        key: 'std',
        label: '执行标准',
        options: toOptions(S.COST_STANDARDS, 'id', 'doc'),
      },
      {
        key: 'item',
        label: '服务类别',
        // 级联：随所选标准变化
        optionsFor: (values) => {
          const std = S.COST_STANDARDS.find((x) => x.id === values.std) || S.COST_STANDARDS[0]
          return toOptions(std.items, 'no', 'name')
        },
      },
    ],
    defaults: { std: 'zjx35', item: '1' },
    compute({ amount, selects }) {
      const { std, item } = findCostItem(selects)

      // 固定单价类目（钢筋精细计量、造价师计时咨询等）按标准文本执行固定计价，
      // 不参与差额定率累进——与政策原文口径一致，不自行推导数值以免算错。
      if (item.fixed) {
        return {
          isFixed: true,
          fixedText: item.fixed,
          base: null,
          breakdown: [
            { label: '咨询项目', value: item.name },
            { label: '计费基数', value: item.base },
            { label: '收费单价', value: item.fixed },
          ],
          note: '该项目按固定单价计价执行，不参与差额定率累进计算，请按实际工程量自行乘算。',
          extraLabel: `${std.doc} · ${item.name}`,
          extraValue: `计费基数：${item.base}`,
        }
      }

      const { total, breakdown } = calcProgressive(amount, std.bands, item.rates, 'permille')

      let note = ''
      if (item.minBase && amount < item.minBase) {
        note = item.minNote || `本服务适用于计费基数 ${item.minBase} 万元以上，以下由双方协商确定。`
      }
      return {
        base: round(total, 4),
        breakdown,
        note,
        rateTable: std.bands.map((b, i) => ({
          label: b.label,
          rate: item.rates[i] === null ? '—' : `${item.rates[i]}‰`,
        })),
        extraLabel: `${std.doc} · ${item.name}`,
        extraValue: `计费基数：${item.base}`,
      }
    },
  },

  /* ---------------- 3. 工程设计服务费 ---------------- */
  {
    id: 'design',
    name: '工程设计服务费',
    group: '计费工具',
    icon: 'ruler',
    desc: '10号基价表直线内插 × 复杂程度系数',
    docNo: '计价格〔2002〕10号',
    stdName: '工程勘察设计收费管理规定（工程设计收费基价表）',
    mode: 'interpolate',
    resultUnit: '万元',
    amount: {
      label: '工程设计计费额（建筑安装工程费）',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 5000',
      defaultValue: '5000',
    },
    selects: [
      { key: 'complexity', label: '复杂程度调整系数', options: COMPLEXITY_OPTIONS },
    ],
    defaults: { complexity: '1' },
    compute({ amount, selects }) {
      const coef = Number(selects.complexity) || 1
      const basePrice = calcInterpolate(amount, S.DESIGN_10_POINTS)
      return {
        base: round(basePrice * coef, 4),
        breakdown: [
          { label: '计费额', value: `${amount} 万元` },
          { label: '工程设计收费基价（直线内插）', value: `${round(basePrice, 4)} 万元` },
          { label: '复杂程度调整系数', value: coef },
          { label: '基准价 = 基价 × 系数', value: `${round(basePrice * coef, 4)} 万元` },
        ],
        note: '基本设计收费 = 工程设计收费基价 × 专业调整系数 × 工程复杂程度调整系数 × 附加调整系数。本表已计入复杂程度系数，其余系数请按项目实际自行乘算。',
        extraLabel: '复杂程度系数',
        extraValue: String(coef),
      }
    },
  },

  /* ---------------- 4. 施工监理服务费 ---------------- */
  {
    id: 'supervision',
    name: '施工监理服务费',
    group: '计费工具',
    icon: 'eye',
    desc: '670号基价表直线内插',
    docNo: '发改价格〔2007〕670号',
    stdName: '建设工程监理与相关服务收费标准',
    mode: 'interpolate',
    resultUnit: '万元',
    amount: {
      label: '施工监理服务计费额（建筑安装工程费）',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 5000',
      defaultValue: '5000',
    },
    selects: [
      { key: 'complexity', label: '工程复杂程度调整系数', options: COMPLEXITY_OPTIONS },
      {
        key: 'std',
        label: '执行标准',
        options: [
          { value: 'fgw670', label: '发改价格〔2007〕670号（国家）' },
          ...(S.SUPERVISION_REF_STANDARDS || []).map((x) => ({ value: x.id, label: `${x.doc}（地方参考）` })),
        ],
      },
    ],
    defaults: { complexity: '1', std: 'fgw670' },
    compute({ amount, selects }) {
      const coef = Number(selects.complexity) || 1
      const basePrice = calcInterpolate(amount, S.SUPERVISION_670_POINTS)
      const ref = (S.SUPERVISION_REF_STANDARDS || []).find((x) => x.id === selects.std)
      return {
        base: round(basePrice * coef, 4),
        breakdown: [
          { label: '计费额', value: `${amount} 万元` },
          { label: '施工监理收费基价（直线内插）', value: `${round(basePrice, 4)} 万元` },
          { label: '复杂程度调整系数', value: coef },
          { label: '基准价 = 基价 × 系数', value: `${round(basePrice * coef, 4)} 万元` },
        ],
        note: ref
          ? ref.note
          : '施工监理服务收费 = 施工监理服务收费基价 × 专业调整系数 × 工程复杂程度调整系数 × 高程调整系数。本表已计入复杂程度系数。',
        extraLabel: '复杂程度系数',
        extraValue: String(coef),
      }
    },
  },

  /* ---------------- 5. 前期工作咨询费 ---------------- */
  {
    id: 'preconsult',
    name: '前期工作咨询费',
    group: '计费工具',
    icon: 'compass',
    desc: '1283号分档收费区间',
    docNo: '计价格〔1999〕1283号',
    stdName: '建设项目前期工作咨询收费暂行规定',
    mode: 'bandRange',
    resultUnit: '万元',
    amount: {
      label: '估算投资额',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 8000',
      defaultValue: '8000',
    },
    selects: [
      { key: 'type', label: '服务内容', options: toOptions(S.PRE_1283_TYPES, 'id', 'name') },
    ],
    defaults: { type: 'jianyishu' },
    compute({ amount, selects }) {
      const typeIndex = Math.max(0, S.PRE_1283_TYPES.findIndex((t) => t.id === selects.type))
      const band = findBandRange(amount, S.PRE_1283_BANDS)
      const fee = (band.fees || [])[typeIndex] || [null, null]
      const typeName = (S.PRE_1283_TYPES[typeIndex] || {}).name || ''
      const isLow = amount <= 3000
      return {
        base: [fee[0], fee[1]],
        isRange: true,
        breakdown: [
          { label: '估算投资额', value: `${amount} 万元` },
          { label: '适用档位', value: band.label },
          { label: '服务内容', value: typeName },
          { label: '收费标准区间', value: fee[1] === null ? `≥ ${fee[0]}` : `${fee[0]} ~ ${fee[1]}` },
        ],
        note: isLow ? S.PRE_1283_LOW_NOTE : '按建设项目估算投资额分档收费，区间内由双方协商确定。',
        rateTable: S.PRE_1283_BANDS.map((b) => ({
          label: b.label,
          rate: b.fees[typeIndex] ? (b.fees[typeIndex][1] === null ? `≥ ${b.fees[typeIndex][0]}` : `${b.fees[typeIndex][0]} ~ ${b.fees[typeIndex][1]}`) : '—',
        })),
        extraLabel: '服务内容',
        extraValue: typeName,
      }
    },
  },

  /* ---------------- 6. 环境影响咨询费 ---------------- */
  {
    id: 'eia',
    name: '环境影响咨询费',
    group: '计费工具',
    icon: 'leaf',
    desc: '125号分档收费区间',
    docNo: '计价格〔2002〕125号',
    stdName: '建设项目环境影响咨询收费标准',
    mode: 'bandRange',
    resultUnit: '万元',
    amount: {
      label: '估算投资额',
      unit: '亿元',
      max: 100000,
      maxLabel: '10万亿元',
      placeholder: '例如 1.5',
      defaultValue: '1.5',
    },
    selects: [
      { key: 'type', label: '服务内容', options: toOptions(S.EIA_125_TYPES, 'id', 'name') },
    ],
    defaults: { type: 'baogaoshu' },
    compute({ amount, selects }) {
      const typeIndex = Math.max(0, S.EIA_125_TYPES.findIndex((t) => t.id === selects.type))
      const band = findBandRange(amount, S.EIA_125_BANDS)
      const fee = (band.fees || [])[typeIndex] || [null, null]
      const typeName = (S.EIA_125_TYPES[typeIndex] || {}).name || ''
      return {
        base: [fee[0], fee[1]],
        isRange: true,
        breakdown: [
          { label: '估算投资额', value: `${amount} 亿元` },
          { label: '适用档位', value: band.label },
          { label: '服务内容', value: typeName },
          { label: '收费标准区间', value: fee[1] === null ? `≥ ${fee[0]}` : `${fee[0]} ~ ${fee[1]}` },
        ],
        note: '本表为编制环境影响报告书/报告表及评估的收费标准，区间内由双方协商确定；行业、环境敏感程度调整系数按原文执行。',
        rateTable: S.EIA_125_BANDS.map((b) => ({
          label: b.label,
          rate: b.fees[typeIndex] ? (b.fees[typeIndex][1] === null ? `≥ ${b.fees[typeIndex][0]}` : `${b.fees[typeIndex][0]} ~ ${b.fees[typeIndex][1]}`) : '—',
        })),
        extraLabel: '服务内容',
        extraValue: typeName,
      }
    },
  },

  /* ---------------- 7. 项目建设管理费 ---------------- */
  {
    id: 'buildmgmt',
    name: '项目建设管理费',
    group: '计费工具',
    icon: 'building',
    desc: '财建504号总额控制数差累进',
    docNo: '财建〔2016〕504号',
    stdName: '基本建设项目建设成本管理规定（项目建设管理费总额控制数）',
    mode: 'progressive',
    resultUnit: '万元',
    amount: {
      label: '项目总投资（不含土地征用及迁移补偿费）',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 20000',
      defaultValue: '20000',
    },
    selects: [],
    compute({ amount }) {
      const { total, breakdown } = calcProgressive(amount, S.BUILDMGMT_504_BANDS, S.BUILDMGMT_504_RATES, 'percent')
      return {
        base: round(total, 4),
        breakdown,
        note: '本表为项目建设管理费总额控制数，按项目总投资（不含土地征用及迁移补偿费）差额累进计算，实行总额控制、分年度据实列支。',
        rateTable: S.BUILDMGMT_504_BANDS.map((b, i) => ({ label: b.label, rate: `${S.BUILDMGMT_504_RATES[i]}%` })),
      }
    },
  },

  /* ---------------- 8. 项目代建管理费 ---------------- */
  {
    id: 'daibuild',
    name: '项目代建管理费',
    group: '计费工具',
    icon: 'hardhat',
    desc: '闽发改法规613号分档限额',
    docNo: '闽发改法规〔2016〕613号',
    stdName: '福建省省级政府投资项目代建管理费收费标准',
    mode: 'progressive',
    resultUnit: '万元',
    amount: {
      label: '项目总投资（代建项目批复概算）',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 20000',
      defaultValue: '20000',
    },
    selects: [],
    compute({ amount }) {
      const { total, breakdown } = calcProgressive(amount, S.DAIBUILD_613_BANDS, S.DAIBUILD_613_RATES, 'percent')
      return {
        base: round(total, 4),
        breakdown,
        note: '本表为代建管理费限额，按项目总投资差额累进计算，为代建单位管理费的最高限额，实际由项目单位与代建单位在限额内协商确定。',
        rateTable: S.DAIBUILD_613_BANDS.map((b, i) => ({ label: b.label, rate: `${S.DAIBUILD_613_RATES[i]}%` })),
      }
    },
  },

  /* ---------------- 9. 工程交易服务费 ---------------- */
  {
    id: 'transaction',
    name: '工程交易服务费',
    group: '计费工具',
    icon: 'receipt',
    desc: '闽发改价格150号 元/宗',
    docNo: '闽发改价格〔2024〕150号',
    stdName: '福建省建设工程交易服务收费标准',
    mode: 'fixedCase',
    resultUnit: '元',
    amount: {
      label: '中标金额',
      unit: '万元',
      max: MAX_WAN,
      maxLabel: '1亿万元',
      placeholder: '例如 3000',
      defaultValue: '3000',
    },
    selects: [
      { key: 'category', label: '项目类别', options: toOptions(S.TX_150_CATEGORIES, 'id', 'name') },
    ],
    defaults: { category: 'construction' },
    compute({ amount, selects }) {
      const cat = (S.TX_150_CATEGORIES || []).find((c) => c.id === selects.category) || S.TX_150_CATEGORIES[0]
      const band = findFixedBand(amount, cat.bands)
      return {
        base: Number(band.fee) || 0,
        breakdown: [
          { label: '中标金额', value: `${amount} 万元` },
          { label: '项目类别', value: cat.name },
          { label: '适用档位', value: band.label },
          { label: '收费标准', value: `${band.fee} ${cat.unitNote || '元/宗'}` },
        ],
        note: `${S.TX_150_NOTES || ''}${cat.payNote ? `　${cat.payNote}` : ''}`.trim(),
        rateTable: (cat.bands || []).map((b) => ({ label: b.label, rate: `${b.fee} 元/宗` })),
        extraLabel: '项目类别',
        extraValue: cat.name,
      }
    },
  },
]

/** 按 id 取计算器定义 */
export function getCalcDef(id) {
  return CALC_DEFS.find((c) => c.id === id) || null
}

/** 按分组归类，用于首页与侧边栏 */
export function groupCalcs() {
  const map = new Map()
  CALC_DEFS.forEach((c) => {
    if (!map.has(c.group)) map.set(c.group, [])
    map.get(c.group).push(c)
  })
  return [...map.entries()].map(([group, items]) => ({ group, items }))
}
