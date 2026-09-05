<script setup>
/**
 * 计费计算器通用引擎页
 *
 * 由 src/views/calc/defs.js 中的配置驱动渲染，9 套计算器共用本页：
 * 实时计算 → 双口径对比 → 校验失败清空结果 → 导出 xlsx → 手动加入统计列表。
 */
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import AppSelect from '@/components/AppSelect.vue'
import { getCalcDef } from './defs'
import { validateNumber, validatePercent } from '@/utils/validate'
import { applyDiscount, round } from '@/utils/fee'
import { fmtNumber, fmtRange, fmtDateTime, wanToYuanText } from '@/utils/format'
import { exportWorkbook, timestamped } from '@/utils/exportXlsx'
import { getStatsList, pushStats, clearStats, setItem } from '@/utils/storage'
import { DATA_VERSIONS, STORAGE_KEYS } from '@/config'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { toast, success, error } = useToast()

const def = computed(() => getCalcDef(route.params.id))

/* ---------------- 表单状态 ---------------- */
const amount = ref('')
const discount = ref('0')
const selects = reactive({})
const exporting = ref(false)

function resetForm() {
  const d = def.value
  if (!d) return
  amount.value = d.amount.defaultValue || ''
  discount.value = '0'
  Object.keys(selects).forEach((k) => delete selects[k])
  d.selects.forEach((sel) => {
    const opts = sel.optionsFor ? sel.optionsFor(selects) : sel.options
    const fallback = (d.defaults && d.defaults[sel.key]) || (opts && opts[0] && opts[0].value)
    selects[sel.key] = fallback || ''
  })
}
resetForm()
watch(def, resetForm)

/** 级联选项：某些下拉项依赖其他下拉项的当前值 */
function optionsOf(sel) {
  return sel.optionsFor ? sel.optionsFor(selects) : sel.options || []
}

// 主选项变化时，重置依赖它的级联选项
watch(
  () => ({ ...selects }),
  () => {
    if (!def.value) return
    def.value.selects.forEach((sel) => {
      if (!sel.optionsFor) return
      const opts = sel.optionsFor(selects)
      if (opts.length && !opts.some((o) => o.value === selects[sel.key])) {
        selects[sel.key] = opts[0].value
      }
    })
  }
)

/* ---------------- 校验 ---------------- */
/** 固定单价类目（如钢筋精细计量、造价师计时咨询）无计费基数输入，隐藏金额框与下浮框 */
const amountHidden = computed(() => {
  const d = def.value
  if (!d || !d.amount || typeof d.amount.hiddenFor !== 'function') return false
  return !!d.amount.hiddenFor(selects)
})

const amountCheck = computed(() => {
  // 固定单价模式跳过数值校验，避免无输入时误判「校验失败清空结果」
  if (amountHidden.value) return { valid: true, value: 0, message: '' }
  const d = def.value
  if (!d) return { valid: false, value: NaN, message: '' }
  return validateNumber(amount.value, {
    label: d.amount.label,
    max: d.amount.max,
    maxLabel: d.amount.maxLabel,
    allowZero: false,
  })
})

const discountCheck = computed(() => validatePercent(discount.value, { label: '下浮比例', max: 100, min: 0 }))

/** 任一校验失败 → 结果为 null，页面清空计算结果区域 */
const result = computed(() => {
  if (!amountCheck.value.valid || !discountCheck.value.valid) return null
  const d = def.value
  if (!d) return null
  try {
    return d.compute({
      amount: amountCheck.value.value,
      selects: { ...selects },
      discount: discountCheck.value.value,
    })
  } catch (e) {
    return null
  }
})

/* ---------------- 双口径结果 ---------------- */
const discountRate = computed(() => (discountCheck.value.valid ? discountCheck.value.value : 0))

function discountApplied(value) {
  if (value === null || value === undefined) return null
  return applyDiscount(value, discountRate.value)
}

const baseValue = computed(() => (result.value ? result.value.base : null))
const adjustedValue = computed(() => {
  if (!result.value) return null
  const b = result.value.base
  if (Array.isArray(b)) return [discountApplied(b[0]), discountApplied(b[1])]
  return discountApplied(b)
})

const isRange = computed(() => !!(result.value && result.value.isRange))
const unit = computed(() => (def.value ? def.value.resultUnit : '万元'))
const isWan = computed(() => unit.value === '万元')

/** 结果主显示文本 */
function displayValue(v) {
  if (v === null || v === undefined) return '—'
  if (Array.isArray(v)) return fmtRange(v[0], v[1], '')
  return fmtNumber(v, 4)
}

/* ---------------- 统计列表（用户手动加入） ---------------- */
const statsList = ref(getStatsList())

function buildInputSummary() {
  const d = def.value
  const rows = []
  if (!amountHidden.value) {
    rows.push([d.amount.label, `${amountCheck.value.value} ${d.amount.unit}`])
  }
  d.selects.forEach((sel) => {
    const opt = optionsOf(sel).find((o) => o.value === selects[sel.key])
    rows.push([sel.label, opt ? opt.label : selects[sel.key]])
  })
  if (!amountHidden.value) {
    rows.push(['下浮比例', `${discountRate.value}%`])
  }
  return rows
}

/** 当前结果加入统计列表（手动触发，而非自动保存） */
function addToStats() {
  if (!result.value || !def.value) return
  const record = {
    calcId: def.value.id,
    calcName: def.value.name,
    docNo: def.value.docNo,
    unit: unit.value,
    inputs: buildInputSummary(),
    base: baseValue.value,
    adjusted: adjustedValue.value,
    isRange: isRange.value,
    discount: discountRate.value,
  }
  statsList.value = pushStats(record)
  success('已加入统计列表')
}

/** 从统计列表移除某一项 */
function removeStatsItem(idx) {
  const list = getStatsList()
  list.splice(idx, 1)
  setItem(STORAGE_KEYS.statsList, list)
  statsList.value = list
}

function clearStatsAll() {
  clearStats()
  statsList.value = []
  success('统计列表已清空')
}

/** 导出统计列表为 Excel（含费用统计合计行） */
async function exportStats() {
  if (!currentStats.value.length) {
    toast('统计列表为空')
    return
  }
  const aoa = [['统计列表']]
  aoa.push(['计算器', '参数', `基准价（${unit.value}）`, `下浮后（${unit.value}）`, '费率依据文号'])
  currentStats.value.forEach((s) => {
    aoa.push([
      s.calcName,
      s.inputs && s.inputs[0] ? s.inputs[0][1] : '—',
      displayValue(s.base),
      displayValue(s.adjusted),
      s.docNo,
    ])
  })
  if (statsSummary.value) {
    aoa.push(['费用统计', '', displayValue(statsSummary.value.base), displayValue(statsSummary.value.adjusted), ''])
  }
  aoa.push([])
  aoa.push(['导出时间', fmtDateTime(new Date().toISOString())])
  await exportWorkbook(timestamped('统计列表'), [{ name: '统计列表', aoa, cols: [20, 30, 18, 18, 24] }])
  success('统计列表已导出')
}

/** 复制政策文号（S16：结果卡底部的「依据」文本） */
function copyDoc() {
  if (!def.value) return
  const text = `${def.value.docNo}《${def.value.stdName}》`
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => success('依据文号已复制'))
      .catch(() => toast('复制失败，请手动选择'))
  } else {
    toast('当前环境不支持自动复制')
  }
}

const currentStats = computed(() => statsList.value.slice(0, 50))

/** 费用统计：仅汇总与当前结果单位一致的记录（区间取中值） */
const statsSummary = computed(() => {
  const list = currentStats.value
  if (!list.length) return null
  let base = 0
  let adjusted = 0
  let count = 0
  let skipped = 0
  for (const s of list) {
    if (s.unit && s.unit !== unit.value) {
      skipped++
      continue
    }
    const b = Array.isArray(s.base) ? (Number(s.base[0]) + Number(s.base[1])) / 2 : Number(s.base)
    const a = Array.isArray(s.adjusted)
      ? (Number(s.adjusted[0]) + Number(s.adjusted[1])) / 2
      : Number(s.adjusted)
    if (Number.isFinite(b)) base += b
    if (Number.isFinite(a)) adjusted += a
    count++
  }
  return { base, adjusted, count, skipped }
})

/* ---------------- 导出 Excel ---------------- */
async function exportResult() {
  if (!result.value || !def.value) return
  const d = def.value
  exporting.value = true
  try {
    const aoa = []
    aoa.push([`${d.name} · 测算结果`])
    aoa.push(['政策文号', d.docNo])
    aoa.push(['标准名称', d.stdName])
    aoa.push(['测算口径', d.desc || ''])
    aoa.push(['导出时间', fmtDateTime(new Date().toISOString())])
    aoa.push(['数据版本核对', DATA_VERSIONS.fee.lastVerified])
    aoa.push([])

    aoa.push(['一、输入参数'])
    buildInputSummary().forEach((r) => aoa.push(r))
    aoa.push([])

    if (result.value.isFixed) {
      aoa.push(['二、计价说明'])
      ;(result.value.breakdown || []).forEach((b) => aoa.push([b.label, b.value]))
      aoa.push([])
    } else {
      aoa.push(['二、测算结果'])
      aoa.push(['口径', `金额（${unit.value}）`, isWan.value ? '金额（元）' : '', '说明'])
      aoa.push([
        '未打折（标准基准价）',
        displayValue(baseValue.value),
        isWan.value && !isRange.value ? wanToYuanText(baseValue.value) : '',
        '按标准费率计算，未计取议价下浮',
      ])
      aoa.push([
        `计取调整系数后（下浮 ${discountRate.value}%）`,
        displayValue(adjustedValue.value),
        isWan.value && !isRange.value ? wanToYuanText(adjustedValue.value) : '',
        `基准价 ×（1 − ${discountRate.value}%）`,
      ])
      if (isRange.value) aoa.push(['说明', '本标准为分档收费区间，实际收费在区间内由双方协商确定。'])
      aoa.push([])

      if (result.value.breakdown && result.value.breakdown.length) {
        aoa.push(['三、计算明细'])
        if (d.mode === 'progressive') {
          aoa.push(['分档区间', '费率', '该档计费额（万元）', '该档费用（万元）'])
          result.value.breakdown.forEach((b) => {
            aoa.push([b.label, `${b.rate}${d.id === 'cost' ? '‰' : '%'}`, fmtNumber(b.segAmount, 4), fmtNumber(b.segFee, 4)])
          })
          aoa.push(['合计', '', '', displayValue(baseValue.value)])
        } else {
          aoa.push(['项目', '取值'])
          result.value.breakdown.forEach((b) => aoa.push([b.label, b.value]))
        }
        aoa.push([])
      }
    }

    if (result.value.rateTable && result.value.rateTable.length) {
      aoa.push(['四、适用费率表'])
      aoa.push([d.id === 'transaction' ? '收费档位' : '分档区间', d.id === 'transaction' ? '收费标准' : '费率'])
      result.value.rateTable.forEach((r) => aoa.push([r.label, r.rate]))
      aoa.push([])
    }

    if (result.value.note) {
      aoa.push(['五、特别提示'])
      aoa.push([result.value.note])
      aoa.push([])
    }

    aoa.push(['免责声明', '本工具内置固定版本政策标准数据，测算结果仅供工作参考，不构成专业法律、造价意见；正式工作以官方发布纸质文件为准。'])
    aoa.push(['数据说明', '用户所有输入数据保存在浏览器本地，服务器不会留存任何业务数据。'])

    await exportWorkbook(timestamped(`${d.name}_测算结果`), [{ name: '测算结果', aoa, cols: [34, 22, 22, 40] }])
    success('Excel 已导出')
  } catch (e) {
    error('导出失败：' + (e && e.message ? e.message : '未知错误'))
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div v-if="!def" class="card">
    <div class="empty">
      <div class="empty-icon"><AppIcon name="alert" :size="30" /></div>
      未找到该计算器
      <div class="mt-16"><RouterLink to="/">返回首页</RouterLink></div>
    </div>
  </div>

  <div v-else class="calc-layout">
    <!-- 左：计费参数 + 统计列表 -->
    <section>
      <div class="card mb-16">
        <div class="card-head">
          <div class="card-title">计费参数</div>
        </div>
        <div class="card-body">
          <div v-for="sel in def.selects" :key="sel.key" class="field">
            <label class="field-label" :for="`sel-${def.id}-${sel.key}`">{{ sel.label }}</label>
            <AppSelect
              :id="`sel-${def.id}-${sel.key}`"
              v-model="selects[sel.key]"
              :options="optionsOf(sel)"
              size="form"
              :placeholder="`请选择${sel.label}`"
            />
          </div>

          <div v-if="!amountHidden" class="field">
            <label class="field-label" :for="`amount-${def.id}`">{{ def.amount.label }}</label>
            <div class="input-wrap">
              <input
                :id="`amount-${def.id}`"
                v-model="amount"
                class="input"
                :class="{ 'is-error': !amountCheck.valid && amount !== '' }"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                :placeholder="def.amount.placeholder"
                :aria-invalid="!amountCheck.valid"
              />
              <span class="input-suffix">{{ def.amount.unit }}</span>
            </div>
            <p v-if="!amountCheck.valid && amount !== ''" class="field-error">{{ amountCheck.message }}</p>
            <p v-else class="field-hint">计费基数，不能为负数或 0</p>
          </div>

          <div v-if="!amountHidden" class="field">
            <label class="field-label" :for="`discount-${def.id}`">下浮比例（市场调节议价）</label>
            <div class="input-wrap">
              <input
                :id="`discount-${def.id}`"
                v-model="discount"
                class="input"
                :class="{ 'is-error': !discountCheck.valid }"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                placeholder="0"
              />
              <span class="input-suffix">%</span>
            </div>
            <p v-if="!discountCheck.valid" class="field-error">{{ discountCheck.message }}</p>
            <p v-else class="field-hint">填 0 表示不下浮；用于输出「调整系数后」对比结果</p>
          </div>

          <button class="btn btn-primary btn-full" :disabled="!result" @click="addToStats">
            <AppIcon name="plus" :size="15" />
            加入统计列表
          </button>
        </div>
      </div>

      <!-- 统计列表（用户手动加入） -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">
            统计列表
            <span class="badge badge-muted">{{ currentStats.length }}</span>
          </div>
          <div class="row" style="gap: 8px">
            <button v-if="currentStats.length" class="btn btn-sm" :disabled="exporting" @click="exportStats">
              <AppIcon name="download" :size="15" />
              导出Excel
            </button>
            <button v-if="currentStats.length" class="btn btn-sm btn-danger" @click="clearStatsAll">清空</button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="!currentStats.length" class="empty" style="padding: 24px">
            <div class="empty-icon"><AppIcon name="inbox" :size="30" /></div>
            统计列表为空，测算后点击「加入统计列表」可手动收集需要统计的内容
          </div>
          <div v-else class="table-wrap" style="border: none; border-radius: 0">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">计算器</th>
                  <th scope="col">参数</th>
                  <th scope="col" class="num">基准价（{{ unit }}）</th>
                  <th scope="col" class="num">下浮后（{{ unit }}）</th>
                  <th scope="col" class="no-print"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in currentStats" :key="i">
                  <td class="text-sm">{{ s.calcName }}</td>
                  <td class="text-sm">{{ s.inputs && s.inputs[0] ? s.inputs[0][1] : '—' }}</td>
                  <td class="num">{{ displayValue(s.base) }}</td>
                  <td class="num">{{ displayValue(s.adjusted) }}</td>
                  <td class="no-print"><button class="btn btn-sm" @click="removeStatsItem(i)">移除</button></td>
                </tr>
              </tbody>
              <tfoot v-if="statsSummary">
                <tr class="stats-sum">
                  <td colspan="2">
                    费用统计
                    <span class="stats-sum-hint">
                      {{ statsSummary.count }} 条{{
                        statsSummary.skipped ? ` · 已排除 ${statsSummary.skipped} 条单位不同的记录` : ''
                      }}
                    </span>
                  </td>
                  <td class="num">{{ displayValue(statsSummary.base) }}</td>
                  <td class="num">{{ displayValue(statsSummary.adjusted) }}</td>
                  <td class="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- 右：测算结果 -->
    <section>
      <div class="card mb-16">
        <div class="card-head">
          <div class="card-title">测算结果</div>
          <div class="row" style="gap: 8px">
            <button class="btn btn-primary btn-sm" :disabled="!result || exporting" @click="exportResult">
              <AppIcon name="download" :size="15" />
              {{ exporting ? '导出中…' : '导出 Excel' }}
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- 校验失败：清空结果区域，仅展示中文错误提示 -->
          <div v-if="!result" class="alert alert-danger">
            <AppIcon name="info" :size="16" />
            <div>
              <template v-if="!amountCheck.valid && amount !== ''">{{ amountCheck.message }}</template>
              <template v-else-if="!discountCheck.valid">{{ discountCheck.message }}</template>
              <template v-else>请填写有效的计费基数后再查看测算结果。</template>
              <div class="text-sm mt-8">校验未通过，计算结果已清空。</div>
            </div>
          </div>

          <template v-else>
            <!-- 固定单价模式：不参与差额定率累进，仅展示政策原文单价 -->
            <div v-if="result.isFixed" class="fixed-box">
              <div class="fixed-title">{{ def.name }} · 固定单价</div>
              <div class="fixed-price">{{ result.fixedText }}</div>
              <div class="fixed-base">{{ result.extraValue }}</div>
            </div>

            <div v-else class="result-grid">
              <div class="result-card is-primary">
                <div class="result-label">未打折 · 标准基准价</div>
                <div class="result-value">
                  {{ displayValue(baseValue) }}
                  <span class="result-unit">{{ unit }}</span>
                </div>
                <div class="result-sub">
                  {{ isWan && !isRange ? wanToYuanText(baseValue) : isRange ? '分档收费区间' : '按标准费率计算' }}
                </div>
              </div>

              <div class="result-card">
                <div class="result-label">计取调整系数后 · 下浮 {{ discountRate }}%</div>
                <div class="result-value">
                  {{ displayValue(adjustedValue) }}
                  <span class="result-unit">{{ unit }}</span>
                </div>
                <div class="result-sub">
                  {{ isWan && !isRange ? wanToYuanText(adjustedValue) : isRange ? '分档收费区间' : '议价下浮后金额' }}
                </div>
              </div>
            </div>

            <div v-if="result.extraLabel && !result.isFixed" class="row mt-16 text-sm text-muted">
              <span class="badge badge-muted">{{ result.extraLabel }}</span>
              <span>{{ result.extraValue }}</span>
            </div>

            <div v-if="result.note" class="alert alert-warn mt-16">
              <AppIcon name="info" :size="16" />
              <div>{{ result.note }}</div>
            </div>

            <div v-if="def.docNo" class="result-doc mt-16">
              <span class="result-doc-label">依据</span>
              <span class="result-doc-text">{{ def.docNo }}《{{ def.stdName }}》</span>
              <button class="btn btn-sm result-doc-copy" type="button" title="复制依据文号" @click="copyDoc">复制</button>
            </div>
          </template>
        </div>
      </div>

      <!-- 计算明细 / 计价说明 -->
      <div v-if="result && result.breakdown && result.breakdown.length" class="card mb-16">
        <div class="card-head"><div class="card-title">{{ result.isFixed ? '计价说明' : '计算明细' }}</div></div>
        <div class="table-wrap" style="border: none; border-radius: 0">
          <table class="table">
            <thead>
              <tr v-if="def.mode === 'progressive' && !result.isFixed">
                <th scope="col">分档区间</th>
                <th scope="col" class="num">费率</th>
                <th scope="col" class="num">该档计费额（万元）</th>
                <th scope="col" class="num">该档费用（万元）</th>
              </tr>
              <tr v-else>
                <th scope="col">项目</th>
                <th scope="col">取值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in result.breakdown" :key="i">
                <template v-if="def.mode === 'progressive' && !result.isFixed">
                  <td>{{ b.label }}</td>
                  <td class="num">{{ b.rate }}{{ def.id === 'cost' ? '‰' : '%' }}</td>
                  <td class="num">{{ fmtNumber(b.segAmount, 4) }}</td>
                  <td class="num">{{ fmtNumber(b.segFee, 4) }}</td>
                </template>
                <template v-else>
                  <td>{{ b.label }}</td>
                  <td>{{ b.value }}</td>
                </template>
              </tr>
              <tr v-if="def.mode === 'progressive' && !result.isFixed">
                <td colspan="3" style="font-weight: 600">合计</td>
                <td class="num" style="font-weight: 700">{{ displayValue(baseValue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 费率表 -->
      <div v-if="result && result.rateTable && result.rateTable.length" class="card mb-16">
        <div class="card-head">
          <div class="card-title">适用费率表</div>
          <span class="text-sm text-muted">{{ def.docNo }}</span>
        </div>
        <div class="table-wrap" style="border: none; border-radius: 0; max-height: 320px">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">{{ def.id === 'transaction' ? '收费档位' : '分档区间' }}</th>
                <th scope="col" class="num">{{ def.id === 'transaction' ? '收费标准' : '费率' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in result.rateTable" :key="i">
                <td>{{ r.label }}</td>
                <td class="num">{{ r.rate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </section>
  </div>
</template>

<style scoped>
.calc-layout {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
@media (max-width: 1024px) {
  .calc-layout {
    grid-template-columns: 1fr;
  }
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* 统计列表：费用统计行 */
.stats-sum td {
  background: var(--muted);
  border-top: 1px solid var(--border-strong);
  font-weight: 700;
  color: var(--foreground);
  white-space: nowrap;
}
.stats-sum .num {
  color: var(--primary-strong);
}
.stats-sum-hint {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--muted-foreground);
}

/* 固定单价模式展示 */
.fixed-box {
  background: linear-gradient(135deg, var(--primary-soft), var(--muted));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 22px;
}
.fixed-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted-foreground);
  margin-bottom: 6px;
}
.fixed-price {
  font-size: 30px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.25;
  letter-spacing: 0.5px;
}
.fixed-base {
  margin-top: 8px;
  font-size: 13px;
  color: var(--muted-foreground);
}

/* S16：结果卡底部「依据」文号行（可复制） */
.result-doc {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--muted);
  font-size: 13px;
  color: var(--muted-foreground);
}
.result-doc-label {
  flex: 0 0 auto;
  color: var(--muted-foreground);
  font-weight: 500;
}
.result-doc-text {
  flex: 1;
  min-width: 0;
  color: var(--foreground);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.result-doc-copy {
  flex: 0 0 auto;
}
</style>
