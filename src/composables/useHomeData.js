/**
 * 首页数据层：计算器清单、查询模块卡片
 */
import { computed } from 'vue'
import { groupCalcs } from '@/views/calc/defs'
import { DATA_VERSIONS } from '@/config'

export function useHomeData() {
  /** 计算器清单，摊平为一维列表 */
  const calcs = computed(() =>
    groupCalcs().flatMap((g) =>
      g.items.map((c) => ({
        id: c.id,
        name: c.name,
        desc: c.desc,
        docNo: c.docNo,
        icon: c.icon || 'calculator',
        to: `/calc/${c.id}`,
      })),
    ),
  )

  /** 2 个查询模块（数据量厚重，作为主入口大卡） */
  const queryCards = computed(() => [
    {
      to: '/quota',
      name: '工期定额查询',
      icon: 'clock',
      desc: '建筑安装工程工期定额，按部分 / 结构类型 / 层数 / 面积定位，支持多选批量导出与条目收藏',
      meta: DATA_VERSIONS.quota.docNo,
    },
    {
      to: '/expert',
      name: '评标专家分类查询',
      icon: 'users',
      desc: '公共资源交易评标专家专业分类标准，4 级分类逐级定位，支持批量导出与常用方向收藏',
      meta: DATA_VERSIONS.expert.docNo,
    },
  ])

  return { calcs, queryCards }
}
