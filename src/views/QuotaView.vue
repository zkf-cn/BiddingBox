<script setup>
/**
 * 工期定额查询模块 —— 完全照搬自桌面版查询系统模板（仅做主题适配）
 *
 * 布局结构（无顶部横幅，颜色随项目主题变量切换）：
 *   .app (grid: 340px | 6px | 1fr)
 *   ├─ .col-l (grid: 1fr | 6px | minmax(140px,auto) | auto)
 *   │   ├─ 左上 定额列表（树）
 *   │   ├─ 左下 相关说明
 *   │   └─ 作者信息
 *   ├─ .gutter-v
 *   └─ .col-r (grid: auto | 1fr | 6px | minmax(150px,30%))
 *       ├─ 右上 查询定额（搜索栏）
 *       ├─ 右中 查询内容（结果表）
 *       └─ 右下 统计列表
 *
 * 数据源：src/data/quota.json（建筑安装工程工期定额 TY01-89-2016）
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { loadQuota } from '@/data'
import AppSelect from '@/components/AppSelect.vue'
import { useToast } from '@/composables/useToast'

const { toast } = useToast()

/* ---------------- 数据加载 ---------------- */
const loading = ref(true)
const data = ref(null)
const pagesById = ref({})

onMounted(async () => {
  try {
    data.value = await loadQuota()
    pagesById.value = {}
    ;(data.value.pages || []).forEach(p => { pagesById.value[p.id] = p })
    // 默认展开第一部分（与参考网页一致：首个顶层目录自动展开）
    if (data.value.tree && data.value.tree[0]) {
      openDirs.value = new Set([data.value.tree[0].name])
    }
  } catch (e) {
    toast('定额数据加载失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
  isMobile.value = !!(window.matchMedia && window.matchMedia('(max-width:820px)').matches)
  collapsedSearch.value = isMobile.value
})

/* ---------------- 顶层部分（下拉框） ---------------- */
const parts = computed(() => (data.value ? (data.value.tree || []).map(t => t.name) : []))
/* 下拉选项：Vben 风格 AppSelect 使用 { label, value } 结构 */
const partOptions = computed(() => [
  { label: '全部部分', value: '' },
  ...parts.value.map((p) => ({ label: p, value: p })),
])

const treeCountText = computed(() => {
  if (!data.value) return ''
  const total = (data.value.pages || []).reduce((s, p) => s + (p.items ? p.items.length : 0), 0)
  return `${(data.value.pages || []).length} 个定额表 / ${total} 条定额`
})
const versionText = '1.4.2'

/* ---------------- 左上：定额树 ---------------- */
const openDirs = ref(new Set())
const activePageId = ref(null)

function nodeId(n, part) {
  return n.pageId || (part ? part + '|' + n.name : n.name)
}

function countItems(node) {
  if (node.type === 'page') {
    const p = pagesById.value[node.pageId]
    return p ? p.items.length : 0
  }
  if (node.type === 'dir') {
    return (node.children || []).reduce((s, c) => s + countItems(c), 0)
  }
  return 0
}

const treeNodes = computed(() => {
  if (!data.value) return []
  const out = []
  const walk = (ns, d, part, ancOpen) => {
    ns.forEach(n => {
      const isDir = n.type === 'dir'
      const id = nodeId(n, part)
      const open = openDirs.value.has(id)
      out.push({
        id,
        name: n.name,
        type: n.type,
        isDir,
        pageId: n.pageId,
        count: countItems(n),
        depth: d,
        visible: ancOpen,
        open,
        partName: d === 0 ? n.name : part,
      })
      if (isDir) walk(n.children || [], d + 1, part, ancOpen && open)
    })
  }
  walk(data.value.tree || [], 0, '', true)
  return out
})

function toggleDir(node) {
  const s = new Set(openDirs.value)
  if (s.has(node.id)) s.delete(node.id)
  else s.add(node.id)
  openDirs.value = s
}

function onTreeClick(node) {
  if (node.isDir) {
    toggleDir(node)
  } else if (node.pageId) {
    activePageId.value = node.pageId
    renderPage(node.pageId)
    if (isMobile.value) activate('search')
  }
}

/* ---------------- 左下：相关说明 ---------------- */
const notesList = computed(() => {
  if (!data.value || !data.value.notes) return []
  const notes = data.value.notes
  const order = ['notice', 'root'].concat(Object.keys(notes).filter(k => k !== 'root' && k !== 'notice'))
  const nameOf = k =>
    k === 'root' ? '总说明'
      : k === 'notice' ? '住房城乡建设部关于印发《建筑安装工程工期定额》的通知'
        : k.replace(/第(.)部分\s*/, '第$1部分·').replace(/\s+/g, '') + '说明'
  return order.filter(k => notes[k]).map(k => ({ key: k, title: nameOf(k), html: notes[k].html || '' }))
})

const noteModalOpen = ref(false)
const noteModalTitle = ref('')
const noteModalDoc = ref('')
function openNote(note) {
  noteModalTitle.value = note.title
  noteModalDoc.value = note.html
  noteModalOpen.value = true
}

/* ---------------- 右上：查询组件 ---------------- */
const keyword = ref('')
const partId = ref('')
const resInfo = ref('')

const MAX_ROWS = 500
function search() {
  const q = keyword.value.trim()
  const part = partId.value
  if (!q) {
    groups.value = []
    resTerms.value = []
    resInfo.value = ''
    return
  }
  const terms = q.split(/\s+/).filter(Boolean).map(t => t.toLowerCase())
  const isCode = terms.length === 1 && /^\d+-\d+$/.test(terms[0])
  const out = []
  let total = 0
  let shown = 0
  const pages = data.value ? data.value.pages : []
  for (const p of pages) {
    if (part && ((p.path && p.path[0]) || '') !== part) continue
    const pageText = ((p.path || []).join('/') + '/' + p.title).toLowerCase()
    const idxs = []
    ;(p.items || []).forEach((it, i) => {
      let ok
      if (isCode) ok = it[0] === terms[0]
      else if (terms.length === 0) ok = true
      else {
        const rowText = it.join('|').toLowerCase()
        ok = terms.every(t => rowText.includes(t) || pageText.includes(t))
      }
      if (ok) {
        total++
        if (shown < MAX_ROWS) { idxs.push(i); shown++ }
      }
    })
    if (idxs.length) out.push({ page: p, idxs })
  }
  groups.value = out
  resTerms.value = terms
  resInfo.value = total ? `命中 ${total} 条${total > MAX_ROWS ? '，仅显示前 ' + MAX_ROWS + ' 条' : ''}` : '无结果'
}

function resetFilter() {
  keyword.value = ''
  partId.value = ''
  search()
}

let _debounce = null
function onInput() {
  if (_debounce) clearTimeout(_debounce)
  _debounce = setTimeout(search, 300)
}

/* ---------------- 右中：查询内容 ---------------- */
const groups = ref([])
const resTerms = ref([])

function renderPage(pid) {
  const p = pagesById.value[pid]
  if (!p) return
  groups.value = [{ page: p, idxs: p.items.map((_, i) => i) }]
  resTerms.value = []
  activePageId.value = pid
  resInfo.value = `浏览整表：${p.items.length} 条`
}

const resultGroups = computed(() =>
  groups.value.map(g => ({
    page: g.page,
    crumb: (g.page.path || []).slice(0, -1).join(' › '),
    dcs: dayCols(g.page),
    rows: g.idxs.map(i => ({ i, cells: g.page.items[i] })),
  }))
)

/* 工期列识别 */
function isDayCol(h) {
  return /^[ⅠⅡⅢⅣ、]+类土?$/.test(h) || h.startsWith('工期') || h.includes('加工期')
}
function dayCols(page) {
  const idx = []
  ;(page.headers || []).forEach((h, i) => { if (isDayCol(h)) idx.push(i) })
  return idx
}

function esc(s) {
  return String(s)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    .replace(/m3/g, 'm<sup>3</sup>')
}
function hl(s, terms) {
  let str = esc(s)
  if (!terms || !terms.length) return str
  terms.forEach(t => {
    if (!t) return
    try {
      const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
      str = str.replace(re, '<mark>$1</mark>')
    } catch (e) { /* ignore */ }
  })
  return str
}

/* ---------------- 右下：统计列表 ---------------- */
const stats = ref([]) // [{ pid, idx, sel }]

function isInStats(pid, idx) {
  return stats.value.some(s => s.pid === pid && s.idx === idx)
}
function addStat(pid, idx) {
  if (isInStats(pid, idx)) return
  const p = pagesById.value[pid]
  if (!p) return
  const dcs = dayCols(p)
  let sel = dcs.length ? dcs[0] : -1
  for (const c of dcs) {
    const v = parseFloat(p.items[idx][c])
    if (!isNaN(v)) { sel = c; break }
  }
  stats.value = [...stats.value, { pid, idx, sel }]
}
function removeStat(si) {
  const ns = stats.value.slice()
  ns.splice(si, 1)
  stats.value = ns
}
function onSelChange(si, val) {
  const ns = stats.value.slice()
  ns[si] = { ...ns[si], sel: val }
  stats.value = ns
}
function clearStats() {
  if (!stats.value.length) return
  if (window.confirm('确定清空统计列表？')) stats.value = []
}

const statsRows = computed(() =>
  stats.value.map((s, si) => {
    const p = pagesById.value[s.pid]
    if (!p) return null
    const it = p.items[s.idx]
    if (!it) return null
    const dcs = dayCols(p)
    const val = s.sel >= 0 ? parseFloat(it[s.sel]) : NaN
    return { si, pid: s.pid, idx: s.idx, sel: s.sel, it, dcs, val, p }
  }).filter(Boolean)
)

const totalDays = computed(() => {
  let sum = 0
  stats.value.forEach(st => {
    const p = pagesById.value[st.pid]
    if (!p) return
    const it = p.items[st.idx]
    if (!it) return
    if (st.sel >= 0) {
      const v = parseFloat(it[st.sel])
      if (!isNaN(v)) sum += v
    }
  })
  return Math.round(sum)
})

function pathHtml(p) {
  const segs = (p.path && p.path.length) ? p.path : [p.title]
  if (segs.length <= 1) return `<b>${esc(segs[0])}</b>`
  const lead = segs.slice(0, -1).map(s => esc(s)).join(' › ')
  return `<span style="color:var(--muted-foreground);font-size:12px">${lead} › </span><b>${esc(segs[segs.length - 1])}</b>`
}
function paramSummaryHtml(p, it) {
  const dcs = dayCols(p)
  const parts = []
  ;(p.headers || []).forEach((h, i) => {
    if (i === 0 || dcs.includes(i) || h === '备注') return
    if (it[i] && it[i] !== '—') parts.push(`<b style="color:var(--primary)">${esc(h)}</b>：${esc(it[i])}`)
  })
  return parts.join('；')
}
function paramSummary(p, it) {
  const dcs = dayCols(p)
  const parts = []
  ;(p.headers || []).forEach((h, i) => {
    if (i === 0 || dcs.includes(i) || h === '备注') return
    if (it[i] && it[i] !== '—') parts.push(h + '：' + it[i])
  })
  return parts.join('；')
}

function exportCsv() {
  if (!stats.value.length) { toast('统计列表为空'); return }
  const rows = [['编号', '定额项目', '规格/参数', '类别', '工期(天)']]
  let total = 0
  stats.value.forEach(s => {
    const p = pagesById.value[s.pid]
    const it = p ? p.items[s.idx] : null
    if (!it) return
    const val = s.sel >= 0 ? it[s.sel] : ''
    const n = parseFloat(val)
    if (!isNaN(n)) total += n
    rows.push([it[0], (p.path || []).join(' › '), paramSummary(p, it), s.sel >= 0 ? p.headers[s.sel] : '', val])
  })
  rows.push(['', '', '', '合计', String(Math.round(total))])
  const csv = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = '工期定额统计列表.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  toast('已导出 CSV')
}

/* ---------------- 面板折叠（查询定额 + 相关说明 面板有折叠按钮） ---------------- */
const isMobile = ref(false)
const collapsedSearch = ref(false)
function toggleSearch() { collapsedSearch.value = !collapsedSearch.value }
const collapsedNotes = ref(false)
function toggleNotes() { collapsedNotes.value = !collapsedNotes.value }

/* ---------------- 移动端面板切换 ---------------- */
const activePanel = ref('tree')
function activate(mv) { activePanel.value = mv }
</script>

<template>
  <div class="quota-view">
    <div class="app" :class="'m-' + activePanel">
      <!-- ═══════ 左列 ═══════ -->
      <div class="col-l">
        <!-- 左上：定额列表 -->
        <div class="panel" data-mview="tree">
          <div class="card-head"><span class="card-title">定额列表</span> <span class="sub">{{ treeCountText }}</span></div>
          <div class="panel-bd">
            <div v-if="loading" class="empty">数据加载中…</div>
            <div v-else class="tree">
              <template v-for="node in treeNodes" :key="node.id">
                <div
                  v-if="node.visible"
                  class="tlabel"
                  :class="{ open: node.open, active: node.pageId && node.pageId === activePageId, leaf: !node.isDir }"
                  :style="{ paddingLeft: (node.depth * 14 + 6) + 'px' }"
                  @click="onTreeClick(node)"
                >
                  <span class="caret">▶</span>
                  <span class="ico">{{ node.isDir ? '📁' : '📑' }}</span>
                  <span>{{ node.name }}</span>
                  <span class="tcount">（{{ node.count }}）</span>
                </div>
              </template>
              <div v-if="!treeNodes.length && !loading" class="empty">暂无定额数据</div>
            </div>
          </div>
        </div>

        <div class="gutter-h"></div>

        <!-- 左下：相关说明 -->
        <div class="panel" data-mview="notes" :class="{ collapsed: collapsedNotes }">
          <div class="card-head"><span class="card-title">相关说明</span> <span class="sub" v-show="!collapsedNotes">点击条目查看</span>
            <button class="toggle-btn" type="button" @click.stop="toggleNotes" v-tooltip:left="collapsedNotes ? '展开' : '收起'">
              <svg v-if="!collapsedNotes" viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M524.48 408.11l315.3 315.3c28.96 28.96 75.92 28.96 104.89 0 9.02-9.02 9.02-23.66 0-32.68L541.29 287.36c-16.06-16.06-42.11-16.06-58.17 0L79.74 690.73c-9.02 9.02-9.02 23.66 0 32.68 28.96 28.96 75.92 28.96 104.89 0l315.3-315.3c6.78-6.77 17.77-6.77 24.55 0z"/></svg>
              <svg v-else viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M524.48 615.56l315.3-315.3c28.96-28.96 75.92-28.96 104.89 0 9.02 9.02 9.02 23.66 0 32.68L541.29 736.32c-16.06 16.06-42.11 16.06-58.17 0L79.74 332.94c-9.02-9.02-9.02-23.66 0-32.68 28.96-28.96 75.92-28.96 104.89 0l315.3 315.3c6.78 6.78 17.77 6.78 24.55 0z"/></svg>
            </button>
          </div>
          <div class="panel-bd">
            <ul class="note-list">
              <li v-for="note in notesList" :key="note.key" @click="openNote(note)">
                <span class="dot"></span>
                <span>{{ note.title }}</span>
                <span class="go">查看 ›</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 作者信息已移除 -->
      </div>

      <div class="gutter-v"></div>

      <!-- ═══════ 右列 ═══════ -->
      <div class="col-r">
        <!-- 右上：查询定额 -->
        <div class="panel q-panel" :class="{ collapsed: collapsedSearch }" data-mview="search" style="margin-bottom:0">
          <div class="card-head"><span class="card-title">查询定额</span>
            <button class="toggle-btn" type="button" @click.stop="toggleSearch" v-tooltip:left="collapsedSearch ? '展开' : '收起'">
              <!-- 收起态（面板展开，点击收起）：上三角 -->
              <svg v-if="!collapsedSearch" viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M524.48 408.11l315.3 315.3c28.96 28.96 75.92 28.96 104.89 0 9.02-9.02 9.02-23.66 0-32.68L541.29 287.36c-16.06-16.06-42.11-16.06-58.17 0L79.74 690.73c-9.02 9.02-9.02 23.66 0 32.68 28.96 28.96 75.92 28.96 104.89 0l315.3-315.3c6.78-6.77 17.77-6.77 24.55 0z"/></svg>
              <!-- 展开态（面板已收起，点击展开）：下三角 -->
              <svg v-else viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor"><path d="M524.48 615.56l315.3-315.3c28.96-28.96 75.92-28.96 104.89 0 9.02 9.02 9.02 23.66 0 32.68L541.29 736.32c-16.06 16.06-42.11 16.06-58.17 0L79.74 332.94c-9.02-9.02-9.02-23.66 0-32.68 28.96-28.96 75.92-28.96 104.89 0l315.3 315.3c6.78 6.78 17.77 6.78 24.55 0z"/></svg>
            </button>
          </div>
          <div class="panel-bd">
            <div class="searchbar">
              <input
                type="text"
                v-model="keyword"
                @input="onInput"
                @keydown.enter="search"
                placeholder="输入定额编号（如 1-15）或关键词（如 剪力墙 5000 / 地下室 2层），空格分隔多条件…"
              >
              <AppSelect
                v-model="partId"
                class="sb-select"
                :options="partOptions"
                size="form"
                placeholder="全部部分"
                @change="search"
              />
              <button class="btn btn-primary" @click="search">查 询</button>
              <button class="btn" @click="resetFilter">重置</button>
              <div class="hint">支持多关键词组合（空格=且）；输入编号可精确定位；点击左侧目录可浏览整表；点击行末 <b style="color:var(--c-accent)">＋</b> 将该条加入下方统计列表</div>
            </div>
          </div>
        </div>

        <!-- 右中：查询内容 -->
        <div class="panel r-panel" data-mview="search" style="margin-top:16px">
          <div class="card-head"><span class="card-title">查询内容</span> <span class="sub">{{ resInfo }}</span></div>
          <div class="panel-bd">
            <div v-if="loading" class="empty">定额数据加载中…</div>
            <div v-else-if="!resultGroups.length" class="empty">
              <template v-if="!keyword.trim()">输入关键词查询，或从左侧<b>定额列表</b>选择章节浏览完整定额表</template>
              <template v-else>未找到匹配的定额条目，请调整关键词</template>
            </div>
            <div v-else class="results">
              <div class="group" v-for="(g, gi) in resultGroups" :key="gi">
                <div class="group-title">{{ g.page.title }} <span class="crumb">（{{ g.crumb }}）</span></div>
                <table class="qt">
                  <thead>
                  <tr>
                    <th scope="col" v-for="(h, hi) in g.page.headers" :key="hi">{{ h }}</th>
                    <th scope="col" style="width:34px">统计</th>
                  </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in g.rows" :key="row.i">
                      <td
                        v-for="(cell, ci) in row.cells"
                        :key="ci"
                        :class="ci === 0 ? 'code' : (g.dcs.includes(ci) ? 'day' : '')"
                        v-html="hl(cell, resTerms)"
                      ></td>
                      <td>
                        <button
                          class="addbtn"
                          :class="{ added: isInStats(g.page.id, row.i) }"
                          @click="addStat(g.page.id, row.i)"
                        >{{ isInStats(g.page.id, row.i) ? '✓' : '＋' }}</button>
                      </td>
                    </tr>
                    <tr v-if="g.page.note" class="qt-note">
                      <td :colspan="g.page.headers.length + 1">📌 {{ g.page.note }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="gutter-h"></div>

        <!-- 右下：统计列表 -->
        <div class="panel" data-mview="stats">
          <div class="card-head"><span class="card-title">统计列表</span> <span class="sub">{{ stats.length ? stats.length + ' 条' : '' }}</span></div>
          <div class="panel-bd">
            <div v-if="!statsRows.length" class="empty">暂无统计条目——在上方查询结果中点击 <b style="color:var(--c-accent)">＋</b> 添加</div>
            <div v-else class="stats-wrap">
              <table class="st">
                <thead>
                  <tr>
                    <th scope="col" style="width:70px">编号</th>
                    <th scope="col">定额项目</th>
                    <th scope="col">规格/参数</th>
                    <th scope="col" style="width:150px">类别选择</th>
                    <th scope="col" style="width:70px">工期(天)</th>
                    <th scope="col" style="width:48px;white-space:nowrap">删除</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in statsRows" :key="s.pid + '-' + s.idx">
                    <td class="code">{{ s.it[0] }}</td>
                    <td style="text-align:left" v-html="pathHtml(s.p)"></td>
                    <td style="text-align:left" v-html="paramSummaryHtml(s.p, s.it)"></td>
                    <td>
                      <AppSelect
                        v-if="s.dcs.length"
                        class="st-select"
                        size="sm"
                        :model-value="s.sel >= 0 ? s.sel : ''"
                        :options="s.dcs.map((c) => ({ label: `${s.p.headers[c]}（${s.it[c]}）`, value: c }))"
                        placeholder="请选择"
                        @change="onSelChange(s.si, +$event)"
                      />
                      <span v-else style="color:var(--c-muted)">—</span>
                    </td>
                    <td class="days">{{ isNaN(s.val) ? (s.sel >= 0 ? s.it[s.sel] : '—') : s.val }}</td>
                    <td><button class="st-del" @click="removeStat(s.si)" title="移除">✕</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="stats-foot" v-if="statsRows.length">
            <span class="st-btns">
              <button class="btn btn-sm btn-danger" @click="clearStats">清空</button>
              <button class="btn btn-sm" @click="exportCsv">导出CSV</button>
            </span>
            <span class="st-hint">每条可单独选择地区/土壤类别列</span>
            <span class="total">合计工期：<b>{{ totalDays }}</b> 天</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 说明弹窗 ═══════ -->
    <div class="modal-mask" v-if="noteModalOpen" @click.self="noteModalOpen = false">
      <div class="modal">
        <div class="modal-hd">
          <span>{{ noteModalTitle }}</span>
          <button class="modal-x" @click="noteModalOpen = false" title="关闭">✕</button>
        </div>
        <div class="modal-bd"><div class="note-doc" v-html="noteModalDoc"></div></div>
      </div>
    </div>

    <!-- ═══════ 移动端底部标签栏 ═══════ -->
    <nav class="mtabs">
      <button :class="{ active: activePanel === 'tree' }" @click="activate('tree')">
        <span class="ico">📚</span><span>目录</span>
      </button>
      <button :class="{ active: activePanel === 'search' }" @click="activate('search')">
        <span class="ico">🔍</span><span>查询</span>
      </button>
      <button :class="{ active: activePanel === 'stats' }" @click="activate('stats')">
        <span class="ico">🧮</span><span>统计</span>
      </button>
      <button :class="{ active: activePanel === 'notes' }" @click="activate('notes')">
        <span class="ico">📄</span><span>说明</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* ═══════ 主题适配别名（仅替换颜色，布局照搬参考网页） ═══════ */
.quota-view {
  --c-blue: var(--primary);
  --c-blue-l: var(--primary-soft);
  --c-blue-strong: var(--primary-strong);
  --c-hdr: var(--table-head-bg);
  --c-bd: var(--border);
  --c-bd-strong: var(--border-strong);
  --c-bg: var(--background-deep);
  --c-bg-elev: var(--card);
  --c-txt: var(--foreground);
  --c-sub: var(--muted-foreground);
  --c-muted: var(--muted-foreground);
  --c-accent: var(--success);
  --c-accent-soft: var(--success-soft);
  --c-warn: var(--warning);
  --c-danger: var(--destructive);
  --c-sunken: var(--bg-sunken);

  /* 绝对定位填满内容区（父级 .app-content-inner 有 24px padding，
     inset:24px 正好对齐其 content box；不参与内容流高度计算，
     四象限固定在视口内、四周留出 24px 间距） */
  position: absolute;
  top: 24px;
  right: 24px;
  bottom: 24px;
  left: 24px;
  overflow: hidden;
}
* { box-sizing: border-box; }

/* ═══════ 整体网格（照搬参考：340px | 6px | 1fr） ═══════ */
.app {
  display: grid;
  grid-template-columns: 340px 16px 1fr;
  grid-template-rows: 1fr;
  gap: 0;
  height: 100%;
  min-height: 0;
  padding: 0;
}
.col-l {
  display: grid;
  grid-template-rows: 1fr 16px auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
}
.col-r {
  display: grid;
  grid-template-rows: auto 1fr 16px minmax(150px, 30%);
  min-width: 0;
  min-height: 0;
}
.gutter-v { cursor: col-resize; background: transparent; }
.gutter-h { cursor: row-resize; background: transparent; }

/* ═══════ 面板通用 ═══════ */
.panel {
  background: var(--c-bg-elev);
  border: 1px solid var(--c-bd);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.card-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--c-bd);
  position: relative;
}
.card-head .card-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14.5px;
  font-weight: 650;
  color: var(--c-txt);
}
.card-head .card-title::before {
  content: '';
  width: 3px;
  height: 15px;
  border-radius: 2px;
  background: var(--brand-gradient);
  flex-shrink: 0;
}
.card-head .sub {
  font-weight: normal;
  color: var(--c-muted);
  font-size: 12px;
  margin-left: auto;
}
.panel-bd { flex: 1; overflow: auto; min-height: 0; }

/* 作者信息卡片已移除 */

/* ═══════ 左上：定额列表树 ═══════ */
.tree { padding: 6px 4px 20px; }
.tnode { user-select: none; }
.tlabel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  line-height: 1.5;
  color: var(--c-sub);
  font-size: 12.5px;
}
.tlabel:hover { background: var(--c-blue-l); }
.tlabel.active { background: var(--c-blue); color: #fff; }
.tlabel .caret {
  flex: none;
  width: 12px;
  font-size: 10px;
  color: var(--c-muted);
  transition: transform .15s;
}
.tlabel.open .caret { transform: rotate(90deg); }
.tlabel.leaf .caret { visibility: hidden; }
.tlabel .ico { flex: none; font-size: 12px; }
.tlabel .tcount { color: var(--c-muted); font-size: 12px; margin-left: 2px; font-weight: normal; }

/* ═══════ 左下：相关说明 ═══════ */
.note-list { list-style: none; padding: 6px 4px; margin: 0; }
.note-list li {
  padding: 9px 12px;
  margin: 4px 8px;
  border: 1px solid var(--c-bd);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: var(--c-bg-elev);
  font-size: 13px;
  color: var(--c-sub);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all .15s;
}
.note-list li:hover { background: var(--c-blue-l); border-color: var(--c-blue); transform: translateX(2px); }
.note-list li .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c-blue); flex: none; }
.note-list li > span:nth-child(2) { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-list li .go { margin-left: auto; color: var(--c-muted); font-size: 12px; white-space: nowrap; flex: none; }

/* ═══════ 右上：查询组件 ═══════ */
.searchbar { padding: 10px 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.searchbar input[type=text] {
  flex: 1;
  min-width: 200px;
  padding: 7px 12px;
  border: 1px solid var(--c-bd);
  border-radius: var(--radius-sm);
  font-size: 13px;
  outline: none;
  background: var(--c-bg-elev);
  color: var(--c-txt);
}
.searchbar input[type=text]:focus { border-color: var(--c-blue); box-shadow: 0 0 0 2px var(--c-blue-l); }
.searchbar select {
  padding: 7px 8px;
  border: 1px solid var(--c-bd);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--c-bg-elev);
  color: var(--c-txt);
  outline: none;
  flex: 0 0 auto;
}
/* Vben 下拉框（组件根为 div，需显式约束宽度以对齐原原生 select 的布局） */
.searchbar .sb-select { flex: 0 1 auto; width: auto; min-width: 150px; max-width: 280px; }
table.st .st-select { width: auto; min-width: 120px; max-width: 240px; }
/* 按钮样式使用全局 base.css，不再局部覆盖 */
.hint { width: 100%; font-size: 12px; color: var(--c-muted); line-height: 1.5; }

/* ═══════ 右中：查询内容 ═══════ */
.results { padding: 6px 10px 4px; }
.group { margin-bottom: 10px; }
.group-title { font-weight: bold; color: var(--c-blue); padding: 4px 2px; font-size: 13px; }
.group-title .crumb { color: var(--c-muted); font-weight: normal; font-size: 12px; }
table.qt { border-collapse: collapse; width: 100%; background: var(--c-bg-elev); }
table.qt th { background: var(--c-hdr); border: 1px solid var(--c-bd-strong); padding: 5px 6px; font-size: 12px; font-weight: 600; color: var(--c-txt); }
table.qt td { border: 1px solid var(--c-bd); padding: 4px 6px; text-align: center; font-size: 12.5px; color: var(--c-txt); }
table.qt tr:hover td { background: var(--table-row-hover); }
table.qt td.code { font-weight: bold; color: var(--c-blue); white-space: nowrap; }
table.qt td.day { font-weight: bold; color: var(--c-warn); }
.qt :deep(mark) { background: var(--mark-bg); color: var(--mark-text); padding: 0 1px; border-radius: 2px; }
table.qt tr.qt-note td { background: var(--warning-soft); color: var(--warning); font-style: italic; text-align: left; padding: 6px 8px; border-color: var(--border-strong); }
.addbtn {
  width: 26px;
  height: 22px;
  border: 1px solid var(--c-accent);
  background: var(--c-accent-soft);
  color: var(--c-accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
}
.addbtn:hover { background: var(--c-accent); color: #fff; }
.addbtn.added { background: var(--bg-sunken); border-color: var(--border-strong); color: var(--muted-foreground); cursor: default; }
.empty { color: var(--c-muted); text-align: center; padding: 40px 10px; font-size: 13px; }
.empty b { color: var(--c-blue); }

/* ═══════ 右下：统计列表 ═══════ */
.stats-wrap { display: flex; flex-direction: column; height: 100%; }
table.st { border-collapse: collapse; width: 100%; }
table.st th { background: var(--c-hdr); border: 1px solid var(--c-bd); padding: 4px 6px; font-size: 12px; color: var(--c-txt); position: sticky; top: 0; }
table.st td { border: 1px solid var(--c-bd); padding: 3px 6px; text-align: center; font-size: 12.5px; color: var(--c-txt); }
table.st td.code { font-weight: bold; color: var(--c-blue); white-space: nowrap; }
table.st td.days { font-weight: bold; color: var(--c-warn); }
table.st select { padding: 2px 4px; border: 1px solid var(--c-bd); border-radius: 4px; font-size: 12px; background: var(--c-bg-elev); color: var(--c-txt); }
.st-del { border: none; background: none; color: var(--c-danger); cursor: pointer; font-size: 14px; }
.stats-foot { flex: none; display: flex; align-items: center; gap: 12px; padding: 6px 12px; border-top: 1px solid var(--c-bd); background: transparent; font-size: 13px; }
.stats-foot .st-btns { display: inline-flex; gap: 8px; flex: 0 0 auto; align-items: center; }
.stats-foot .st-hint { flex: 1 1 auto; min-width: 0; color: var(--c-sub); font-size: 12px; }
.stats-foot .total { flex: 0 0 auto; margin-left: auto; font-size: 14px; white-space: nowrap; }
.stats-foot .total b { color: var(--c-warn); font-size: 18px; }

/* ═══════ 面板折叠按钮（查询定额 + 相关说明） ═══════ */
.card-head .toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 1px solid var(--c-bd);
  border-radius: var(--radius-sm);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-sub);
  transition: background .15s, color .15s, border-color .15s;
}
.card-head .toggle-btn:hover { background: var(--c-bg-elev); color: var(--c-txt); border-color: var(--c-sub); }
.panel[data-mview="search"] .card-head { padding-right: 48px; }
.panel[data-mview="notes"] .card-head { padding-right: 48px; }
.panel.collapsed > :not(.card-head) { display: none; }
.panel.collapsed {
  margin-bottom: 0;
  max-height: none;
  height: auto;
  min-height: 0;
}

/* ═══════ 说明弹窗 ═══════ */
.modal-mask { position: fixed; inset: 0; background: rgba(20, 40, 70, .45); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 24px; }
.modal { background: var(--c-bg-elev); border-radius: 10px; width: min(820px, 94vw); max-height: 88vh; display: flex; flex-direction: column; box-shadow: var(--shadow-lg); overflow: hidden; }
.modal-hd { flex: none; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--brand-gradient); color: #fff; font-weight: bold; font-size: 15px; }
.modal-x { margin-left: auto; border: none; background: rgba(255, 255, 255, .2); color: #fff; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 15px; line-height: 1; }
.modal-x:hover { background: rgba(255, 255, 255, .35); }
.modal-bd { flex: 1; overflow: auto; padding: 8px 10px; }

.note-doc { padding: 12px 16px; font-size: 13px; }
.note-doc :deep(h1) { font-size: 17px; text-align: center; margin: 10px 0 14px; color: var(--c-txt); }
.note-doc :deep(h2) { font-size: 15px; text-align: center; margin: 10px 0; color: var(--c-txt); }
.note-doc :deep(h3) { font-size: 13px; text-align: center; font-weight: 400; color: var(--c-sub); }
.note-doc :deep(p) { line-height: 180%; text-indent: 2em; margin: 5px 0; color: var(--c-txt); }
.note-doc :deep(p[align=center]) { text-indent: 0; }
.note-doc :deep(table) { border-collapse: collapse; max-width: 100% !important; width: auto !important; margin: 4px auto; table-layout: auto !important; word-break: break-all; }
.note-doc :deep(table[border="1"] td) { border: 1px solid var(--border-strong); padding: 3px 5px; font-size: 12px; line-height: 150%; }
.note-doc :deep(td) { vertical-align: top; }
.note-doc :deep(sub) { font-size: 10px; }
.note-doc :deep(img) { max-width: 100%; }

/* ═══════ 移动端底部标签栏 ═══════ */
.mtabs { display: none; position: fixed; left: 0; right: 0; bottom: 0; height: 54px; background: var(--c-bg-elev); border-top: 1px solid var(--c-bd); box-shadow: 0 -2px 10px rgba(20, 40, 70, .12); z-index: 600; padding-bottom: env(safe-area-inset-bottom); }
.mtabs button { flex: 1; border: none; background: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; color: var(--c-sub); cursor: pointer; font-size: 12px; }
.mtabs button .ico { font-size: 18px; line-height: 1; }
.mtabs button.active { color: var(--c-blue); font-weight: bold; }
.mtabs button.active .ico { transform: scale(1.12); }

/* ═══════ 移动端适配（≤820px，照搬参考） ═══════ */
@media (max-width: 820px) {
  .quota-view { position: absolute; top: 14px; right: 14px; bottom: 14px; left: 14px; display: flex; flex-direction: column; }
  .app { display: flex; flex-direction: column; flex: 1; min-height: 0; padding: 0; }
  .col-l, .col-r { display: none; height: 100%; min-height: 0; }
  .app.m-tree .col-l,
  .app.m-notes .col-l,
  .app.m-search .col-r,
  .app.m-stats .col-r { display: flex; flex-direction: column; flex: 1; min-height: 0; }
  .gutter-h, .gutter-v { display: none; }
  .panel { display: none !important; margin-bottom: 0; max-height: none; }
  .app.m-tree .panel[data-mview="tree"],
  .app.m-notes .panel[data-mview="notes"],
  .app.m-search .panel[data-mview="search"],
  .app.m-stats .panel[data-mview="stats"] { display: flex !important; flex: 1; min-height: 0; height: 100%; }
  .app.m-search .panel.q-panel { flex: 0 0 auto; height: auto; max-height: none; margin-bottom: 0; }
  .app.m-search .panel.r-panel { flex: 1; min-height: 0; height: 100%; }
  .panel-bd { overflow: auto; -webkit-overflow-scrolling: touch; }
  table.qt, table.st { min-width: 540px; width: auto; }
  .results { overflow-x: auto; }
  .searchbar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 10px; align-items: center; }
  .searchbar input[type=text] { flex: 1 1 100%; width: 100%; min-width: 0; font-size: 15px; padding: 10px 12px; }
  .searchbar select, .searchbar .sb-select { flex: 1 1 0; max-width: none; font-size: 13px; min-width: 0; width: auto; }
  .searchbar .btn { flex: 0 0 62px; min-width: 0; padding: 9px 0; font-size: 13px; }
  .hint { font-size: 12px; line-height: 1.5; }
  .addbtn { width: 32px; height: 28px; font-size: 15px; }
  .st-del { font-size: 18px; padding: 4px 8px; }
  table.st select { padding: 5px 6px; font-size: 14px; }
  table.st .st-select { min-width: 110px; max-width: 190px; }
  .stats-foot { flex-wrap: wrap; row-gap: 6px; }
  .stats-foot .total { flex: 1 1 100%; text-align: right; margin-left: 0; padding-top: 4px; border-top: 1px dashed var(--c-bd); }
  .mtabs { display: flex; }
  .modal { width: 94vw; max-height: 90vh; }
  .modal-bd { padding: 6px 8px; }
  .note-doc { padding: 8px 10px; font-size: 14px; }
}
</style>
