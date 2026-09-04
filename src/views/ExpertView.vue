<script setup>
/**
 * 评标专家专业分类查询模块
 * 数据源：src/data/expert.json（发改法规〔2018〕316号）
 * 能力：按层级筛选 / 关键词检索 / 多选批量导出 xlsx（带条数上限防护）/ 条目收藏
 */
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { loadExpert } from '@/data'
import { DATA_VERSIONS, EXPORT_LIMIT } from '@/config'
import { exportWorkbook, timestamped } from '@/utils/exportXlsx'
import { getCollects, toggleCollect, removeCollect } from '@/utils/storage'
import { useToast } from '@/composables/useToast'
import { fmtDateTime } from '@/utils/format'

const { toast, success, error, warn } = useToast()

const loading = ref(true)
const raw = ref([])

const keyword = ref('')
const lv1 = ref('')
const lv2 = ref('')
const lv3 = ref('')
const page = ref(1)
const PAGE_SIZE = 50

const selected = ref(new Set())
const collects = ref(getCollects('expert'))
const exporting = ref(false)
const tab = ref('result')

onMounted(async () => {
  try {
    raw.value = await loadExpert()
  } catch (e) {
    error('专家分类数据加载失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
})

/* ---------------- 级联选项 ---------------- */
const lv1List = computed(() => raw.value.map((c) => ({ code: c.code, name: c.name })))
const lv1Obj = computed(() => raw.value.find((c) => c.name === lv1.value) || null)
const lv2List = computed(() => (lv1Obj.value ? lv1Obj.value.subcategories || [] : []))
const lv2Obj = computed(() => lv2List.value.find((s) => s.name === lv2.value) || null)
const lv3List = computed(() => (lv2Obj.value ? lv2Obj.value.specialties || [] : []))
const lv3Obj = computed(() => lv3List.value.find((s) => s.name === lv3.value) || null)

watch(lv1, () => {
  lv2.value = ''
  lv3.value = ''
})
watch(lv2, () => {
  lv3.value = ''
})

/* ---------------- 展平为四级条目 ---------------- */
const flat = computed(() => {
  const rows = []
  raw.value.forEach((c1) => {
    if (lv1.value && c1.name !== lv1.value) return
    ;(c1.subcategories || []).forEach((c2) => {
      if (lv2.value && c2.name !== lv2.value) return
      ;(c2.specialties || []).forEach((c3) => {
        if (lv3.value && c3.name !== lv3.value) return
        const items = c3.items || []
        if (items.length) {
          items.forEach((c4) => {
            rows.push({
              id: c4.code || `${c3.code}-${c4.name}`,
              code: c4.code || '',
              n1: c1.name,
              n2: c2.name,
              n3: c3.name,
              n4: c4.name,
              c1: c1.code,
              c2: c2.code,
              c3: c3.code,
            })
          })
        } else {
          // 部分专业没有四级，落到三级
          rows.push({
            id: c3.code || `${c2.code}-${c3.name}`,
            code: c3.code || '',
            n1: c1.name,
            n2: c2.name,
            n3: c3.name,
            n4: '',
            c1: c1.code,
            c2: c2.code,
            c3: c3.code,
          })
        }
      })
    })
  })
  return rows
})

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return flat.value
  return flat.value.filter((r) => {
    const hay = `${r.code} ${r.n1} ${r.n2} ${r.n3} ${r.n4}`.toLowerCase()
    return hay.includes(kw)
  })
})

const totalRows = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / PAGE_SIZE)))
const pagedRows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

watch([keyword, lv1, lv2, lv3], () => {
  page.value = 1
})

function resetFilter() {
  keyword.value = ''
  lv1.value = ''
  lv2.value = ''
  lv3.value = ''
  page.value = 1
}

/* ---------------- 选择与收藏 ---------------- */
const allPageSelected = computed(() => pagedRows.value.length > 0 && pagedRows.value.every((r) => selected.value.has(r.id)))
function togglePageAll(e) {
  if (e.target.checked) pagedRows.value.forEach((r) => selected.value.add(r.id))
  else pagedRows.value.forEach((r) => selected.value.delete(r.id))
  selected.value = new Set(selected.value)
}
function toggleRow(id) {
  if (selected.value.has(id)) selected.value.delete(id)
  else selected.value.add(id)
  selected.value = new Set(selected.value)
}
function clearSelected() {
  selected.value = new Set()
}

const cartItems = computed(() => filtered.value.filter((r) => selected.value.has(r.id)))

const collectIds = computed(() => new Set(collects.value.map((c) => c.id)))
function toggleFav(row) {
  const nowFav = toggleCollect('expert', row)
  collects.value = getCollects('expert')
  toast(nowFav ? '已加入收藏' : '已取消收藏')
}
function removeFav(id) {
  removeCollect('expert', id)
  collects.value = getCollects('expert')
  toast('已取消收藏')
}

/* ---------------- 导出 ---------------- */
async function exportRows(rows) {
  if (!rows.length) return
  if (rows.length > EXPORT_LIMIT.expert) {
    warn(`单次导出上限为 ${EXPORT_LIMIT.expert} 条，当前已选 ${rows.length} 条，请分批导出`)
    return
  }
  exporting.value = true
  try {
    const v = DATA_VERSIONS.expert
    const head = [
      [`${v.stdName} 查询结果`],
      ['标准名称', v.stdName],
      ['文号', v.docNo],
      ['发布机关', v.publisher],
      ['导出时间', fmtDateTime(new Date().toISOString())],
      ['导出条数', `${rows.length} 条`],
      [],
    ]
    const tableHead = [['专业代码', '一级（大类）', '二级', '三级（专业）', '四级（具体方向）']]
    const body = rows.map((r) => [r.code, r.n1, r.n2, r.n3, r.n4])
    const tail = [
      [],
      ['免责声明', '本工具内置固定版本政策标准数据，仅供工作参考，不构成专业法律意见；具体专业划分以当地综合评标专家库为准。'],
      ['数据说明', '用户所有输入数据保存在浏览器本地，服务器不会留存任何业务数据。'],
    ]

    await exportWorkbook(timestamped('评标专家专业分类查询'), [
      { name: '查询结果', aoa: [...head, ...tableHead, ...body, ...tail], cols: [16, 14, 22, 30, 34] },
    ])
    success(`已导出 ${rows.length} 条`)
  } catch (e) {
    error('导出失败：' + (e && e.message ? e.message : '未知错误'))
  } finally {
    exporting.value = false
  }
}

function addSelectedToCart() {
  if (!cartItems.value.length) {
    warn('请先勾选需要导出的分类条目')
    return
  }
  toast(`已加入待导出列表（${cartItems.value.length} 条）`)
  tab.value = 'cart'
}
</script>

<template>
  <div>
    <!-- 筛选区 -->
    <section class="card mb-16">
      <div class="card-head">
        <div class="card-title">筛选检索</div>
        <button class="btn btn-sm" @click="resetFilter">重置条件</button>
      </div>
      <div class="card-body">
        <div class="filter-grid">
          <div class="field mb-0">
            <label class="field-label" for="e-kw">关键词（代码 / 专业名称）</label>
            <input id="e-kw" v-model="keyword" class="input" type="search" placeholder="例如：造价、A0501、市政" />
          </div>
          <div class="field mb-0">
            <label class="field-label" for="e-lv1">一级（大类）</label>
            <select id="e-lv1" v-model="lv1" class="input">
              <option value="">全部大类</option>
              <option v-for="o in lv1List" :key="o.code" :value="o.name">{{ o.code }} · {{ o.name }}</option>
            </select>
          </div>
          <div class="field mb-0">
            <label class="field-label" for="e-lv2">二级</label>
            <select id="e-lv2" v-model="lv2" class="input" :disabled="!lv1">
              <option value="">{{ lv1 ? '全部' : '请先选择大类' }}</option>
              <option v-for="o in lv2List" :key="o.code" :value="o.name">{{ o.code }} · {{ o.name }}</option>
            </select>
          </div>
          <div class="field mb-0">
            <label class="field-label" for="e-lv3">三级（专业）</label>
            <select id="e-lv3" v-model="lv3" class="input" :disabled="!lv2">
              <option value="">{{ lv2 ? '全部' : '请先选择二级' }}</option>
              <option v-for="o in lv3List" :key="o.code" :value="o.name">{{ o.code }} · {{ o.name }}</option>
            </select>
          </div>
        </div>
        <div class="row mt-16 text-sm text-muted">
          <span>命中 <b class="mono">{{ totalRows }}</b> 条</span>
          <span>·</span>
          <span>已勾选 <b class="mono">{{ selected.size }}</b> 条</span>
          <span>·</span>
          <span>收藏 <b class="mono">{{ collects.length }}</b> 条</span>
          <span>·</span>
          <span>单次导出上限 {{ EXPORT_LIMIT.expert }} 条</span>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div class="seg">
          <button class="seg-item" :class="{ 'is-active': tab === 'result' }" @click="tab = 'result'">查询结果</button>
          <button class="seg-item" :class="{ 'is-active': tab === 'cart' }" @click="tab = 'cart'">
            待导出列表<span v-if="cartItems.length" class="badge" style="margin-left: 6px">{{ cartItems.length }}</span>
          </button>
          <button class="seg-item" :class="{ 'is-active': tab === 'collect' }" @click="tab = 'collect'">
            我的收藏<span v-if="collects.length" class="badge" style="margin-left: 6px">{{ collects.length }}</span>
          </button>
        </div>
        <div class="row no-print">
          <button class="btn btn-sm" :disabled="!cartItems.length" @click="addSelectedToCart">加入待导出</button>
          <button class="btn btn-sm btn-primary" :disabled="!cartItems.length || exporting" @click="exportRows(cartItems)">
            <AppIcon name="download" :size="15" />
            {{ exporting ? '导出中…' : '导出 Excel' }}
          </button>
        </div>
      </div>

      <!-- 查询结果 -->
      <div v-if="tab === 'result'">
        <div v-if="loading" class="empty">专家分类数据加载中…</div>
        <div v-else-if="!totalRows" class="empty">
          <div class="empty-icon">○</div>
          未找到匹配的专业分类，请调整关键词或筛选条件
        </div>
        <template v-else>
          <div class="table-wrap" style="border: none; border-radius: 0; max-height: 60vh">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 40px">
                    <input class="checkbox" type="checkbox" :checked="allPageSelected" :aria-label="allPageSelected ? '取消全选本页' : '全选本页'" @change="togglePageAll" />
                  </th>
                  <th style="width: 40px" class="no-print"></th>
                  <th style="width: 110px">专业代码</th>
                  <th>一级（大类）</th>
                  <th>二级</th>
                  <th>三级（专业）</th>
                  <th>四级（具体方向）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in pagedRows" :key="r.id" :class="{ 'is-selected': selected.has(r.id) }">
                  <td>
                    <input class="checkbox" type="checkbox" :checked="selected.has(r.id)" :aria-label="`选择 ${r.n4 || r.n3}`" @change="toggleRow(r.id)" />
                  </td>
                  <td class="no-print">
                    <button
                      class="btn btn-sm btn-icon"
                      :style="{ color: collectIds.has(r.id) ? 'var(--warning)' : 'var(--muted-foreground)' }"
                      :title="collectIds.has(r.id) ? '取消收藏' : '收藏该条目'"
                      @click="toggleFav(r)"
                    >
                      <AppIcon name="star" :size="15" />
                    </button>
                  </td>
                  <td class="mono">{{ r.code }}</td>
                  <td>{{ r.n1 }}</td>
                  <td>{{ r.n2 }}</td>
                  <td>{{ r.n3 }}</td>
                  <td>{{ r.n4 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pager no-print">
            <button class="btn btn-sm" :disabled="page <= 1" @click="page--">上一页</button>
            <span class="text-sm text-muted">第 {{ page }} / {{ totalPages }} 页</span>
            <button class="btn btn-sm" :disabled="page >= totalPages" @click="page++">下一页</button>
          </div>
        </template>
      </div>

      <!-- 待导出 -->
      <div v-else-if="tab === 'cart'">
        <div v-if="!cartItems.length" class="empty">
          <div class="empty-icon">○</div>
          待导出列表为空，请在「查询结果」中勾选条目后加入
        </div>
        <template v-else>
          <div class="cart-head no-print">
            <span class="text-sm text-muted">共 {{ cartItems.length }} 条，导出上限 {{ EXPORT_LIMIT.expert }} 条</span>
            <button class="btn btn-sm btn-danger" @click="clearSelected">清空列表</button>
          </div>
          <div class="table-wrap" style="border: none; border-radius: 0; max-height: 60vh">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 40px" class="no-print"></th>
                  <th style="width: 110px">专业代码</th>
                  <th>一级（大类）</th>
                  <th>二级</th>
                  <th>三级（专业）</th>
                  <th>四级（具体方向）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in cartItems" :key="r.id">
                  <td class="no-print">
                    <button class="btn btn-sm btn-icon" title="移出待导出列表" @click="toggleRow(r.id)">
                      <AppIcon name="close" :size="14" />
                    </button>
                  </td>
                  <td class="mono">{{ r.code }}</td>
                  <td>{{ r.n1 }}</td>
                  <td>{{ r.n2 }}</td>
                  <td>{{ r.n3 }}</td>
                  <td>{{ r.n4 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- 收藏 -->
      <div v-else>
        <div v-if="!collects.length" class="empty">
          <div class="empty-icon">○</div>
          暂无收藏条目，可在查询结果中点击星标添加
        </div>
        <template v-else>
          <div class="cart-head no-print">
            <span class="text-sm text-muted">收藏保存在浏览器本地，共 {{ collects.length }} 条</span>
            <button class="btn btn-sm btn-primary" :disabled="exporting" @click="exportRows(collects)">
              <AppIcon name="download" :size="15" />
              导出收藏
            </button>
          </div>
          <div class="table-wrap" style="border: none; border-radius: 0; max-height: 60vh">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 40px" class="no-print"></th>
                  <th style="width: 110px">专业代码</th>
                  <th>一级（大类）</th>
                  <th>二级</th>
                  <th>三级（专业）</th>
                  <th>四级（具体方向）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in collects" :key="c.id">
                  <td class="no-print">
                    <button class="btn btn-sm btn-icon" title="取消收藏" @click="removeFav(c.id)">
                      <AppIcon name="trash" :size="14" />
                    </button>
                  </td>
                  <td class="mono">{{ c.code }}</td>
                  <td>{{ c.n1 }}</td>
                  <td>{{ c.n2 }}</td>
                  <td>{{ c.n3 }}</td>
                  <td>{{ c.n4 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </section>

    <p class="text-sm text-muted mt-16">
      数据版本：{{ DATA_VERSIONS.expert.stdName }} · {{ DATA_VERSIONS.expert.docNo }}。层级为一级（大类）→ 二级 → 三级（专业）→ 四级（具体方向），具体专业划分以当地综合评标专家库为准。
    </p>
  </div>
</template>

<style scoped>
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid var(--border);
}
.cart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--muted);
}
</style>
