/**
 * 招标百宝箱 · 静态数据层
 *
 * 数据来源说明：
 * 1. 差累进费率表：计价格[2002]1980号《招标代理服务收费管理暂行办法》附表。
 *    注意：发改价格[2015]299号已放开招标代理服务费实行市场调节价，
 *    本表为历史参考标准，界面必须附带免责说明。
 * 2. 定额条目：演示数据（demo: true），不代表任何官方定额库，仅用于展示查询交互。
 * 3. 专家分类：参考数据，具体专业划分以当地综合评标专家库为准。
 */

/* ---------------- 差累进费率 ---------------- */

/** 计费区间（单位：万元），upper 为该区间上限（含），最后一档无上限 */
export const FEE_BANDS = [
  { label: "100万元以下", upper: 100 },
  { label: "100万–500万元", upper: 500 },
  { label: "500万–1000万元", upper: 1000 },
  { label: "1000万–5000万元", upper: 5000 },
  { label: "5000万–1亿元", upper: 10000 },
  { label: "1亿–5亿元", upper: 50000 },
  { label: "5亿–10亿元", upper: 100000 },
  { label: "10亿元以上", upper: Infinity },
];

/** 各类招标的差累进费率（%），与 FEE_BANDS 一一对应 */
export const PROJECT_TYPES = [
  {
    id: "goods",
    name: "货物招标",
    short: "货物",
    rates: [1.5, 1.1, 0.8, 0.5, 0.25, 0.05, 0.035, 0.008],
  },
  {
    id: "service",
    name: "服务招标",
    short: "服务",
    rates: [1.5, 0.8, 0.45, 0.25, 0.1, 0.05, 0.035, 0.008],
  },
  {
    id: "construction",
    name: "工程招标",
    short: "工程",
    rates: [1.0, 0.7, 0.55, 0.35, 0.2, 0.05, 0.035, 0.008],
  },
];

export const FEE_POLICY = {
  basis: "计价格[2002]1980号《招标代理服务收费管理暂行办法》",
  update: "发改价格[2011]534号对部分区间费率作过调整",
  disclaimer:
    "根据发改价格[2015]299号，招标代理服务费自2015年起实行市场调节价。本工具采用的费率表为历史参考标准，测算结果仅供从业参考，不构成任何收费或报价依据。",
};

/**
 * 差累进计算：按区间分段计费后累加
 * @param {number} amountWan 中标金额（万元），需 > 0
 * @param {number[]} rates 与 FEE_BANDS 对应的费率数组（%）
 * @returns {{total:number, breakdown:{label:string, rate:number, segAmount:number, segFee:number}[]}}
 */
export function calcAgentFee(amountWan, rates) {
  let lower = 0;
  const breakdown = [];
  let total = 0;
  for (let i = 0; i < FEE_BANDS.length; i++) {
    const band = FEE_BANDS[i];
    if (amountWan > lower) {
      const segAmount = Math.min(amountWan, band.upper) - lower;
      const segFee = (segAmount * rates[i]) / 100;
      breakdown.push({
        label: band.label,
        rate: rates[i],
        segAmount,
        segFee,
      });
      total += segFee;
    }
    lower = band.upper;
    if (amountWan <= lower) break;
  }
  return { total, breakdown };
}

/* ---------------- 定额查询（演示数据） ---------------- */

export const QUOTA_CATEGORIES = ["建筑工程", "装饰装修工程", "安装工程", "市政工程"];

/** 演示数据：条目编号、名称、基价均为示意，不代表官方定额 */
export const QUOTA_ITEMS = [
  {
    code: "A1-0012",
    name: "人工挖沟槽土方（三类土，深≤2m）",
    category: "建筑工程",
    unit: "m³",
    basePrice: 21.37,
    compose: "人工 0.312 工日",
    note: "槽底宽≤3m 且长边>3倍短边",
    demo: true,
  },
  {
    code: "A1-0086",
    name: "反铲挖掘机挖土（斗容量1.0m³，三类土）",
    category: "建筑工程",
    unit: "m³",
    basePrice: 6.84,
    compose: "人工 0.014 工日 · 机械 0.008 台班",
    note: "需另计土方外运",
    demo: true,
  },
  {
    code: "A4-0035",
    name: "C30 现浇混凝土矩形柱（层高≤5m）",
    category: "建筑工程",
    unit: "m³",
    basePrice: 486.52,
    compose: "人工 0.91 工日 · 混凝土 1.015 m³",
    note: "含浇筑、振捣、养护",
    demo: true,
  },
  {
    code: "A4-0121",
    name: "HRB400 螺纹钢绑扎钢筋（现浇构件）",
    category: "建筑工程",
    unit: "t",
    basePrice: 4218.6,
    compose: "人工 6.42 工日 · 钢筋 1.02 t",
    note: "含制作、绑扎、安装",
    demo: true,
  },
  {
    code: "B2-0014",
    name: "600×600 矿棉板吊顶（轻钢龙骨）",
    category: "装饰装修工程",
    unit: "m²",
    basePrice: 68.45,
    compose: "人工 0.28 工日 · 龙骨 1.02 m²",
    note: "含龙骨调平",
    demo: true,
  },
  {
    code: "B3-0008",
    name: "600×600 地砖楼地面（干硬性水泥砂浆）",
    category: "装饰装修工程",
    unit: "m²",
    basePrice: 52.13,
    compose: "人工 0.25 工日 · 砂浆 0.031 m³",
    note: "主材另计",
    demo: true,
  },
  {
    code: "C2-0047",
    name: "镀锌钢管螺纹连接 DN50（室内给水）",
    category: "安装工程",
    unit: "10m",
    basePrice: 187.32,
    compose: "人工 0.86 工日 · 管材 10.15 m",
    note: "含管件、水压试验",
    demo: true,
  },
  {
    code: "C4-0102",
    name: "铜芯电缆敷设 YJV-4×25（桥架内）",
    category: "安装工程",
    unit: "100m",
    basePrice: 926.48,
    compose: "人工 3.42 工日 · 电缆 101.5 m",
    note: "含桥架固定、挂牌",
    demo: true,
  },
  {
    code: "C7-0023",
    name: "碳钢通风管道制作安装（δ=1.0，周长≤1600）",
    category: "安装工程",
    unit: "m²",
    basePrice: 96.75,
    compose: "人工 0.45 工日 · 板材 1.14 m²",
    note: "含法兰、支吊架",
    demo: true,
  },
  {
    code: "D1-0006",
    name: "沥青混凝土路面（粗粒式，厚8cm）",
    category: "市政工程",
    unit: "100m²",
    basePrice: 5230.8,
    compose: "机械 1.24 台班 · 混合料 8.24 t",
    note: "含摊铺、碾压",
    demo: true,
  },
  {
    code: "D3-0058",
    name: "DN600 钢筋混凝土排水管铺设（平口）",
    category: "市政工程",
    unit: "10m",
    basePrice: 1845.2,
    compose: "人工 4.6 工日 · 机械 0.32 台班",
    note: "含基础、接口、闭水",
    demo: true,
  },
  {
    code: "D5-0011",
    name: "人行道花岗岩板铺装（厚5cm，含垫层）",
    category: "市政工程",
    unit: "m²",
    basePrice: 118.66,
    compose: "人工 0.38 工日 · 砂浆 0.028 m³",
    note: "主材另计",
    demo: true,
  },
];

/* ---------------- 专家分类（参考数据） ---------------- */

export const EXPERT_CATEGORIES = [
  {
    id: "engineering",
    name: "工程类",
    desc: "工程建设相关专业，覆盖房屋建筑、市政、交通、水利等评标场景",
    specialties: [
      { name: "房屋建筑工程", desc: "土建结构、给排水、暖通空调、建筑电气等房屋建筑各专业", tags: ["土建", "机电", "安装"] },
      { name: "市政公用工程", desc: "城市道路、桥梁、轨道交通、给排水管网、燃气与环卫设施", tags: ["道路", "管网", "桥梁"] },
      { name: "交通运输工程", desc: "公路、铁路、水运、机场等交通基础设施工程", tags: ["公路", "铁路", "水运"] },
      { name: "水利水电工程", desc: "水库枢纽、堤防、灌区、水电站及河道治理工程", tags: ["水利", "水电"] },
      { name: "能源电力工程", desc: "火电、风电、光伏、输变电及配电网工程", tags: ["电力", "新能源"] },
      { name: "机电设备安装", desc: "工业设备、电梯、起重机械、智能化系统设备采购与安装", tags: ["设备", "智能化"] },
      { name: "信息技术工程", desc: "软件开发、系统集成、网络安全与信息化平台建设", tags: ["软件", "集成"] },
      { name: "勘察设计", desc: "岩土工程、工程测量、城乡规划与工程勘察", tags: ["勘察", "测量"] },
      { name: "工程造价", desc: "工程量清单编制、招标控制价、结算与审计配合", tags: ["清单", "控制价"] },
      { name: "项目管理", desc: "全过程工程咨询、代建管理与工程监理管理", tags: ["咨询", "代建"] },
    ],
  },
  {
    id: "goods",
    name: "货物类",
    desc: "设备、物资与材料类采购评标专业",
    specialties: [
      { name: "机电设备", desc: "通用与专用机械设备、生产线成套设备", tags: ["设备", "成套"] },
      { name: "医疗器械", desc: "医用影像、检验、手术设备及医用耗材", tags: ["医疗", "耗材"] },
      { name: "信息化设备", desc: "服务器、网络设备、终端与安防设备", tags: ["IT", "安防"] },
      { name: "办公设备与家具", desc: "办公自动化设备、办公家具与后勤装备", tags: ["办公", "家具"] },
      { name: "车辆与专用设备", desc: "公务用车、特种作业车辆与专用作业设备", tags: ["车辆", "特种"] },
      { name: "物资与材料", desc: "大宗材料、劳保物资与储备物资采购", tags: ["材料", "物资"] },
    ],
  },
  {
    id: "service",
    name: "服务类",
    desc: "专业技术服务与综合保障服务评标专业",
    specialties: [
      { name: "工程咨询服务", desc: "项目建议书、可研、评估与全过程咨询", tags: ["可研", "咨询"] },
      { name: "勘察设计服务", desc: "工程勘察、初步设计与施工图设计服务", tags: ["设计", "勘察"] },
      { name: "监理服务", desc: "施工监理、设备监理与信息化监理", tags: ["监理"] },
      { name: "造价咨询服务", desc: "清单与控制价编制、结算审核、跟踪审计", tags: ["造价", "审计"] },
      { name: "招标代理服务", desc: "工程、货物、服务招标代理与采购咨询", tags: ["代理", "采购"] },
      { name: "财务与审计", desc: "会计、审计、税务与资产评估服务", tags: ["审计", "评估"] },
      { name: "法律服务", desc: "法律顾问、合规审查与争议解决", tags: ["法律", "合规"] },
      { name: "物业与后勤", desc: "物业管理、安保保洁、餐饮与会议保障", tags: ["物业", "保障"] },
      { name: "运维服务", desc: "信息系统运维、设备维保与平台运营", tags: ["运维", "维保"] },
    ],
  },
];
