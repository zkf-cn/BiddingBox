import { useMemo, useState } from "react";
import { QUOTA_CATEGORIES, QUOTA_ITEMS } from "@/data/bidding";
import { IconSearch, IconEmpty, Pill, Input, Button, TableScroll } from "@/components/ui";

export default function QuotaQuery(qoderProps) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("全部");

  const cats = ["全部", ...QUOTA_CATEGORIES];

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return QUOTA_ITEMS.filter((item) => {
      const inCat = cat === "全部" || item.category === cat;
      if (!inCat) return false;
      if (!kw) return true;
      return (
        item.name.toLowerCase().includes(kw) ||
        item.code.toLowerCase().includes(kw) ||
        item.category.toLowerCase().includes(kw)
      );
    });
  }, [q, cat]);

  const reset = () => {
    setQ("");
    setCat("全部");
  };

  return (
    <div className={["container", qoderProps?.className].filter(Boolean).join(" ")} data-component="Quota Query" data-od-id="quota-query" style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <header className="page-head" data-qoder-id="qel-page-head-f4801580" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-f4801580&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;page-head&quot;,&quot;loc&quot;:{&quot;line&quot;:32,&quot;column&quot;:7}}">
        <div className="page-head-main" data-qoder-id="qel-page-head-main-ef0478c9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-main-ef0478c9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;page-head-main&quot;,&quot;loc&quot;:{&quot;line&quot;:33,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-c17c1384" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-c17c1384&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:34,&quot;column&quot;:11}}">Reference · 定额数据</span>
          <h1 className="page-title" data-qoder-id="qel-page-title-0df46cd7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-0df46cd7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:35,&quot;column&quot;:11}}">
            定额查询
            <Pill data-qoder-id="qel-pill-9c61ba71" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-9c61ba71&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:37,&quot;column&quot;:13}}">演示数据</Pill>
          </h1>
          <p className="page-sub" data-qoder-id="qel-page-sub-dcf5664e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-sub-dcf5664e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;page-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:39,&quot;column&quot;:11}}">
            按专业分类检索定额条目，查看计量单位、基价与工料组成。
            当前为演示数据，仅用于展示查询交互。
          </p>
        </div>
      </header>

      <div className="toolbar" data-component="Quota Toolbar" data-od-id="quota-toolbar" data-qoder-id="qel-quota-toolbar-b360bcac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-quota-toolbar-b360bcac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;quota-toolbar&quot;,&quot;loc&quot;:{&quot;line&quot;:46,&quot;column&quot;:7}}">
        <div className="search-box" data-qoder-id="qel-search-box-95cb47b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-search-box-95cb47b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;search-box&quot;,&quot;loc&quot;:{&quot;line&quot;:47,&quot;column&quot;:9}}">
          <Input
            id="quota-search"
            prefix={<IconSearch />}
            type="search"
            placeholder="搜索名称 / 编号，如「混凝土」「A4-」"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="搜索定额条目"
           data-qoder-id="qel-quota-search-af35a2ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-quota-search-af35a2ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;quota-search&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:11}}"/>
        </div>
        <div className="chip-row" role="group" aria-label="按专业分类筛选" data-qoder-id="qel-div-f305bb5d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f305bb5d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:9}}">
          {cats.map((c) => (
            <Button
              key={c}
              variant="chip"
              active={cat === c}
              onClick={() => setCat(c)}
             data-qoder-id="qel-button-9355e4cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-9355e4cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:13}}">
              {c}
            </Button>
          ))}
        </div>
        <p className="result-count" aria-live="polite" data-qoder-id="qel-result-count-4ef78b28" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-count-4ef78b28&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;result-count&quot;,&quot;loc&quot;:{&quot;line&quot;:72,&quot;column&quot;:9}}">
          共 {filtered.length} 条 · 数据为演示用途
        </p>
      </div>

      {filtered.length > 0 ? (
        <>
          {/* 桌面表格 */}
          <div className="table-wrap quota-table" data-qoder-id="qel-table-wrap-a467991a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-a467991a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:80,&quot;column&quot;:11}}">
            <TableScroll label="定额条目列表" data-qoder-id="qel-table-scroll-2e077f1e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-2e077f1e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:13}}">
              <table className="data" aria-label="定额条目列表" data-qoder-id="qel-table-56ff2bb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-56ff2bb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:82,&quot;column&quot;:15}}">
                <thead data-qoder-id="qel-thead-d7825823" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-d7825823&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:83,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-0aadcb46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-0aadcb46&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:19}}">
                    <th scope="col" data-qoder-id="qel-th-a0172bc1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-a0172bc1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:21}}">编号</th>
                    <th scope="col" data-qoder-id="qel-th-b11507ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-b11507ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:86,&quot;column&quot;:21}}">项目名称</th>
                    <th scope="col" data-qoder-id="qel-th-b015065a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-b015065a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:87,&quot;column&quot;:21}}">专业分类</th>
                    <th scope="col" data-qoder-id="qel-th-af1504c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-af1504c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:88,&quot;column&quot;:21}}">单位</th>
                    <th scope="col" className="num" data-qoder-id="qel-num-234ebffa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-234ebffa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:89,&quot;column&quot;:21}}">基价（元）</th>
                    <th scope="col" data-qoder-id="qel-th-ad1501a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-ad1501a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:90,&quot;column&quot;:21}}">工料组成</th>
                  </tr>
                </thead>
                <tbody data-qoder-id="qel-tbody-e4e49e36" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-e4e49e36&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:93,&quot;column&quot;:17}}">
                  {filtered.map((item) => (
                    <tr key={item.code} data-qoder-id="qel-tr-06ab8663" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-06ab8663&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:95,&quot;column&quot;:21}}">
                      <td style={{ whiteSpace: "nowrap" }} data-qoder-id="qel-td-51b120b0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-51b120b0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:96,&quot;column&quot;:23}}">{item.code}</td>
                      <td data-qoder-id="qel-td-60b1384d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-60b1384d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:97,&quot;column&quot;:23}}">
                        {item.name}
                        <div className="text-muted text-sm" data-qoder-id="qel-text-muted-797294cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-797294cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;text-muted&quot;,&quot;loc&quot;:{&quot;line&quot;:99,&quot;column&quot;:25}}">{item.note}</div>
                      </td>
                      <td data-qoder-id="qel-td-52aee3ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-52aee3ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:101,&quot;column&quot;:23}}">
                        <Pill tone="neutral" data-qoder-id="qel-pill-01dfd781" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-01dfd781&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:25}}">{item.category}</Pill>
                      </td>
                      <td data-qoder-id="qel-td-54aee6d2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-54aee6d2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:23}}">{item.unit}</td>
                      <td className="num" data-qoder-id="qel-num-51b7d3af" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-51b7d3af&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:105,&quot;column&quot;:23}}">{item.basePrice.toLocaleString("zh-CN")}</td>
                      <td className="text-secondary" data-qoder-id="qel-text-secondary-dce1bad8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-secondary-dce1bad8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;text-secondary&quot;,&quot;loc&quot;:{&quot;line&quot;:106,&quot;column&quot;:23}}">{item.compose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </div>

          {/* 移动端卡片 */}
          <div className="quota-cards" data-qoder-id="qel-quota-cards-e11b980c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-quota-cards-e11b980c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;quota-cards&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:11}}">
            {filtered.map((item) => (
              <div className="card" key={item.code} data-qoder-id="qel-card-ada08851" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-ada08851&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:117,&quot;column&quot;:15}}">
                <div className="expert-name" data-qoder-id="qel-expert-name-934a0f7c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-expert-name-934a0f7c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;expert-name&quot;,&quot;loc&quot;:{&quot;line&quot;:118,&quot;column&quot;:17}}">{item.name}</div>
                <div className="expert-tags" data-qoder-id="qel-expert-tags-55e047e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-expert-tags-55e047e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;expert-tags&quot;,&quot;loc&quot;:{&quot;line&quot;:119,&quot;column&quot;:17}}">
                  <Pill tone="neutral" data-qoder-id="qel-pill-f9dfcae9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-f9dfcae9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:19}}">{item.category}</Pill>
                  <Pill tone="neutral" data-qoder-id="qel-pill-82d3d6a1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-82d3d6a1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:121,&quot;column&quot;:19}}">{item.code}</Pill>
                </div>
                <p className="expert-desc" data-qoder-id="qel-expert-desc-88c072ce" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-expert-desc-88c072ce&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;expert-desc&quot;,&quot;loc&quot;:{&quot;line&quot;:123,&quot;column&quot;:17}}">
                  基价 {item.basePrice.toLocaleString("zh-CN")} 元/{item.unit} ·{" "}
                  {item.compose}
                </p>
                <p className="text-muted text-sm" data-qoder-id="qel-text-muted-4b7df328" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-text-muted-4b7df328&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;text-muted&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:17}}">{item.note}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty" data-qoder-id="qel-empty-fcb9e3a4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-fcb9e3a4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:9}}">
          <IconEmpty  data-qoder-id="qel-iconempty-5068d33f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-5068d33f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:11}}"/>
          <p data-qoder-id="qel-p-dd6c575c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-dd6c575c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:11}}">没有找到匹配的定额条目。试试更短的关键词，或切换专业分类。</p>
          <Button variant="ghost" size="sm" onClick={reset} data-qoder-id="qel-button-9162ad99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-9162ad99&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/QuotaQuery.jsx&quot;,&quot;componentName&quot;:&quot;QuotaQuery&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:11}}">
            清除筛选条件
          </Button>
        </div>
      )}
    </div>
  );
}
