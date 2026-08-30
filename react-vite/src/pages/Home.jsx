import {
  QUOTA_ITEMS,
} from "@/data/bidding";
import { getExpertStats } from "@/data/expertCategories";
import { LawList } from "@/data/fee_standards";
import {
  Button,
  Pill,
  Notice,
  IconCalc,
  IconBook,
  IconUsers,
  IconSearch,
  IconArrowRight,
} from "@/components/ui";

const MODULES = [
  {
    id: "agent-fee",
    title: "招标代理服务费",
    desc: "差累进分段计费，支持货物/服务/工程三类，可输入下浮比例一键测算。",
    icon: IconCalc,
    page: "calculator",
    index: "01",
    tag: "计算器",
  },
  {
    id: "quota",
    title: "定额条目查询",
    desc: "按专业分类检索常用定额，查看计量单位、基价与工料组成。",
    icon: IconSearch,
    page: "quota",
    index: "02",
    tag: "查询",
  },
  {
    id: "expert",
    title: "专家分类速查",
    desc: "工程/货物/服务三大类评标专家专业框架，抽取专家前快速核对口径。",
    icon: IconUsers,
    page: "expert",
    index: "03",
    tag: "查询",
  },
  {
    id: "fee-laws",
    title: "收费文件依据",
    desc: "招标代理、造价咨询、设计、监理等收费文件原文照录，计算器一键跳转。",
    icon: IconBook,
    page: "laws",
    index: "04",
    tag: "文件库",
  },
  {
    id: "calc-hub",
    title: "计算中心",
    desc: "更多费用计算器陆续上线：造价咨询费、设计费、监理费、前期咨询费。",
    icon: IconCalc,
    page: "calculator",
    index: "05",
    tag: "计算器",
  },
  {
    id: "policy",
    title: "政策依据汇总",
    desc: "国家及行业收费政策文件整理，含有效性状态与施行废止日期。",
    icon: IconBook,
    page: "laws",
    index: "06",
    tag: "文件库",
  },
];

export default function Home({ onNavigate, ...qoderProps }) {
  const expertStats = getExpertStats();
  const lawCount = Object.values(LawList).reduce((n, l) => n + l.length, 0);

  const stats = [
    { value: "3", label: "招标类型", sub: "货物 · 服务 · 工程" },
    { value: QUOTA_ITEMS.length.toString(), label: "定额条目", sub: "4 大专业分类" },
    { value: expertStats.specialties.toString(), label: "专家专业", sub: `${expertStats.subcategories} 个二级分类` },
    { value: lawCount.toString(), label: "收费文件", sub: "10 个业务领域" },
  ];

  return (
    <div
      className={["", qoderProps?.className].filter(Boolean).join(" ")}
      data-component="Home"
      data-od-id="home"
      style={qoderProps?.style}
      data-qoder-id={qoderProps?.["data-qoder-id"]}
      data-qoder-source={qoderProps?.["data-qoder-source"]}
    >
      {/* ---------- Hero ---------- */}
      <section className="hero" data-od-id="hero">
        <div className="container">
          <span className="hero-eyebrow">面向招标从业者的实用工具箱</span>
          <h1 className="hero-title">
            招标费用
            <br />
            算得清，查得到
          </h1>
          <p className="hero-sub">
            从代理服务费测算到定额条目查询，从专家分类对照到收费文件原文，
            一站式搞定招标日常高频问题。输入即时出结果，无需注册，数据不离本地。
          </p>
          <div className="hero-actions">
            <Button
              variant="primary"
              onClick={() => onNavigate?.("calculator")}
            >
              开始测算
              <IconArrowRight size={14} />
            </Button>
            <Button variant="ghost" onClick={() => onNavigate?.("calculator")}>
              查看全部工具
            </Button>
          </div>

          {/* dt/dd 让数值与标签形成语义配对；视觉顺序由 CSS column-reverse 保持数字在上 */}
          <dl className="hero-facts">
            {stats.map((s) => (
              <div className="hero-fact" key={s.label}>
                <dt>
                  {s.label}
                  <span className="text-muted"> · {s.sub}</span>
                </dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- 功能模块 ---------- */}
      <section className="section" data-component="Modules" data-od-id="modules">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Features · 功能</span>
            <h2 className="section-title">六大模块，覆盖招标全流程</h2>
            <p className="section-sub">
              围绕招标采购日常工作流设计，从费用测算到政策查询，
              每个工具都聚焦一个具体问题，即用即走。
            </p>
          </div>

          <div className="module-grid">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                // 卡片整体可点击由 .card-link::after 铺满实现，
                // 可访问名只取标题，避免整卡被读成一个超长按钮名
                <article key={m.id} className="card module-card">
                  <div className="module-top">
                    <span className="module-index">{m.index}</span>
                    <span className="module-icon">
                      <Icon size={20} />
                    </span>
                  </div>
                  <h3 className="card-title">
                    <button
                      type="button"
                      className="card-link"
                      onClick={() => onNavigate?.(m.page)}
                    >
                      {m.title}
                    </button>
                    <Pill>{m.tag}</Pill>
                  </h3>
                  <p className="module-desc">{m.desc}</p>
                  <span className="module-go">
                    立即使用
                    <IconArrowRight size={13} />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 政策依据 ---------- */}
      <section
        className="section section--warm"
        data-component="Policy Basis"
        data-od-id="policy-basis"
      >
        <div className="container">
          <div className="section-head">
            <span className="kicker">Basis · 收费依据</span>
            <h2 className="section-title">所有计算均有文件可依</h2>
            <p className="section-sub">
              测算逻辑严格对应国家及行业收费文件，附原文照录，
              结果透明可追溯。
            </p>
          </div>

          <div className="policy-grid">
            <article className="card policy-card">
              <div className="module-top">
                <h3 className="card-title">
                  <span className="module-icon">
                    <IconBook size={18} />
                  </span>
                  <button
                    type="button"
                    className="card-link"
                    onClick={() => onNavigate?.("laws")}
                  >
                    招标代理服务收费
                  </button>
                </h3>
              </div>
              <p>
                计价格〔2002〕1980号《招标代理服务收费管理暂行办法》
                附表差累进费率，发改价格〔2011〕534号调整。
                2015年发改价格〔2015〕299号起实行市场调节价，
                费率表作为历史参考标准提供测算参考。
              </p>
              <span className="module-go">
                查看原文
                <IconArrowRight size={13} />
              </span>
            </article>

            <article className="card policy-card">
              <div className="module-top">
                <h3 className="card-title">
                  <span className="module-icon">
                    <IconUsers size={18} />
                  </span>
                  <button
                    type="button"
                    className="card-link"
                    onClick={() => onNavigate?.("expert")}
                  >
                    评标专家专业分类
                  </button>
                </h3>
              </div>
              <p>
                参照《公共资源交易评标专家专业分类标准》
                （发改法规〔2018〕316号）三大类框架整理，
                覆盖工程、货物、服务主要评标专业方向，
                抽取专家前快速核对专业口径。
              </p>
              <span className="module-go">
                浏览分类
                <IconArrowRight size={13} />
              </span>
            </article>
          </div>

          <div className="mt-24">
            <Notice>
              <b>使用说明：</b>
              本工具提供的费率标准、定额数据与专家分类均为参考用途，
              不构成任何收费、报价或决策依据。正式业务请以最新有效文件、
              当地主管部门规定及合同约定为准。
            </Notice>
          </div>
        </div>
      </section>
    </div>
  );
}
