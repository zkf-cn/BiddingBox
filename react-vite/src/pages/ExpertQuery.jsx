import { useState, useMemo } from "react";
import { EXPERT_CATEGORIES, getExpertStats } from "@/data/expertCategories";
import {
  IconSearch,
  IconUsers,
  IconChevronRight,
  IconFolder,
  IconFolderOpen,
  Pill,
  Notice,
  Input,
  TableScroll,
} from "@/components/ui";

export default function ExpertQuery({ ...qoderProps }) {
  const [activeCat, setActiveCat] = useState(EXPERT_CATEGORIES[0].id);
  const [activeSub, setActiveSub] = useState(EXPERT_CATEGORIES[0].subcategories[0]?.code || "");
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState({});

  const stats = getExpertStats();

  const currentCat = EXPERT_CATEGORIES.find((c) => c.id === activeCat);

  // 切换大类时重置二级选中
  const handleCatChange = (catId) => {
    setActiveCat(catId);
    const cat = EXPERT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setActiveSub(cat.subcategories[0].code);
    } else {
      setActiveSub("");
    }
  };

  const currentSub = currentCat?.subcategories.find((s) => s.code === activeSub);

  // 搜索模式：跨所有层级匹配
  const searchResults = useMemo(() => {
    if (!keyword.trim()) return null;
    const kw = keyword.trim().toLowerCase();
    const results = [];

    EXPERT_CATEGORIES.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        sub.specialties.forEach((spec) => {
          // 匹配三级专业名或编码
          const specMatch =
            spec.name.toLowerCase().includes(kw) ||
            spec.code.toLowerCase().includes(kw);
          // 匹配四级细项
          const matchedItems = spec.items.filter(
            (item) =>
              item.name.toLowerCase().includes(kw) ||
              item.code.toLowerCase().includes(kw)
          );

          if (specMatch || matchedItems.length > 0) {
            results.push({
              catCode: cat.code,
              catName: cat.name,
              subCode: sub.code,
              subName: sub.name,
              specCode: spec.code,
              specName: spec.name,
              matchedItems: specMatch ? spec.items : matchedItems,
              matchType: specMatch ? "spec" : "item",
            });
          }
        });
      });
    });

    return results;
  }, [keyword]);

  const toggleExpand = (code) => {
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div
      className={["", qoderProps?.className].filter(Boolean).join(" ")}
      data-component="ExpertQuery"
      data-od-id="expert-query"
      style={qoderProps?.style}
      data-qoder-id={qoderProps?.["data-qoder-id"]}
      data-qoder-source={qoderProps?.["data-qoder-source"]}
    >
      <div className="container">
        {/* 页头 */}
        <div className="page-head">
          <div className="page-head-main">
            <span className="kicker">Reference · 专家分类</span>
            <h1 className="page-title">
              评标专家专业分类
              <Pill>{stats.specialties} 个专业</Pill>
            </h1>
            <p className="page-sub">
              依据《公共资源交易评标专家专业分类标准》（发改法规〔2018〕316号）整理，
              工程、货物、服务三大类共 {stats.subcategories} 个二级分类、{stats.specialties} 个三级专业、{stats.items} 个具体方向。
              抽取专家、组建评标委员会前快速核对专业口径。
            </p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="toolbar">
          <div className="search-box">
            <Input
              id="expert-search"
              prefix={<IconSearch size={16} />}
              type="search"
              placeholder="搜索专业名称或编码，如「建筑」「A04」"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="搜索评标专家专业名称或编码"
              aria-describedby="expert-search-tip"
            />
          </div>
          <span className="text-muted text-sm" id="expert-search-tip">
            支持名称、编码模糊匹配
          </span>
        </div>

        {/* 搜索结果 */}
        {searchResults && (
          <div className="mt-16">
            <p className="result-count" aria-live="polite">
              找到 <b>{searchResults.length}</b> 个相关专业
            </p>

            {searchResults.length === 0 ? (
              <div className="empty">
                <IconSearch size={32} />
                <p>未找到匹配的专业，请换个关键词试试</p>
              </div>
            ) : (
              <div className="table-wrap quota-table">
                <TableScroll label="专家专业搜索结果">
                  <table className="data" aria-label="评标专家专业搜索结果">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 90 }}>大类</th>
                        <th scope="col" style={{ width: 120 }}>二级分类</th>
                        <th scope="col" style={{ width: 120 }}>专业编码</th>
                        <th scope="col">专业名称</th>
                        <th scope="col" className="num" style={{ width: 90 }}>细项数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.slice(0, 100).map((r) => (
                        <tr key={`${r.catCode}-${r.subCode}-${r.specCode}`}>
                          <td>
                            <span className="text-secondary">
                              {r.catCode} · {r.catName}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary">
                              {r.subCode} {r.subName}
                            </span>
                          </td>
                          <td>
                            <code style={{ fontSize: 13 }}>{r.specCode}</code>
                          </td>
                          <td>
                            <div>{r.specName}</div>
                            {r.matchedItems.length > 0 && r.matchedItems.length < 20 && (
                              <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {r.matchedItems.slice(0, 10).map((item) => (
                                  <Pill key={item.code} tone="muted" style={{ fontSize: 11 }}>
                                    {item.code} {item.name}
                                  </Pill>
                                ))}
                                {r.matchedItems.length > 10 && (
                                  <Pill tone="muted" style={{ fontSize: 11 }}>
                                    +{r.matchedItems.length - 10}
                                  </Pill>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="num">
                            {r.matchedItems.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScroll>
                {searchResults.length > 100 && (
                  <div className="text-muted text-sm" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-whisper)' }}>
                    仅显示前 100 条结果，请输入更精确的关键词
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 分类浏览 */}
        {!searchResults && (
          <div className="hub-layout" style={{ marginTop: 8 }}>
            {/* 侧栏：二级分类 */}
            <aside className="hub-side">
              {/* 大类 Tabs */}
              <div
                className="tabs"
                style={{ marginTop: 0 }}
                role="group"
                aria-label="专家大类"
              >
                {EXPERT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`tab ${activeCat === cat.id ? "active" : ""}`}
                    aria-pressed={activeCat === cat.id}
                    onClick={() => handleCatChange(cat.id)}
                  >
                    {cat.code} {cat.name}
                  </button>
                ))}
              </div>

              {/* 二级分类列表 */}
              <div className="hub-group">
                <div className="hub-group-title" id="expert-sub-group">
                  <span>二级分类</span>
                  <span className="hub-count">{currentCat?.subcategories.length || 0}</span>
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  role="group"
                  aria-labelledby="expert-sub-group"
                >
                  {currentCat?.subcategories.map((sub) => (
                    <button
                      key={sub.code}
                      type="button"
                      className={`hub-item ${activeSub === sub.code ? "active" : ""}`}
                      aria-current={activeSub === sub.code ? "true" : undefined}
                      onClick={() => setActiveSub(sub.code)}
                    >
                      <span className="hub-item-name">
                        <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub.code}</code>{" "}
                        {sub.name}
                      </span>
                      <span className="hub-item-desc">
                        {sub.specialties.length} 个专业
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* 主区域：三级专业列表 */}
            {/* 注意：App.jsx 已提供文档唯一的 <main>，此处只能用 section */}
            <section className="calc-embedded">
              <div className="panel-head">
                <div>
                  <div className="kicker">
                    {currentCat?.code} {currentCat?.name} / {currentSub?.code} {currentSub?.name}
                  </div>
                  <h2 className="panel-title">
                    {currentSub?.name}
                    <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>
                      共 {currentSub?.specialties.length || 0} 个专业
                    </span>
                  </h2>
                </div>
                <div className="panel-meta">
                  <Pill tone="neutral">编码 {currentSub?.code}</Pill>
                </div>
              </div>

              {/* 专业卡片列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentSub?.specialties.map((spec) => {
                  const isOpen = expanded[spec.code];
                  return (
                    <div
                      key={spec.code}
                      className="card"
                      style={{ padding: 0, overflow: 'hidden' }}
                    >
                      <button
                        type="button"
                        id={`spec-btn-${spec.code}`}
                        aria-expanded={isOpen}
                        aria-controls={`spec-panel-${spec.code}`}
                        onClick={() => toggleExpand(spec.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: '14px 18px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 150ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--control-bg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: 'var(--control-bg)',
                          border: '1px solid var(--border-whisper)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 'none',
                          color: 'var(--text-muted)',
                        }}>
                          {isOpen ? <IconFolderOpen size={16} /> : <IconFolder size={16} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 15,
                            fontWeight: 500,
                            letterSpacing: '-0.01em',
                            color: 'var(--fg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}>
                            <code style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                              {spec.code}
                            </code>
                            {spec.name}
                          </div>
                          <div style={{
                            fontSize: 12.5,
                            color: 'var(--text-muted)',
                            marginTop: 2,
                          }}>
                            {spec.items.length} 个具体方向
                          </div>
                        </div>
                        <IconChevronRight
                          size={16}
                          style={{
                            color: 'var(--text-muted)',
                            transform: isOpen ? 'rotate(90deg)' : 'none',
                            transition: 'transform 200ms ease',
                            flex: 'none',
                          }}
                        />
                      </button>

                      {/* 展开的四级细项 */}
                      {isOpen && spec.items.length > 0 && (
                        <div
                          id={`spec-panel-${spec.code}`}
                          aria-labelledby={`spec-btn-${spec.code}`}
                          style={{
                          padding: '12px 18px 16px 62px',
                          borderTop: '1px solid var(--border-whisper)',
                          background: 'var(--control-bg)',
                        }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '6px 16px',
                          }}>
                            {spec.items.map((item) => (
                              <div
                                key={item.code}
                                style={{
                                  fontSize: 13,
                                  color: 'var(--text-secondary)',
                                  lineHeight: 1.7,
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: 8,
                                }}
                              >
                                <code style={{
                                  fontSize: 11.5,
                                  color: 'var(--text-muted)',
                                  flex: 'none',
                                  fontVariantNumeric: 'tabular-nums',
                                }}>
                                  {item.code}
                                </code>
                                <span
                                  title={item.name}
                                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 说明 */}
              <div className="mt-24">
                <Notice>
                  <IconUsers size={16} style={{ flex: 'none', marginTop: 3 }} />
                  <span>
                    <b>分类说明：</b>
                    本分类参照《公共资源交易评标专家专业分类标准》（发改法规〔2018〕316号）整理。
                    编码规则为：一级大类（A/B/C）+ 二级（2位）+ 三级专业（2位）+ 四级方向（2位）。
                    正式抽取专家请以当地公共资源交易中心综合评标专家库为准。
                  </span>
                </Notice>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
