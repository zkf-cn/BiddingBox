<script setup>
/** 数据版本与说明：标准文号、数据来源、本地存储清单、维护方式、免责声明 */
import { computed, ref } from 'vue'
import { DATA_VERSIONS, STORAGE_KEYS, EXPORT_LIMIT, STATS_LIMIT } from '@/config'
import { groupCalcs } from './calc/defs'
import { usedBytes } from '@/utils/storage'
import { fmtBytes } from '@/utils/format'

const groups = computed(() => groupCalcs())
const storageSize = ref(fmtBytes(usedBytes()))

const STORAGE_ROWS = [
  { key: STORAGE_KEYS.theme, usage: '用户选择主题（light / dark）' },
  { key: STORAGE_KEYS.statsList, usage: '统计列表（用户手动加入的测算结果）', limit: `最多 ${STATS_LIMIT} 条` },
  { key: STORAGE_KEYS.collectQuota, usage: '收藏的工期定额条目' },
  { key: STORAGE_KEYS.collectExpert, usage: '收藏的专家分类条目' },
]
</script>

<template>
  <div>
    <!-- 数据版本 -->
    <section class="card mb-16">
      <div class="card-head"><div class="card-title">数据版本声明</div></div>
      <div class="card-body">
        <p class="text-sm text-muted mb-16">
          本工具内置<b>固定单一现行版本</b>的政策、定额与专家分类数据，不提供多版本切换。版本信息写死在程序内，导出的 Excel 会自动附带对应文号与标准全称。
        </p>
        <div class="table-wrap" style="border: none">
          <table class="table">
            <thead>
              <tr>
                <th>数据集</th>
                <th>标准名称</th>
                <th>文号 / 编号</th>
                <th>发布机关</th>
                <th>版本</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>工期定额</td>
                <td>{{ DATA_VERSIONS.quota.stdName }}</td>
                <td class="mono">{{ DATA_VERSIONS.quota.docNo }}<br />{{ DATA_VERSIONS.quota.stdCode }}</td>
                <td>{{ DATA_VERSIONS.quota.publisher }}</td>
                <td>{{ DATA_VERSIONS.quota.effectiveDate }} 施行</td>
              </tr>
              <tr>
                <td>专家分类</td>
                <td>{{ DATA_VERSIONS.expert.stdName }}</td>
                <td class="mono">{{ DATA_VERSIONS.expert.docNo }}</td>
                <td>{{ DATA_VERSIONS.expert.publisher }}</td>
                <td>现行单一版本</td>
              </tr>
              <tr>
                <td>计费标准</td>
                <td>9 套计算器费率表</td>
                <td>见下方计算器清单</td>
                <td>—</td>
                <td>核对时间 {{ DATA_VERSIONS.fee.lastVerified }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 计算器文号清单 -->
    <section class="card mb-16">
      <div class="card-head"><div class="card-title">计算器与政策依据</div></div>
      <div class="card-body">
        <template v-for="g in groups" :key="g.group">
          <div class="table-wrap mb-16" style="border: none">
            <div class="table-caption">{{ g.group }}</div>
            <table class="table">
              <thead>
                <tr>
                  <th>计算器</th>
                  <th>标准全称</th>
                  <th>文号</th>
                  <th>计费方式</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in g.items" :key="c.id">
                  <td><RouterLink :to="`/calc/${c.id}`">{{ c.name }}</RouterLink></td>
                  <td>{{ c.stdName }}</td>
                  <td class="mono">{{ c.docNo }}</td>
                  <td class="text-sm text-muted">{{ c.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </section>

    <!-- 本地存储 -->
    <section class="card mb-16">
      <div class="card-head">
        <div class="card-title">本地存储说明</div>
        <span class="text-sm text-muted">当前占用约 {{ storageSize }}</span>
      </div>
      <div class="card-body">
        <div class="table-wrap" style="border: none">
          <table class="table">
            <thead>
              <tr>
                <th>存储 key</th>
                <th>用途</th>
                <th>上限</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in STORAGE_ROWS" :key="r.key">
                <td class="mono">{{ r.key }}</td>
                <td>{{ r.usage }}</td>
                <td class="text-sm text-muted">{{ r.limit || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="alert alert-info mt-16">
          <div>
            以上 4 项均保存在你浏览器的 localStorage 中，仅服务于当前浏览器的本站页面，不会上传服务器。
            侧边栏折叠状态属于临时界面状态，保存在 sessionStorage，不在此列。
          </div>
        </div>
      </div>
    </section>

    <!-- 使用与维护 -->
    <section class="card mb-16">
      <div class="card-head"><div class="card-title">使用与维护说明</div></div>
      <div class="card-body">
        <ul class="list">
          <li><b>计算器：</b>输入计费基数后自动实时计算，同时输出「未打折（标准基准价）」与「计取调整系数后（下浮）」两组结果，可导出 .xlsx。</li>
          <li><b>校验规则：</b>计费基数禁止负数、禁止 0，并设有业务上限；校验不通过时清空计算结果区域并给出中文提示。</li>
          <li><b>导出防护：</b>查询模块单次导出上限为 {{ EXPORT_LIMIT.quota }} 条，超出时给出提示，请分批导出。</li>
          <li><b>数据更新：</b>政策或定额更新时，维护人员只需替换 <code class="mono">src/data/*.json</code> 并同步修改
            <code class="mono">src/config.js</code> 中的 DATA_VERSIONS 版本声明，重新构建发布即可，无需改动业务逻辑。</li>
          <li><b>打印：</b>支持浏览器打印，打印时自动隐藏导航与操作按钮。</li>
        </ul>
      </div>
    </section>

    <!-- 免责 -->
    <section class="alert alert-danger">
      <div>
        <b>风险与免责提示</b>
        <ol class="disclaimer-list">
          <li>本工具内置固定版本政策定额数据，仅供工作参考，<b>不构成专业法律、造价意见</b>；正式工作以官方发布纸质文件为准。</li>
          <li>用户所有输入数据保存在浏览器本地，<b>服务器不会留存任何业务数据</b>；清除浏览器数据或更换设备后，统计列表与收藏将无法恢复。</li>
          <li>部分地方标准（闽招协〔2021〕32号、厦建价协〔2020〕05号等）的原文费率表未收录，页面按国家标准参考计算并给出显著提示，请以原文为准。</li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.list li {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--muted-foreground);
  padding-left: 14px;
  position: relative;
}
.list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
}
.disclaimer-list {
  margin: 8px 0 0;
  padding-left: 18px;
  list-style: decimal;
}
.disclaimer-list li {
  margin-bottom: 4px;
}
</style>
