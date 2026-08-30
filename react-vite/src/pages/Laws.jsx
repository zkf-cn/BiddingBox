import { useEffect, useMemo, useRef, useState } from "react";
import { LawList } from "@/data/fee_standards";
import { Button, Input, Pill, IconSearch, IconEmpty, IconArrowRight } from "@/components/ui";

const CATEGORY_LABELS = {
  招标: "招标代理",
  造价: "造价咨询",
  设计: "工程设计",
  监理: "施工监理",
  前期: "前期咨询",
  环境: "环境影响",
  基建: "项目建设管理",
  代建: "代建管理",
  交易: "工程交易",
  专家: "专家分类",
};

/**
 * 法规正文的数据层表格全部只写了 <td>，没有任何表头单元格（WCAG 1.3.1）。
 * 渲染前把每个表格的首行 <td> 提升为 <th scope="col">。
 * 启发式规则：只对行数 ≥ 2 的表格生效，且仅处理首行，把误标风险降到最低。
 * 根治办法是在 fee_standards.js 数据层直接写出 <th>，此处为不改数据的兜底。
 */
function promoteTableHeaders(html) {
  if (!html) return html;
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    const rowCount = (table.match(/<tr\b/gi) || []).length;
    if (rowCount < 2) return table;
    let promoted = false;
    return table.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/i, (row) => {
      if (promoted) return row;
      promoted = true;
      return row
        .replace(/<td(\s[^>]*)?>/gi, (_m, attrs = "") => `<th scope="col"${attrs}>`)
        .replace(/<\/td>/gi, "</th>");
    });
  });
}

function findDoc(focusId) {
  for (const cat of Object.keys(LawList)) {
    const doc = LawList[cat].find((d) => d.id === focusId || d.docNumber === focusId);
    if (doc) return { cat, doc };
  }
  return null;
}

export default function Laws({ focusId, ...qoderProps }) {
  const categories = Object.keys(LawList);
  const [cat, setCat] = useState(categories[0]);
  const [q, setQ] = useState("");
  const [docId, setDocId] = useState(null);
  const [chapter, setChapter] = useState(0);
  const detailTitleRef = useRef(null);

  // 打开/切换文件后把焦点送到详情标题，避免焦点停留在已卸载的列表项上
  useEffect(() => {
    if (!docId) return;
    detailTitleRef.current?.focus({ preventScroll: true });
  }, [docId]);

  useEffect(() => {
    if (!focusId) return;
    const hit = findDoc(focusId);
    if (hit) {
      setCat(hit.cat);
      setDocId(hit.doc.id);
      setChapter(0);
      setQ("");
    }
  }, [focusId]);

  const docs = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return LawList[cat].filter(
      (d) =>
        !kw ||
        d.title.toLowerCase().includes(kw) ||
        (d.docNumber || "").toLowerCase().includes(kw)
    );
  }, [cat, q]);

  const current = docId ? LawList[cat].find((d) => d.id === docId) : null;

  return (
    <div className={["container", qoderProps?.className].filter(Boolean).join(" ")} data-component="Law Library" data-od-id="law-library" data-qoder-id="qel-law-library-f76a1185" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-library-f76a1185&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-library&quot;,&quot;loc&quot;:{&quot;line&quot;:57,&quot;column&quot;:5}}" style={qoderProps?.style}>
      <header className="page-head" data-qoder-id="qel-page-head-0f37c04a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-0f37c04a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;page-head&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:7}}">
        <div className="page-head-main" data-qoder-id="qel-page-head-main-2c481ce7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-main-2c481ce7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;page-head-main&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-c39ce7b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-c39ce7b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:11}}">Documents · 政策文件</span>
          <h1 className="page-title" data-qoder-id="qel-page-title-0598b3c5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-0598b3c5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:11}}">
            收费文件
            <Pill data-qoder-id="qel-pill-584d2b4f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-584d2b4f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:63,&quot;column&quot;:13}}">{Object.values(LawList).reduce((n, l) => n + l.length, 0)} 份</Pill>
          </h1>
          <p className="page-sub" data-qoder-id="qel-page-sub-dda0539c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-sub-dda0539c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;page-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:65,&quot;column&quot;:11}}">
            收费依据文件原文库，按业务领域分类。含发文机关、施行日期与有效性状态，
            计算器面板可一键跳转至对应文件。
          </p>
        </div>
      </header>

      {current ? (
        /* ---------- 文档详情 ---------- */
        <section data-component="Law Detail" data-od-id="law-detail" data-qoder-id="qel-law-detail-a3626ed2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-detail-a3626ed2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-detail&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:9}}">
          <div className="panel-head" data-qoder-id="qel-panel-head-937f5864" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-head-937f5864&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;panel-head&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:11}}">
            <Button variant="ghost" size="sm" onClick={() => setDocId(null)} aria-label="返回文件列表" data-qoder-id="qel-button-5979f7b8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-5979f7b8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:13}}">
              <span aria-hidden="true">←</span> 返回列表
            </Button>
            <div className="panel-meta" data-qoder-id="qel-panel-meta-7fa3362a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-meta-7fa3362a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;panel-meta&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:13}}">
              <Pill data-qoder-id="qel-pill-ec73d42c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-ec73d42c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:15}}">{current.docNumber}</Pill>
              <Pill tone={current.validity === "现行有效" ? "success" : "muted"} data-qoder-id="qel-pill-ed73d5bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-ed73d5bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:15}}">
                {current.validity}
              </Pill>
            </div>
          </div>

          <div className="card law-meta-card" data-qoder-id="qel-card-e1dddec7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-e1dddec7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:11}}">
            <h2 className="panel-title focus-target" ref={detailTitleRef} tabIndex={-1} data-qoder-id="qel-panel-title-0496416c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-title-0496416c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;panel-title&quot;,&quot;loc&quot;:{&quot;line&quot;:88,&quot;column&quot;:13}}">{current.title}</h2>
            <div className="law-meta" data-qoder-id="qel-law-meta-636761a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-meta-636761a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-meta&quot;,&quot;loc&quot;:{&quot;line&quot;:89,&quot;column&quot;:13}}">
              <span data-qoder-id="qel-span-43a35c91" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-43a35c91&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:90,&quot;column&quot;:15}}">
                <b data-qoder-id="qel-b-6c115ef4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-6c115ef4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:91,&quot;column&quot;:17}}">发文机关</b>
                {current.issuer}
              </span>
              <span data-qoder-id="qel-span-3da3531f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-3da3531f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:15}}">
                <b data-qoder-id="qel-b-76182a77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-76182a77&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:95,&quot;column&quot;:17}}">施行日期</b>
                {current.effectiveDate || "—"}
              </span>
              {current.abolitionDate && (
                <span data-qoder-id="qel-span-b5aacbcc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b5aacbcc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:99,&quot;column&quot;:17}}">
                  <b data-qoder-id="qel-b-78182d9d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-78182d9d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:100,&quot;column&quot;:19}}">废止日期</b>
                  {current.abolitionDate}
                </span>
              )}
              {current.abolitionBasis && (
                <span data-qoder-id="qel-span-b7aacef2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-b7aacef2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:17}}">
                  <b data-qoder-id="qel-b-7218242b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-7218242b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:106,&quot;column&quot;:19}}">废止依据</b>
                  {current.abolitionBasis}
                </span>
              )}
            </div>
          </div>

          <div className="tabs" role="group" aria-label="文件章节" data-qoder-id="qel-div-845f9984" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-845f9984&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:113,&quot;column&quot;:11}}">
            {current.chapterName.map((c, i) => (
              <Button
                key={c}
                variant="tab"
                active={chapter === i}
                onClick={() => setChapter(i)}
               data-qoder-id="qel-button-d1817065" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-d1817065&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:15}}">
                {c}
              </Button>
            ))}
          </div>

          <div
            className="law-doc"
            dangerouslySetInnerHTML={{
              __html: promoteTableHeaders(
                current.fileContent[Math.min(chapter, current.fileContent.length - 1)]
              ),
            }}
           data-qoder-id="qel-law-doc-2a5d4ad2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-doc-2a5d4ad2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-doc&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:11}}"/>
        </section>
      ) : (
        /* ---------- 分类 + 列表 ---------- */
        <>
          <div className="tabs" role="group" aria-label="文件分类" data-qoder-id="qel-div-795f8833" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-795f8833&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:11}}">
            {categories.map((c) => (
              <Button
                key={c}
                variant="tab"
                active={cat === c}
                onClick={() => {
                  setCat(c);
                  setQ("");
                }}
               data-qoder-id="qel-button-d28171f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-d28171f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:15}}">
                {CATEGORY_LABELS[c] ?? c}
                <span className="text-muted text-sm" style={{ marginLeft: 6 }} data-qoder-id="qel-text-muted-8b65ff35" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-8b65ff35&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;text-muted&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:17}}">
                  {LawList[c].length}
                </span>
              </Button>
            ))}
          </div>

          <div className="toolbar" data-qoder-id="qel-toolbar-53c7d5b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-toolbar-53c7d5b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:159,&quot;column&quot;:11}}">
            <div className="search-box" data-qoder-id="qel-search-box-f23dba15" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-box-f23dba15&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;search-box&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:13}}">
              <Input
                id="law-search"
                prefix={<IconSearch />}
                type="search"
                placeholder="搜索文件名 / 文号，如「32号」「监理」"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="搜索收费文件"
               data-qoder-id="qel-law-search-48983878" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-search-48983878&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-search&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:15}}"/>
            </div>
            <p className="result-count" aria-live="polite" data-qoder-id="qel-result-count-559989b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-count-559989b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;result-count&quot;,&quot;loc&quot;:{&quot;line&quot;:171,&quot;column&quot;:13}}">
              共 {docs.length} 份文件
            </p>
          </div>

          {docs.length > 0 ? (
            <div className="law-list" data-qoder-id="qel-law-list-2a5349dd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-list-2a5349dd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-list&quot;,&quot;loc&quot;:{&quot;line&quot;:177,&quot;column&quot;:13}}">
              {docs.map((d) => (
                <button
                  key={d.id}
                  className="card law-item"
                  onClick={() => {
                    setDocId(d.id);
                    setChapter(0);
                  }}
                 data-qoder-id="qel-card-2f170366" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-2f170366&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:179,&quot;column&quot;:17}}">
                  <span className="law-item-head" data-qoder-id="qel-law-item-head-9c951106" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-item-head-9c951106&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-item-head&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:19}}">
                    <span className="law-item-title" data-qoder-id="qel-law-item-title-2ddcf957" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-item-title-2ddcf957&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-item-title&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:21}}">{d.title}</span>
                    <IconArrowRight  data-qoder-id="qel-iconarrowright-f9ac253d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconarrowright-f9ac253d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;iconarrowright&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:21}}"/>
                  </span>
                  <span className="law-item-meta" data-qoder-id="qel-law-item-meta-b009aa49" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-law-item-meta-b009aa49&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;law-item-meta&quot;,&quot;loc&quot;:{&quot;line&quot;:191,&quot;column&quot;:19}}">
                    <Pill data-qoder-id="qel-pill-6b7fd50c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-6b7fd50c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:192,&quot;column&quot;:21}}">{d.docNumber}</Pill>
                    <Pill tone={d.validity === "现行有效" ? "success" : "muted"} data-qoder-id="qel-pill-6e7fd9c5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-6e7fd9c5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:193,&quot;column&quot;:21}}">
                      {d.validity}
                    </Pill>
                    <span className="text-muted text-sm" data-qoder-id="qel-text-muted-185e8e67" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-185e8e67&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;text-muted&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:21}}">{d.issuer}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty" data-qoder-id="qel-empty-0d2b9c1b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-0d2b9c1b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:202,&quot;column&quot;:13}}">
              <IconEmpty  data-qoder-id="qel-iconempty-f92db98a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-f92db98a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:203,&quot;column&quot;:15}}"/>
              <p data-qoder-id="qel-p-39f100e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-39f100e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:204,&quot;column&quot;:15}}">没有找到匹配的文件，试试文号关键词，如「1980」「670」。</p>
              <Button variant="ghost" size="sm" onClick={() => setQ("")} data-qoder-id="qel-button-d085ec00" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-d085ec00&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/Laws.jsx&quot;,&quot;componentName&quot;:&quot;Laws&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:205,&quot;column&quot;:15}}">
                清空搜索
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
