/**
 * 站点全局配置
 * 修改本文件即可调整站点信息、数据版本声明、导出上限与统计 ID，无需改动业务逻辑。
 */

export const SITE = {
  name: '招标百宝箱',
  shortName: '百宝箱',
  subtitle: '招投标咨询在线计算与查询',
  description: '面向工程招标代理、造价咨询从业人员的纯前端计算与查询工具集',
}

/**
 * 数据版本声明 —— 版本信息写死在程序内，导出 Excel 时自动附带文号与标准名称。
 * 政策/定额更新时同步修改此处 + 替换 src/data/ 下对应的 JSON 文件。
 */
export const DATA_VERSIONS = {
  // 工期定额
  quota: {
    stdName: '建筑安装工程工期定额',
    stdCode: 'TY01-89-2016',
    docNo: '建标〔2016〕161号',
    effectiveDate: '2016-10-01',
    publisher: '中华人民共和国住房和城乡建设部',
    note: '替代 2000 年《全国统一建筑安装工程工期定额》，共 4 部分 / 95 个定额表 / 2645 条',
  },
  // 评标专家专业分类
  expert: {
    stdName: '公共资源交易评标专家专业分类标准',
    docNo: '发改法规〔2018〕316号',
    publisher: '国家发展和改革委员会',
    note: '层级：一级（大类）→ 二级 → 三级（专业）→ 四级（具体方向）',
  },
  // 计费标准最后核对时间
  fee: {
    lastVerified: '2026-09',
    note: '各计算器所依据的文号与标准全称见 src/data/standards.json 中的 CALCULATORS 字段',
  },
}

/** 单次导出 xlsx 的最大条目数（查询模块批量导出防护，避免浏览器卡顿崩溃） */
export const EXPORT_LIMIT = {
  quota: 2000,
  expert: 2000,
}

/** 统计列表最多保留条数（超出后丢弃最旧的记录） */
export const STATS_LIMIT = 200

/** localStorage 存储键清单（一键清空按钮会清除以下全部键） */
export const STORAGE_KEYS = {
  theme: 'app_theme',
  accent: 'app_accent',
  statsList: 'calc_stats_list',
  collectQuota: 'collect_quota',
  collectExpert: 'collect_expert',
}
