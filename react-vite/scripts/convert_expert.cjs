// 转换脚本：将原始专家分类数据转为项目格式
const fs = require('fs');
const path = require('path');

const rawContent = fs.readFileSync(
  'c:\\Users\\郑开锋\\.trae-cn\\attachments\\6a93bedd2da15164365a2fa3\\dc0a469f-49da-41b6-8b8f-db5bab73c292_3f8a6ee9-8f7d-4b67-bbf7-4853fb87fd23_data.js',
  'utf-8'
);

// 找到第一个 { 和最后一个 } 的位置，提取纯对象
const firstBrace = rawContent.indexOf('{');
const lastBrace = rawContent.lastIndexOf('}');
const dataStr = rawContent.slice(firstBrace, lastBrace + 1);

const data = eval('(' + dataStr + ')');

const categoryMap = {
  '工程类（编码 A）': { id: 'eng', name: '工程类', code: 'A', desc: '涵盖规划、勘察、设计、监理、造价、施工等工程建设全流程专业' },
  '货物类（编码 B）': { id: 'goods', name: '货物类', code: 'B', desc: '机电产品、医疗器材、金属材料、石油、煤炭、化工、建材、医药等货物采购专业' },
  '服务类（编码 C）': { id: 'service', name: '服务类', code: 'C', desc: '勘查调查、公共咨询、经济管理、金融、法律、运维、租赁、交通运输等服务专业' },
};

function parseCodeName(str) {
  const s = str.trim();
  const idx = s.indexOf(' ');
  if (idx === -1) return { code: s, name: s };
  return { code: s.slice(0, idx), name: s.slice(idx + 1).trim() };
}

const result = [];

for (const [catKey, subcategories] of Object.entries(data)) {
  const catMeta = categoryMap[catKey];
  if (!catMeta) continue;

  const subs = [];
  for (const [subKey, specialties] of Object.entries(subcategories)) {
    const subMeta = parseCodeName(subKey);
    const specs = [];

    if (Array.isArray(specialties)) {
      if (specialties.length > 0) {
        const items = specialties.map(s => parseCodeName(s));
        specs.push({
          code: subMeta.code + '00',
          name: subMeta.name,
          items: items,
        });
      }
    } else if (typeof specialties === 'object' && specialties !== null) {
      for (const [specKey, items] of Object.entries(specialties)) {
        const specMeta = parseCodeName(specKey);
        const itemList = items.map(s => parseCodeName(s));
        specs.push({
          code: specMeta.code,
          name: specMeta.name,
          items: itemList,
        });
      }
    }

    if (specs.length > 0) {
      subs.push({
        code: subMeta.code,
        name: subMeta.name,
        specialties: specs,
      });
    }
  }

  result.push({
    id: catMeta.id,
    name: catMeta.name,
    code: catMeta.code,
    desc: catMeta.desc,
    subcategories: subs,
  });
}

// 统计
let totalSubs = 0;
let totalSpecs = 0;
let totalItems = 0;
result.forEach(cat => {
  totalSubs += cat.subcategories.length;
  cat.subcategories.forEach(sub => {
    totalSpecs += sub.specialties.length;
    sub.specialties.forEach(s => {
      totalItems += s.items.length;
    });
  });
});

console.log(`一级大类: ${result.length}`);
result.forEach(cat => {
  let s = 0, i = 0;
  cat.subcategories.forEach(sub => {
    s += sub.specialties.length;
    sub.specialties.forEach(sp => { i += sp.items.length; });
  });
  console.log(`  ${cat.name} (${cat.code}): ${cat.subcategories.length} 二级 / ${s} 三级 / ${i} 四级`);
});
console.log(`合计: ${totalSubs} 二级 / ${totalSpecs} 三级 / ${totalItems} 四级`);

// 生成输出
const output = `// 评标专家专业分类标准
// 依据：《公共资源交易评标专家专业分类标准》（发改法规〔2018〕316号）
// 层级：一级（大类） → 二级 → 三级（专业） → 四级（具体方向）
// 数据由原始分类标准转换生成

export const EXPERT_CATEGORIES = ${JSON.stringify(result, null, 2)};

export function getExpertStats() {
  let subCount = 0;
  let specCount = 0;
  let itemCount = 0;
  EXPERT_CATEGORIES.forEach(cat => {
    subCount += cat.subcategories.length;
    cat.subcategories.forEach(sub => {
      specCount += sub.specialties.length;
      sub.specialties.forEach(s => {
        itemCount += s.items.length;
      });
    });
  });
  return {
    categories: EXPERT_CATEGORIES.length,
    subcategories: subCount,
    specialties: specCount,
    items: itemCount,
  };
}
`;

const outPath = path.join(__dirname, '..', 'src', 'data', 'expertCategories.js');
fs.writeFileSync(outPath, output, 'utf-8');
console.log(`\n已写入: ${outPath}`);
