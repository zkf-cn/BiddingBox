import { useMemo, useState } from "react";
import {
  CALCULATORS,
  AGENT_REF_STANDARDS,
  COST_STANDARDS,
  DESIGN_10_POINTS,
  DESIGN_COMPLEXITY,
  SUPERVISION_670_POINTS,
  SUPERVISION_REF_STANDARDS,
  PRE_1283_TYPES,
  PRE_1283_BANDS,
  PRE_1283_LOW_NOTE,
  BUILDMGMT_504_BANDS,
  BUILDMGMT_504_RATES,
  EIA_125_TYPES,
  EIA_125_BANDS,
  DAIBUILD_613_BANDS,
  DAIBUILD_613_RATES,
  TX_150_CATEGORIES,
  TX_150_NOTES,
  calcProgressive,
  calcInterpolate,
  findBandRange,
} from "@/data/feeStandards";
import { FEE_POLICY } from "@/data/bidding";
import AgentFeeCalculator from "@/pages/AgentFeeCalculator";
import {
  Button,
  Input,
  Notice,
  Pill,
  IconEmpty,
  LiveResult,
} from "@/components/ui";

const fmt = (n, digits = 2) =>
  n.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 4,
  });

const fmtRange = ([lo, hi]) => (hi == null ? `≥ ${fmt(lo)}` : `${fmt(lo)} – ${fmt(hi)}`);

/** 差额定率分档累进（费率以‰存储） */
function calcMille(amount, bands, rates) {
  let lower = 0;
  const breakdown = [];
  let total = 0;
  for (let i = 0; i < bands.length; i++) {
    if (amount > lower && rates[i] != null) {
      const segAmount = Math.min(amount, bands[i].upper) - lower;
      const segFee = (segAmount * rates[i]) / 1000;
      breakdown.push({ label: bands[i].label, rate: rates[i], segAmount, segFee });
      total += segFee;
    }
    lower = bands[i].upper;
    if (amount <= lower) break;
  }
  return { total, breakdown };
}

/* ---------- 面板外壳 ---------- */
function Panel({ title, meta, children, ...qoderProps }) {
  return (
    <section data-component="Calc Panel" data-od-id="calc-panel" style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="panel-head" data-qoder-id="qel-panel-head-a0137eb7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-head-a0137eb7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;Panel&quot;,&quot;elementRole&quot;:&quot;panel-head&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:7}}">
        <h2 className="panel-title" data-qoder-id="qel-panel-title-0cffe30d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-title-0cffe30d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;Panel&quot;,&quot;elementRole&quot;:&quot;panel-title&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:9}}">{title}</h2>
        <div className="panel-meta" data-qoder-id="qel-panel-meta-fc611556" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-meta-fc611556&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;Panel&quot;,&quot;elementRole&quot;:&quot;panel-meta&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:9}}">{meta}</div>
      </div>
      {children}
    </section>
  );
}

function LawButton({ onOpenLaw, lawId }) {
  if (!onOpenLaw || !lawId) return null;
  return (
    <Button variant="ghost" size="sm" onClick={() => onOpenLaw(lawId)} data-qoder-id="qel-button-c84c28ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-c84c28ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;LawButton&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:71,&quot;column&quot;:5}}">
      查看原文
    </Button>
  );
}

/* ---------- 差累进面板（%） ---------- */
function ProgressivePanel({ bands, services, defaultService, doc, note, ...qoderProps }) {
  const [amount, setAmount] = useState("1000");
  const [serviceId, setServiceId] = useState(defaultService ?? services[0].id);
  const service = services.find((s) => s.id === serviceId);

  const amountNum = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    if (service.minBase && amountNum < service.minBase) return { belowMin: true };
    const rates = service.rates.map((r) => (r == null ? 0 : r));
    return calcProgressive(amountNum, bands, rates);
  }, [valid, amountNum, service, bands]);

  return (
    <div className={["calc-layout", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="card calc-form" data-qoder-id="qel-card-fb9eb1e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-fb9eb1e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:95,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-40eca447" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-40eca447&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:96,&quot;column&quot;:9}}">Input · 测算条件</span>
        <Input
          id="pg-amount"
          label={service.baseLabel ?? "计费基数（建安工程费用）"}
          unit="万元"
          type="text"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="例如 1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!valid ? "请输入大于 0 的有效金额" : undefined}
         data-qoder-id="qel-pg-amount-2694fb81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pg-amount-2694fb81&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;pg-amount&quot;,&quot;loc&quot;:{&quot;line&quot;:97,&quot;column&quot;:9}}"/>
        {services.length > 1 && (
          <div className="field" data-qoder-id="qel-field-df7be192" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-df7be192&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:11}}">
            <span className="field-label" id="hub-field-label-1" data-qoder-id="qel-field-label-17462651" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-17462651&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:13}}">服务类型</span>
            <div role="group" aria-labelledby="hub-field-label-1" className="chip-row" data-qoder-id="qel-chip-row-c92627cf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-row-c92627cf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;chip-row&quot;,&quot;loc&quot;:{&quot;line&quot;:113,&quot;column&quot;:13}}">
              {services.map((s) => (
                <Button key={s.id} variant="chip" active={serviceId === s.id} onClick={() => setServiceId(s.id)} data-qoder-id="qel-button-3fa62076" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-3fa62076&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:17}}">
                  {s.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        {note && <Notice data-qoder-id="qel-notice-7d5a08cf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-7d5a08cf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:122,&quot;column&quot;:18}}">{note}</Notice>}
      </div>

      <div className="card" data-qoder-id="qel-card-7fccc4d1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-7fccc4d1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-3370641e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-3370641e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:9}}">Output · 测算结果</span>
        <p className="card-sub" data-qoder-id="qel-card-sub-c4ca2e1d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-sub-c4ca2e1d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;card-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:9}}">
          {service.name} · {doc} · 差额定率分档累进
        </p>
        {result && !result.belowMin ? (
          <>
            <LiveResult className="mt-16 result-hero" data-qoder-id="qel-mt-16-7608b537" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-7608b537&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:13}}">
              <span className="result-value" data-qoder-id="qel-result-value-5399a43f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-5399a43f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:15}}">{fmt(result.total)}</span>
              <span className="result-unit" data-qoder-id="qel-result-unit-42706b4a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-unit-42706b4a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;result-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:15}}">万元</span>
            </LiveResult>
            <div className="calc-divider"  data-qoder-id="qel-calc-divider-a8e77e4f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-divider-a8e77e4f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;calc-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:13}}"/>
            <div className="table-wrap" data-qoder-id="qel-table-wrap-e15aeccc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-e15aeccc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:13}}">
              <div className="table-scroll" tabIndex={0} role="region" aria-label="差累进分段明细（可横向滚动）" data-qoder-id="qel-table-scroll-31317a5c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-31317a5c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:15}}">
                <table className="data" aria-label="差累进分段明细" data-qoder-id="qel-table-4dca417c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-4dca417c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:17}}">
                  <thead data-qoder-id="qel-thead-dad61783" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-dad61783&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:19}}">
                    <tr data-qoder-id="qel-tr-3f18d46e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-3f18d46e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:141,&quot;column&quot;:21}}">
                      <th scope="col" data-qoder-id="qel-th-cf89b17d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-cf89b17d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:142,&quot;column&quot;:23}}">计费区间</th>
                      <th scope="col" className="num" data-qoder-id="qel-num-73efffd4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-73efffd4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:23}}">费率</th>
                      <th scope="col" className="num" data-qoder-id="qel-num-74f00167" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-74f00167&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:144,&quot;column&quot;:23}}">该段基数（万元）</th>
                      <th scope="col" className="num" data-qoder-id="qel-num-71f23b45" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-71f23b45&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:145,&quot;column&quot;:23}}">该段收费（万元）</th>
                    </tr>
                  </thead>
                  <tbody data-qoder-id="qel-tbody-e699d976" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-e699d976&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:19}}">
                    {result.breakdown
                      .filter((row) => row.segAmount > 0 && row.rate > 0)
                      .map((row) => (
                        <tr key={row.label} data-qoder-id="qel-tr-451b1c77" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-451b1c77&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:25}}">
                          <td data-qoder-id="qel-td-ec791f28" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-ec791f28&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:27}}">{row.label}</td>
                          <td className="num" data-qoder-id="qel-num-20f3e345" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-20f3e345&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:27}}">{row.rate}%</td>
                          <td className="num" data-qoder-id="qel-num-1ff3e1b2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-1ff3e1b2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:27}}">{fmt(row.segAmount)}</td>
                          <td className="num" data-qoder-id="qel-num-1ef3e01f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-1ef3e01f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:27}}">{fmt(row.segFee)}</td>
                        </tr>
                      ))}
                    <tr className="total-row" data-qoder-id="qel-total-row-2b8f5593" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-total-row-2b8f5593&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;total-row&quot;,&quot;loc&quot;:{&quot;line&quot;:159,&quot;column&quot;:21}}">
                      <td data-qoder-id="qel-td-e7791749" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-e7791749&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:23}}">合计</td>
                      <td className="num" data-qoder-id="qel-num-23f3e7fe" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-23f3e7fe&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:23}}">—</td>
                      <td className="num" data-qoder-id="qel-num-1b00a5c6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-1b00a5c6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:162,&quot;column&quot;:23}}">{fmt(amountNum)}</td>
                      <td className="num" data-qoder-id="qel-num-1c00a759" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-1c00a759&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:163,&quot;column&quot;:23}}">{fmt(result.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="empty mt-16" data-qoder-id="qel-empty-d1643496" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-d1643496&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:171,&quot;column&quot;:11}}">
            <IconEmpty  data-qoder-id="qel-iconempty-2e6e27bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-2e6e27bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:172,&quot;column&quot;:13}}"/>
            <p data-qoder-id="qel-p-7650a6ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-7650a6ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;ProgressivePanel&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:173,&quot;column&quot;:13}}">{result?.belowMin ? service.minNote : "请输入有效的计费基数后查看分段测算结果。"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 造价咨询面板（‰，六标准切换 + 专业系数） ---------- */
function CostCalc({ onOpenLaw }) {
  const [stdId, setStdId] = useState(COST_STANDARDS[0].id);
  const std = COST_STANDARDS.find((s) => s.id === stdId);
  const [itemNo, setItemNo] = useState(std.items[0].no);
  const [coefName, setCoefName] = useState("其他工程");
  const [amount, setAmount] = useState("1000");

  const item = std.items.find((i) => i.no === itemNo) ?? std.items[0];
  const coef = std.coefficients.find((c) => c.name === coefName)?.value ?? 1;

  const amountNum = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;

  const result = useMemo(() => {
    if (!valid || item.fixed) return null;
    if (item.minBase && amountNum < item.minBase) return { belowMin: true };
    return calcMille(amountNum, std.bands, item.rates);
  }, [valid, amountNum, item, std]);

  const pickStd = (id) => {
    const next = COST_STANDARDS.find((s) => s.id === id);
    setStdId(id);
    setItemNo(next.items[0].no);
    setCoefName("其他工程");
  };

  return (
    <Panel
      title="造价咨询服务费"
      meta={
        <>
          {COST_STANDARDS.map((s) => (
            <Button key={s.id} variant="chip" active={stdId === s.id} onClick={() => pickStd(s.id)} data-qoder-id="qel-button-70af7cbd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-70af7cbd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:214,&quot;column&quot;:13}}">
              {s.doc}
            </Button>
          ))}
          <LawButton onOpenLaw={onOpenLaw} lawId={std.lawId}  data-qoder-id="qel-lawbutton-a66577f6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-a66577f6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:218,&quot;column&quot;:11}}"/>
        </>
      }
     data-qoder-id="qel-panel-b9ac8118" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-b9ac8118&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:209,&quot;column&quot;:5}}">
      <div className="calc-layout" data-qoder-id="qel-calc-layout-b5eb82dc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-layout-b5eb82dc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;calc-layout&quot;,&quot;loc&quot;:{&quot;line&quot;:222,&quot;column&quot;:7}}">
        <div className="card calc-form" data-qoder-id="qel-card-7eb2395f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-7eb2395f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:223,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-b2ea9b51" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-b2ea9b51&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:224,&quot;column&quot;:11}}">Input · 测算条件</span>
          {!item.fixed && (
            <Input
              id="cost-amount"
              label={`计费基数（${item.base}）`}
              unit="万元"
              type="text"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="例如 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={!valid ? "请输入大于 0 的有效金额" : undefined}
             data-qoder-id="qel-cost-amount-87100791" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-cost-amount-87100791&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;cost-amount&quot;,&quot;loc&quot;:{&quot;line&quot;:226,&quot;column&quot;:13}}"/>
          )}
          <div className="field" data-qoder-id="qel-field-64364a35" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-64364a35&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:240,&quot;column&quot;:11}}">
            <span className="field-label" id="hub-field-label-2" data-qoder-id="qel-field-label-7462dc98" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-7462dc98&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:241,&quot;column&quot;:13}}">咨询项目</span>
            <div role="group" aria-labelledby="hub-field-label-2" className="chip-row chip-row--scroll" data-qoder-id="qel-chip-row-01140366" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-row-01140366&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;chip-row&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:13}}">
              {std.items.map((i) => (
                <Button key={i.no} variant="chip" active={itemNo === i.no} onClick={() => setItemNo(i.no)} data-qoder-id="qel-button-61ad2689" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-61ad2689&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:17}}">
                  {i.name}
                </Button>
              ))}
            </div>
          </div>
          {std.coefficients.length > 0 && !item.fixed && (
            <div className="field" data-qoder-id="qel-field-603643e9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-603643e9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:251,&quot;column&quot;:13}}">
              <span className="field-label" id="hub-field-label-3" data-qoder-id="qel-field-label-7862e2e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-7862e2e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:252,&quot;column&quot;:15}}">
                专业调整系数
                <span className="field-hint" data-qoder-id="qel-field-hint-3a14c3e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-hint-3a14c3e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;field-hint&quot;,&quot;loc&quot;:{&quot;line&quot;:254,&quot;column&quot;:17}}">当前 ×{coef}</span>
              </span>
              <div role="group" aria-labelledby="hub-field-label-3" className="chip-row chip-row--scroll" data-qoder-id="qel-chip-row-0e1417dd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-row-0e1417dd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;chip-row&quot;,&quot;loc&quot;:{&quot;line&quot;:256,&quot;column&quot;:15}}">
                {std.coefficients.map((c) => (
                  <Button key={c.name} variant="chip" active={coefName === c.name} onClick={() => setCoefName(c.name)} data-qoder-id="qel-button-deaa19b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-deaa19b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:258,&quot;column&quot;:19}}">
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {std.notes.map((n, i) => (
            <Notice key={i} data-qoder-id="qel-notice-e48dd8a6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-e48dd8a6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:266,&quot;column&quot;:13}}">{n}</Notice>
          ))}
        </div>

        <div className="card" data-qoder-id="qel-card-efb76870" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-efb76870&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:270,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-37edab47" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-37edab47&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:271,&quot;column&quot;:11}}">Output · 测算结果</span>
          <p className="card-sub" data-qoder-id="qel-card-sub-10af799c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-sub-10af799c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;card-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:272,&quot;column&quot;:11}}">
            {item.no} · {item.name} · {std.doc} · 计费基数：{item.base}
          </p>
          {item.fixed ? (
            <div className="mt-16" data-qoder-id="qel-mt-16-e24f4822" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-e24f4822&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:276,&quot;column&quot;:13}}">
              <div className="result-hero" data-qoder-id="qel-result-hero-6b730202" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-hero-6b730202&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-hero&quot;,&quot;loc&quot;:{&quot;line&quot;:277,&quot;column&quot;:15}}">
                <span className="result-value" style={{ fontSize: 34 }} data-qoder-id="qel-result-value-fb21fd3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-fb21fd3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:278,&quot;column&quot;:17}}">{item.fixed}</span>
              </div>
              <p className="result-sub" data-qoder-id="qel-result-sub-1bfe5431" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-1bfe5431&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:280,&quot;column&quot;:15}}">该项目按固定计价执行，不参与差累进计算。</p>
              {item.extra && <p className="result-sub" data-qoder-id="qel-result-sub-1afe529e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-1afe529e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:281,&quot;column&quot;:30}}">{item.extra}</p>}
            </div>
          ) : result && !result.belowMin ? (
            <>
              <LiveResult className="mt-16 result-hero" data-qoder-id="qel-mt-16-d94cfb60" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-d94cfb60&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:285,&quot;column&quot;:15}}">
                <span className="result-value" data-qoder-id="qel-result-value-fd243efc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-fd243efc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:286,&quot;column&quot;:17}}">{fmt(result.total * coef)}</span>
                <span className="result-unit" data-qoder-id="qel-result-unit-ce302472" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-unit-ce302472&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:287,&quot;column&quot;:17}}">万元</span>
              </LiveResult>
              <p className="result-sub" data-qoder-id="qel-result-sub-10fc0449" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-10fc0449&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:289,&quot;column&quot;:15}}">
                累进基价 <b data-qoder-id="qel-b-350b05e8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-350b05e8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:290,&quot;column&quot;:22}}">{fmt(result.total)} 万元</b> × 专业系数 <b data-qoder-id="qel-b-360b077b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-360b077b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:290,&quot;column&quot;:59}}">{coef}</b>
              </p>
              {item.extra && <p className="result-sub" data-qoder-id="qel-result-sub-13fc0902" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-13fc0902&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:292,&quot;column&quot;:30}}">{item.extra}</p>}
              <div className="calc-divider"  data-qoder-id="qel-calc-divider-f4a88c3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-divider-f4a88c3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;calc-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:293,&quot;column&quot;:15}}"/>
              <div className="table-wrap" data-qoder-id="qel-table-wrap-9612dedc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-9612dedc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:294,&quot;column&quot;:15}}">
                <div className="table-scroll" tabIndex={0} role="region" aria-label="差累进分段明细（可横向滚动）" data-qoder-id="qel-table-scroll-9b93e04c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-9b93e04c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:295,&quot;column&quot;:17}}">
                  <table className="data" aria-label="差累进分段明细" data-qoder-id="qel-table-9f9545a3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-9f9545a3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:296,&quot;column&quot;:19}}">
                    <thead data-qoder-id="qel-thead-ef23ee54" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-ef23ee54&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:297,&quot;column&quot;:21}}">
                      <tr data-qoder-id="qel-tr-26fbbd09" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-26fbbd09&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:298,&quot;column&quot;:23}}">
                        <th scope="col" data-qoder-id="qel-th-69d68b8e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-69d68b8e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:299,&quot;column&quot;:25}}">计费区间</th>
                        <th scope="col" className="num" data-qoder-id="qel-num-fbddbd45" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-fbddbd45&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:300,&quot;column&quot;:25}}">费率</th>
                        <th scope="col" className="num" data-qoder-id="qel-num-faddbbb2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-faddbbb2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:301,&quot;column&quot;:25}}">该段基数（万元）</th>
                        <th scope="col" className="num" data-qoder-id="qel-num-f9ddba1f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-f9ddba1f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:302,&quot;column&quot;:25}}">该段收费（万元）</th>
                      </tr>
                    </thead>
                    <tbody data-qoder-id="qel-tbody-a5ca7092" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-a5ca7092&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:305,&quot;column&quot;:21}}">
                      {result.breakdown
                        .filter((row) => row.segAmount > 0 && row.rate != null)
                        .map((row) => (
                          <tr key={row.label} data-qoder-id="qel-tr-2cfbc67b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-2cfbc67b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:309,&quot;column&quot;:27}}">
                            <td data-qoder-id="qel-td-8152d498" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-8152d498&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:310,&quot;column&quot;:29}}">{row.label}</td>
                            <td className="num" data-qoder-id="qel-num-8330ec2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-8330ec2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:311,&quot;column&quot;:29}}">{row.rate}‰</td>
                            <td className="num" data-qoder-id="qel-num-8430edbf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-8430edbf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:312,&quot;column&quot;:29}}">{fmt(row.segAmount)}</td>
                            <td className="num" data-qoder-id="qel-num-8530ef52" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-8530ef52&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:313,&quot;column&quot;:29}}">{fmt(row.segFee)}</td>
                          </tr>
                        ))}
                      <tr className="total-row" data-qoder-id="qel-total-row-550826aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-total-row-550826aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;total-row&quot;,&quot;loc&quot;:{&quot;line&quot;:316,&quot;column&quot;:23}}">
                        <td data-qoder-id="qel-td-9050ad9e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-9050ad9e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:317,&quot;column&quot;:25}}">合计</td>
                        <td className="num" data-qoder-id="qel-num-8030e773" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-8030e773&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:318,&quot;column&quot;:25}}">—</td>
                        <td className="num" data-qoder-id="qel-num-8130e906" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-8130e906&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:319,&quot;column&quot;:25}}">{fmt(amountNum)}</td>
                        <td className="num" data-qoder-id="qel-num-8230ea99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-8230ea99&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:320,&quot;column&quot;:25}}">{fmt(result.total * coef)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="empty mt-16" data-qoder-id="qel-empty-a918bcac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-a918bcac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:328,&quot;column&quot;:13}}">
              <IconEmpty  data-qoder-id="qel-iconempty-c49fb995" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-c49fb995&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:329,&quot;column&quot;:15}}"/>
              <p data-qoder-id="qel-p-8fdff6b6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-8fdff6b6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CostCalc&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:330,&quot;column&quot;:15}}">{result?.belowMin ? item.minNote : "请输入有效的计费基数后查看分段测算结果。"}</p>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* ---------- 直线内插面板 ---------- */
function InterpolatePanel({ points, doc, withComplexity, note, ...qoderProps }) {
  const [amount, setAmount] = useState("3000");
  const [complexity, setComplexity] = useState(1.0);

  const amountNum = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;
  const base = valid ? calcInterpolate(amountNum, points) : null;
  const fee = base != null ? base * complexity : null;

  return (
    <div className={["calc-layout", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="card calc-form" data-qoder-id="qel-card-3ca0f1e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-3ca0f1e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:351,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-1667bb51" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-1667bb51&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:352,&quot;column&quot;:9}}">Input · 测算条件</span>
        <Input
          id="ip-amount"
          label="计费额"
          unit="万元"
          type="text"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="例如 3000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!valid ? "请输入大于 0 的有效金额" : undefined}
         data-qoder-id="qel-ip-amount-28542101" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-ip-amount-28542101&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;ip-amount&quot;,&quot;loc&quot;:{&quot;line&quot;:353,&quot;column&quot;:9}}"/>
        {withComplexity && (
          <div className="field" data-qoder-id="qel-field-e785ad69" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-e785ad69&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:367,&quot;column&quot;:11}}">
            <span className="field-label" id="hub-field-label-4" data-qoder-id="qel-field-label-598362ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-598362ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:368,&quot;column&quot;:13}}">
              工程复杂程度调整系数
              <span className="field-hint" data-qoder-id="qel-field-hint-9d436a16" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-hint-9d436a16&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;field-hint&quot;,&quot;loc&quot;:{&quot;line&quot;:370,&quot;column&quot;:15}}">计价格〔2002〕10号</span>
            </span>
            <div role="group" aria-labelledby="hub-field-label-4" className="chip-row" data-qoder-id="qel-chip-row-f4e42e63" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-row-f4e42e63&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;chip-row&quot;,&quot;loc&quot;:{&quot;line&quot;:372,&quot;column&quot;:13}}">
              {DESIGN_COMPLEXITY.map((c) => (
                <Button key={c.value} variant="chip" active={complexity === c.value} onClick={() => setComplexity(c.value)} data-qoder-id="qel-button-3becee7a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-3becee7a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:374,&quot;column&quot;:17}}">
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        {note && <Notice data-qoder-id="qel-notice-aa45e2dc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-aa45e2dc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:381,&quot;column&quot;:18}}">{note}</Notice>}
      </div>

      <div className="card" data-qoder-id="qel-card-a3a3d2a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-a3a3d2a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:384,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-976ac4fb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-976ac4fb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:385,&quot;column&quot;:9}}">Output · 测算结果</span>
        <p className="card-sub" data-qoder-id="qel-card-sub-5512fb64" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-sub-5512fb64&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;card-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:386,&quot;column&quot;:9}}">{doc} · 收费基价表直线内插</p>
        {base != null ? (
          <>
            <LiveResult className="mt-16 result-hero" data-qoder-id="qel-mt-16-b41d400c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-b41d400c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:389,&quot;column&quot;:13}}">
              <span className="result-value" data-qoder-id="qel-result-value-5da29a7a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-5da29a7a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:390,&quot;column&quot;:15}}">{fmt(withComplexity ? fee : base)}</span>
              <span className="result-unit" data-qoder-id="qel-result-unit-0820ff2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-unit-0820ff2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;result-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:391,&quot;column&quot;:15}}">万元</span>
            </LiveResult>
            <p className="result-sub" data-qoder-id="qel-result-sub-2ed6b707" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-2ed6b707&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:393,&quot;column&quot;:13}}">
              收费基价 <b data-qoder-id="qel-b-675b90cc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-675b90cc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:394,&quot;column&quot;:20}}">{fmt(base)} 万元</b>
              {withComplexity && (
                <>
                  {" "}× 复杂程度系数 <b data-qoder-id="qel-b-685b925f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-685b925f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:397,&quot;column&quot;:33}}">{complexity}</b>
                </>
              )}
            </p>
            <div className="calc-divider"  data-qoder-id="qel-calc-divider-3f05506b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-divider-3f05506b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;calc-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:401,&quot;column&quot;:13}}"/>
            <Notice data-qoder-id="qel-notice-bb4cb964" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-bb4cb964&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:402,&quot;column&quot;:13}}">
              计费额处于表中两档之间的，采用直线内插法确定基价；最终收费还应结合专业
              调整系数、附加调整系数及合同约定，本结果仅供测算参考。
            </Notice>
          </>
        ) : (
          <div className="empty mt-16" data-qoder-id="qel-empty-0839d7b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-0839d7b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:408,&quot;column&quot;:11}}">
            <IconEmpty  data-qoder-id="qel-iconempty-f5d70eea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-f5d70eea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:409,&quot;column&quot;:13}}"/>
            <p data-qoder-id="qel-p-dff9b52b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-dff9b52b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;InterpolatePanel&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:410,&quot;column&quot;:13}}">请输入有效的计费额后查看内插测算结果。</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 分档区间面板 ---------- */
function RangeBandPanel({ bands, types, doc, lowNote, amountUnit, ...qoderProps }) {
  const [amount, setAmount] = useState("10000");
  const [typeId, setTypeId] = useState(types[0].id);
  const typeIndex = types.findIndex((t) => t.id === typeId);

  const amountNum = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;

  const band = valid ? findBandRange(amountNum, bands) : null;
  const below = valid && amountNum <= bands[0].lower;
  const feeRange = band ? band.fees[typeIndex] : null;

  return (
    <div className={["calc-layout", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="card calc-form" data-qoder-id="qel-card-a3732e33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-a3732e33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:433,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-6948b1ec" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-6948b1ec&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:434,&quot;column&quot;:9}}">Input · 测算条件</span>
        <Input
          id="rb-amount"
          label="建设项目估算投资额"
          unit={amountUnit ?? "万元"}
          type="text"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="例如 10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!valid ? "请输入大于 0 的有效金额" : undefined}
         data-qoder-id="qel-rb-amount-2d989967" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rb-amount-2d989967&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;rb-amount&quot;,&quot;loc&quot;:{&quot;line&quot;:435,&quot;column&quot;:9}}"/>
        <div className="field" data-qoder-id="qel-field-0946b954" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-0946b954&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:448,&quot;column&quot;:9}}">
          <span className="field-label" id="hub-field-label-5" data-qoder-id="qel-field-label-704f25c0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-704f25c0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:449,&quot;column&quot;:11}}">咨询事项</span>
          <div role="group" aria-labelledby="hub-field-label-5" className="chip-row" data-qoder-id="qel-chip-row-fad88172" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-row-fad88172&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;chip-row&quot;,&quot;loc&quot;:{&quot;line&quot;:450,&quot;column&quot;:11}}">
            {types.map((t) => (
              <Button key={t.id} variant="chip" active={typeId === t.id} onClick={() => setTypeId(t.id)} data-qoder-id="qel-button-12e55cbf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-12e55cbf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:452,&quot;column&quot;:15}}">
                {t.name}
              </Button>
            ))}
          </div>
        </div>
        <Notice data-qoder-id="qel-notice-34387a2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-34387a2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:458,&quot;column&quot;:9}}">
          {doc}
          按投资额分档给出收费区间，具体数额由双方在区间内协商确定。
        </Notice>
      </div>

      <div className="card" data-qoder-id="qel-card-9f70e950" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-9f70e950&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:464,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-6746702f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-6746702f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:465,&quot;column&quot;:9}}">Output · 测算结果</span>
        <p className="card-sub" data-qoder-id="qel-card-sub-3ef81320" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-sub-3ef81320&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;card-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:466,&quot;column&quot;:9}}">
          {types[typeIndex].name} · 命中档位：{band ? band.label : "—"}
        </p>
        {feeRange ? (
          <LiveResult className="mt-16 result-hero" data-qoder-id="qel-mt-16-66c1fd70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-66c1fd70&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:470,&quot;column&quot;:11}}">
            <span className="result-value" data-qoder-id="qel-result-value-47a04a14" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-47a04a14&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:471,&quot;column&quot;:13}}">{fmtRange(feeRange)}</span>
            <span className="result-unit" data-qoder-id="qel-result-unit-77927a06" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-unit-77927a06&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;result-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:472,&quot;column&quot;:13}}">万元</span>
          </LiveResult>
        ) : (
          <div className="empty mt-16" data-qoder-id="qel-empty-2b9e8c3c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-2b9e8c3c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:475,&quot;column&quot;:11}}">
            <IconEmpty  data-qoder-id="qel-iconempty-ced538b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-ced538b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:476,&quot;column&quot;:13}}"/>
            <p data-qoder-id="qel-p-20d878f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-20d878f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:477,&quot;column&quot;:13}}">{below && lowNote ? lowNote : "请输入有效的估算投资额后查看收费区间。"}</p>
          </div>
        )}
        {feeRange && <div className="calc-divider"  data-qoder-id="qel-calc-divider-6da587f9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-divider-6da587f9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;calc-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:480,&quot;column&quot;:22}}"/>}
        {feeRange && (
          <div className="table-wrap" data-qoder-id="qel-table-wrap-50d9ffd2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-50d9ffd2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:482,&quot;column&quot;:11}}">
            <div className="table-scroll" tabIndex={0} role="region" aria-label="各咨询事项收费区间（可横向滚动）" data-qoder-id="qel-table-scroll-7f717584" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-7f717584&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:483,&quot;column&quot;:13}}">
              <table className="data" aria-label="各咨询事项收费区间" data-qoder-id="qel-table-465f148c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-465f148c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:484,&quot;column&quot;:15}}">
                <thead data-qoder-id="qel-thead-d8b5b9bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-d8b5b9bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:485,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-6a49710e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-6a49710e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:486,&quot;column&quot;:19}}">
                    <th scope="col" data-qoder-id="qel-th-db02ce19" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-db02ce19&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:487,&quot;column&quot;:21}}">咨询事项</th>
                    <th scope="col" className="num" data-qoder-id="qel-num-bb117501" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-bb117501&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:488,&quot;column&quot;:21}}">收费区间（万元）</th>
                  </tr>
                </thead>
                <tbody data-qoder-id="qel-tbody-d917e0ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-d917e0ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:491,&quot;column&quot;:17}}">
                  {types.map((t, i) => (
                    <tr key={t.id} style={i === typeIndex ? { fontWeight: 600 } : undefined} data-qoder-id="qel-tr-6a4bafa5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-6a4bafa5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:493,&quot;column&quot;:21}}">
                      <td data-qoder-id="qel-td-89e099f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-89e099f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:494,&quot;column&quot;:23}}">{t.name}</td>
                      <td className="num" data-qoder-id="qel-num-43d23ff9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-43d23ff9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;RangeBandPanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:495,&quot;column&quot;:23}}">{fmtRange(band.fees[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 固定收费面板 ---------- */
function FixedCasePanel({ categories, doc, notes, ...qoderProps }) {
  const [amount, setAmount] = useState("3000");
  const [catId, setCatId] = useState(categories[0].id);
  const cat = categories.find((c) => c.id === catId);

  const amountNum = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;
  const band = valid ? findBandRange(amountNum, cat.bands) : null;

  return (
    <div className={["calc-layout", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="card calc-form" data-qoder-id="qel-card-2737fdb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-2737fdb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:520,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-38e3b4cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-38e3b4cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:521,&quot;column&quot;:9}}">Input · 测算条件</span>
        <Input
          id="fx-amount"
          label="中标金额"
          unit="万元"
          type="text"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="例如 3000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!valid ? "请输入大于 0 的有效金额" : undefined}
         data-qoder-id="qel-fx-amount-13086ed2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fx-amount-13086ed2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;fx-amount&quot;,&quot;loc&quot;:{&quot;line&quot;:522,&quot;column&quot;:9}}"/>
        <div className="field" data-qoder-id="qel-field-b50d5d5f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-b50d5d5f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:535,&quot;column&quot;:9}}">
          <span className="field-label" id="hub-field-label-6" data-qoder-id="qel-field-label-2fbd8831" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-2fbd8831&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:536,&quot;column&quot;:11}}">项目类别</span>
          <div role="group" aria-labelledby="hub-field-label-6" className="chip-row" data-qoder-id="qel-chip-row-3f8b0bcf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chip-row-3f8b0bcf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;chip-row&quot;,&quot;loc&quot;:{&quot;line&quot;:537,&quot;column&quot;:11}}">
            {categories.map((c) => (
              <Button key={c.id} variant="chip" active={catId === c.id} onClick={() => setCatId(c.id)} data-qoder-id="qel-button-28044f12" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-28044f12&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:539,&quot;column&quot;:15}}">
                {c.name}
              </Button>
            ))}
          </div>
        </div>
        <Notice data-qoder-id="qel-notice-ed756545" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-ed756545&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:545,&quot;column&quot;:9}}">{notes}</Notice>
      </div>

      <div className="card" data-qoder-id="qel-card-9b34e2b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-9b34e2b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:548,&quot;column&quot;:7}}">
        <span className="kicker" data-qoder-id="qel-kicker-3ae1795a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-3ae1795a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:549,&quot;column&quot;:9}}">Output · 测算结果</span>
        <p className="card-sub" data-qoder-id="qel-card-sub-b340fb85" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-sub-b340fb85&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;card-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:550,&quot;column&quot;:9}}">
          {doc} · {cat.name} · 命中档位：{band ? band.label : "—"}
        </p>
        {band ? (
          <>
            <LiveResult className="mt-16 result-hero" data-qoder-id="qel-mt-16-61b603b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-61b603b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:555,&quot;column&quot;:13}}">
              <span className="result-value" data-qoder-id="qel-result-value-0717540d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-0717540d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:556,&quot;column&quot;:15}}">{band.fee.toLocaleString("zh-CN")}</span>
              <span className="result-unit" data-qoder-id="qel-result-unit-757bb9ab" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-unit-757bb9ab&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;result-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:557,&quot;column&quot;:15}}">元/宗</span>
            </LiveResult>
            <p className="result-sub" data-qoder-id="qel-result-sub-8799a465" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-8799a465&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:559,&quot;column&quot;:13}}">{cat.payNote}</p>
            <div className="calc-divider"  data-qoder-id="qel-calc-divider-b49a0244" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-divider-b49a0244&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;calc-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:560,&quot;column&quot;:13}}"/>
            <div className="table-wrap" data-qoder-id="qel-table-wrap-4723157b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-4723157b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:561,&quot;column&quot;:13}}">
              <div className="table-scroll" tabIndex={0} role="region" aria-label="交易服务收费标准（可横向滚动）" data-qoder-id="qel-table-scroll-40a7cbcd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-40a7cbcd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:562,&quot;column&quot;:15}}">
                <table className="data" aria-label="交易服务收费标准" data-qoder-id="qel-table-7534007d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-7534007d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:563,&quot;column&quot;:17}}">
                  <thead data-qoder-id="qel-thead-19c7e706" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-19c7e706&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:564,&quot;column&quot;:19}}">
                    <tr data-qoder-id="qel-tr-93e12157" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-93e12157&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:565,&quot;column&quot;:21}}">
                      <th scope="col" data-qoder-id="qel-th-2106ccdc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-2106ccdc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:566,&quot;column&quot;:23}}">中标金额区间</th>
                      <th scope="col" className="num" data-qoder-id="qel-num-38e9a787" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-38e9a787&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:567,&quot;column&quot;:23}}">收费标准（元/宗）</th>
                    </tr>
                  </thead>
                  <tbody data-qoder-id="qel-tbody-ef774d56" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-ef774d56&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:570,&quot;column&quot;:19}}">
                    {cat.bands.map((b) => (
                      <tr key={b.label} style={b.label === band.label ? { fontWeight: 600 } : undefined} data-qoder-id="qel-tr-ffd97c96" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-ffd97c96&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:572,&quot;column&quot;:23}}">
                        <td data-qoder-id="qel-td-675fae79" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-675fae79&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:573,&quot;column&quot;:25}}">{b.label}</td>
                        <td className="num" data-qoder-id="qel-num-aa95ddb2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-aa95ddb2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:574,&quot;column&quot;:25}}">{b.fee.toLocaleString("zh-CN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="empty mt-16" data-qoder-id="qel-empty-e92c286d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-e92c286d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:583,&quot;column&quot;:11}}">
            <IconEmpty  data-qoder-id="qel-iconempty-9996ac22" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-9996ac22&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:584,&quot;column&quot;:13}}"/>
            <p data-qoder-id="qel-p-c1eda8a5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-c1eda8a5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;FixedCasePanel&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:585,&quot;column&quot;:13}}">请输入有效的中标金额后查看收费标准。</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 各计算器 ---------- */

const AGENT_LAW_MAP = {
  national1980: "招标_1",
  minzhaoxie32: "招标_3",
  xiajiaxie05: "招标_4",
};

function AgentCalc({ onOpenLaw }) {
  const [std, setStd] = useState("national1980");
  const options = [
    { id: "national1980", doc: "计价格〔2002〕1980号" },
    ...AGENT_REF_STANDARDS,
  ];
  const current = options.find((o) => o.id === std);
  return (
    <Panel
      title="招标代理服务费"
      meta={
        <>
          {options.map((o) => (
            <Button key={o.id} variant="chip" active={std === o.id} onClick={() => setStd(o.id)} data-qoder-id="qel-button-6c189cdd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-6c189cdd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;AgentCalc&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:614,&quot;column&quot;:13}}">
              {o.doc}
            </Button>
          ))}
          <LawButton onOpenLaw={onOpenLaw} lawId={AGENT_LAW_MAP[std]}  data-qoder-id="qel-lawbutton-3ecfcc4c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-3ecfcc4c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;AgentCalc&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:618,&quot;column&quot;:11}}"/>
        </>
      }
     data-qoder-id="qel-panel-664d3d46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-664d3d46&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;AgentCalc&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:609,&quot;column&quot;:5}}">
      {current.note && (
        <div className="mb-16" data-qoder-id="qel-mb-16-c3d8cf31" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mb-16-c3d8cf31&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;AgentCalc&quot;,&quot;elementRole&quot;:&quot;mb-16&quot;,&quot;loc&quot;:{&quot;line&quot;:623,&quot;column&quot;:9}}">
          <Notice data-qoder-id="qel-notice-8cb22899" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-8cb22899&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;AgentCalc&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:624,&quot;column&quot;:11}}">{current.note}</Notice>
        </div>
      )}
      <AgentFeeCalculator embedded  data-qoder-id="qel-agentfeecalculator-a4974320" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-agentfeecalculator-a4974320&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;AgentCalc&quot;,&quot;elementRole&quot;:&quot;agentfeecalculator&quot;,&quot;loc&quot;:{&quot;line&quot;:627,&quot;column&quot;:7}}"/>
    </Panel>
  );
}

function SupervisionCalc({ onOpenLaw }) {
  const [std, setStd] = useState("fgw670");
  const options = [{ id: "fgw670", doc: "发改价格〔2007〕670号" }, ...SUPERVISION_REF_STANDARDS];
  const current = options.find((o) => o.id === std);
  const lawId = std === "fgw670" ? "监理_1" : "监理_2";
  return (
    <Panel
      title="施工监理服务费"
      meta={
        <>
          {options.map((o) => (
            <Button key={o.id} variant="chip" active={std === o.id} onClick={() => setStd(o.id)} data-qoder-id="qel-button-4716d512" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-4716d512&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;SupervisionCalc&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:643,&quot;column&quot;:13}}">
              {o.doc}
            </Button>
          ))}
          <LawButton onOpenLaw={onOpenLaw} lawId={lawId}  data-qoder-id="qel-lawbutton-35a9907f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-35a9907f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;SupervisionCalc&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:647,&quot;column&quot;:11}}"/>
        </>
      }
     data-qoder-id="qel-panel-b9f40611" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-b9f40611&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;SupervisionCalc&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:638,&quot;column&quot;:5}}">
      {current.note && (
        <div className="mb-16" data-qoder-id="qel-mb-16-253a394a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mb-16-253a394a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;SupervisionCalc&quot;,&quot;elementRole&quot;:&quot;mb-16&quot;,&quot;loc&quot;:{&quot;line&quot;:652,&quot;column&quot;:9}}">
          <Notice data-qoder-id="qel-notice-e4ccbe99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-e4ccbe99&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;SupervisionCalc&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:653,&quot;column&quot;:11}}">{current.note}</Notice>
        </div>
      )}
      <InterpolatePanel points={SUPERVISION_670_POINTS} doc={current.doc}  data-qoder-id="qel-interpolatepanel-26687740" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-interpolatepanel-26687740&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;SupervisionCalc&quot;,&quot;elementRole&quot;:&quot;interpolatepanel&quot;,&quot;loc&quot;:{&quot;line&quot;:656,&quot;column&quot;:7}}"/>
    </Panel>
  );
}

const GROUPS = ["招标与交易", "工程咨询", "管理与代建"];

export default function CalcHub({ onOpenLaw, ...qoderProps }) {
  const [active, setActive] = useState("agent");

  const renderCalc = () => {
    switch (active) {
      case "agent":
        return <AgentCalc onOpenLaw={onOpenLaw}  data-qoder-id="qel-agentcalc-22c34595" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-agentcalc-22c34595&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;agentcalc&quot;,&quot;loc&quot;:{&quot;line&quot;:669,&quot;column&quot;:16}}"/>;
      case "cost":
        return <CostCalc onOpenLaw={onOpenLaw}  data-qoder-id="qel-costcalc-6b701ef6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-costcalc-6b701ef6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;costcalc&quot;,&quot;loc&quot;:{&quot;line&quot;:671,&quot;column&quot;:16}}"/>;
      case "design":
        return (
          <Panel
            title="工程设计服务费"
            meta={
              <>
                <Pill data-qoder-id="qel-pill-1fe632f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-1fe632f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:678,&quot;column&quot;:17}}">计价格〔2002〕10号</Pill>
                <LawButton onOpenLaw={onOpenLaw} lawId="设计_1"  data-qoder-id="qel-lawbutton-d06a4157" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-d06a4157&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:679,&quot;column&quot;:17}}"/>
              </>
            }
           data-qoder-id="qel-panel-2406c0b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-2406c0b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:674,&quot;column&quot;:11}}">
            <InterpolatePanel points={DESIGN_10_POINTS} doc="计价格〔2002〕10号" withComplexity  data-qoder-id="qel-interpolatepanel-d09c8116" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-interpolatepanel-d09c8116&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;interpolatepanel&quot;,&quot;loc&quot;:{&quot;line&quot;:683,&quot;column&quot;:13}}"/>
          </Panel>
        );
      case "supervision":
        return <SupervisionCalc onOpenLaw={onOpenLaw}  data-qoder-id="qel-supervisioncalc-512a523d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-supervisioncalc-512a523d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;supervisioncalc&quot;,&quot;loc&quot;:{&quot;line&quot;:687,&quot;column&quot;:16}}"/>;
      case "preconsult":
        return (
          <Panel
            title="前期工作咨询费"
            meta={
              <>
                <Pill data-qoder-id="qel-pill-26e63df5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-26e63df5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:694,&quot;column&quot;:17}}">计价格〔1999〕1283号</Pill>
                <LawButton onOpenLaw={onOpenLaw} lawId="前期_1"  data-qoder-id="qel-lawbutton-cb6a3978" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-cb6a3978&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:695,&quot;column&quot;:17}}"/>
              </>
            }
           data-qoder-id="qel-panel-1f06b8d6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-1f06b8d6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:690,&quot;column&quot;:11}}">
            <RangeBandPanel
              bands={PRE_1283_BANDS}
              types={PRE_1283_TYPES}
              doc="计价格〔1999〕1283号"
              lowNote={PRE_1283_LOW_NOTE}
             data-qoder-id="qel-rangebandpanel-437042b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rangebandpanel-437042b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;rangebandpanel&quot;,&quot;loc&quot;:{&quot;line&quot;:699,&quot;column&quot;:13}}"/>
          </Panel>
        );
      case "eia":
        return (
          <Panel
            title="环境影响咨询费"
            meta={
              <>
                <Pill data-qoder-id="qel-pill-3ae41eda" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-3ae41eda&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:713,&quot;column&quot;:17}}">计价格〔2002〕125号</Pill>
                <LawButton onOpenLaw={onOpenLaw} lawId="环境_1"  data-qoder-id="qel-lawbutton-cd67fe07" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-cd67fe07&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:714,&quot;column&quot;:17}}"/>
              </>
            }
           data-qoder-id="qel-panel-2b06cbba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-2b06cbba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:709,&quot;column&quot;:11}}">
            <RangeBandPanel
              bands={EIA_125_BANDS}
              types={EIA_125_TYPES}
              doc="计价格〔2002〕125号"
              amountUnit="亿元"
             data-qoder-id="qel-rangebandpanel-476e0a6a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rangebandpanel-476e0a6a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;rangebandpanel&quot;,&quot;loc&quot;:{&quot;line&quot;:718,&quot;column&quot;:13}}"/>
          </Panel>
        );
      case "buildmgmt":
        return (
          <Panel
            title="项目建设管理费"
            meta={
              <>
                <Pill data-qoder-id="qel-pill-36e4188e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-36e4188e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:732,&quot;column&quot;:17}}">财建〔2016〕504号</Pill>
                <LawButton onOpenLaw={onOpenLaw} lawId="基建_1"  data-qoder-id="qel-lawbutton-c967f7bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-c967f7bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:733,&quot;column&quot;:17}}"/>
              </>
            }
           data-qoder-id="qel-panel-21047d65" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-21047d65&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:728,&quot;column&quot;:11}}">
            <ProgressivePanel
              bands={BUILDMGMT_504_BANDS}
              services={[{ id: "mgmt", name: "项目建设管理费", rates: BUILDMGMT_504_RATES }]}
              doc="财建〔2016〕504号"
              note="总额控制数以批准的项目总投资（不含项目建设管理费）扣除土地征用、迁移补偿等取得或租用土地使用权的费用为基数分档计算。"
             data-qoder-id="qel-progressivepanel-bfb5b494" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-progressivepanel-bfb5b494&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;progressivepanel&quot;,&quot;loc&quot;:{&quot;line&quot;:737,&quot;column&quot;:13}}"/>
          </Panel>
        );
      case "daibuild":
        return (
          <Panel
            title="项目代建管理费"
            meta={
              <>
                <Pill data-qoder-id="qel-pill-32e41242" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-32e41242&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:751,&quot;column&quot;:17}}">闽发改法规〔2015〕613号</Pill>
                <LawButton onOpenLaw={onOpenLaw} lawId="代建_1"  data-qoder-id="qel-lawbutton-c567f16f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-c567f16f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:752,&quot;column&quot;:17}}"/>
              </>
            }
           data-qoder-id="qel-panel-1d047719" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-1d047719&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:747,&quot;column&quot;:11}}">
            <ProgressivePanel
              bands={DAIBUILD_613_BANDS}
              services={[{ id: "db", name: "代建管理费限额", rates: DAIBUILD_613_RATES }]}
              doc="闽发改法规〔2015〕613号"
              note="福建省省级政府投资项目代建管理费取费限额，按投资概算分档累进计算。"
             data-qoder-id="qel-progressivepanel-b7b36965" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-progressivepanel-b7b36965&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;progressivepanel&quot;,&quot;loc&quot;:{&quot;line&quot;:756,&quot;column&quot;:13}}"/>
          </Panel>
        );
      case "transaction":
        return (
          <Panel
            title="工程交易服务费"
            meta={
              <>
                <Pill data-qoder-id="qel-pill-b2e10a2b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-b2e10a2b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:770,&quot;column&quot;:17}}">闽发改价格〔2024〕150号</Pill>
                <LawButton onOpenLaw={onOpenLaw} lawId="交易_1"  data-qoder-id="qel-lawbutton-3f6f6d42" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-lawbutton-3f6f6d42&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;lawbutton&quot;,&quot;loc&quot;:{&quot;line&quot;:771,&quot;column&quot;:17}}"/>
              </>
            }
           data-qoder-id="qel-panel-af0c18b4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-panel-af0c18b4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;panel&quot;,&quot;loc&quot;:{&quot;line&quot;:766,&quot;column&quot;:11}}">
            <FixedCasePanel
              categories={TX_150_CATEGORIES}
              doc="闽发改价格〔2024〕150号"
              notes={TX_150_NOTES}
             data-qoder-id="qel-fixedcasepanel-c31d2473" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-fixedcasepanel-c31d2473&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;fixedcasepanel&quot;,&quot;loc&quot;:{&quot;line&quot;:775,&quot;column&quot;:13}}"/>
          </Panel>
        );
      default:
        return null;
    }
  };

  return (
    <div className={["container", qoderProps?.className].filter(Boolean).join(" ")} data-component="Calc Hub" data-od-id="calc-hub" style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <header className="page-head" data-qoder-id="qel-page-head-25be9982" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-25be9982&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;page-head&quot;,&quot;loc&quot;:{&quot;line&quot;:789,&quot;column&quot;:7}}">
        <div className="page-head-main" data-qoder-id="qel-page-head-main-66de86e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-main-66de86e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;page-head-main&quot;,&quot;loc&quot;:{&quot;line&quot;:790,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-379c7e4e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-379c7e4e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:791,&quot;column&quot;:11}}">Calculators · 费用测算</span>
          <h1 className="page-title" data-qoder-id="qel-page-title-05ece0d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-05ece0d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:792,&quot;column&quot;:11}}">
            计算中心
            <Pill data-qoder-id="qel-pill-aedec548" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-pill-aedec548&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;pill&quot;,&quot;loc&quot;:{&quot;line&quot;:794,&quot;column&quot;:13}}">{CALCULATORS.length} 项工具</Pill>
          </h1>
          <p className="page-sub" data-qoder-id="qel-page-sub-bf69309b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-sub-bf69309b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;page-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:796,&quot;column&quot;:11}}">
            覆盖招标采购全流程的九类费用测算工具，按三大类组织。每款计算器均标注政策依据，
            支持一键跳转原文核对。输入即出结果，数据仅在本地计算。
          </p>
        </div>
      </header>

      <div className="hub-layout" data-qoder-id="qel-hub-layout-0a10c257" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hub-layout-0a10c257&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;hub-layout&quot;,&quot;loc&quot;:{&quot;line&quot;:803,&quot;column&quot;:7}}">
        <aside className="hub-side" data-component="Calc Nav" data-od-id="calc-nav" aria-label="计算器列表" data-qoder-id="qel-calc-nav-e815fa50" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-nav-e815fa50&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;calc-nav&quot;,&quot;loc&quot;:{&quot;line&quot;:804,&quot;column&quot;:9}}">
          {GROUPS.map((g) => {
            const items = CALCULATORS.filter((c) => c.group === g);
            return (
              <div className="hub-group" key={g} data-qoder-id="qel-hub-group-dcc6a2e4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hub-group-dcc6a2e4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;hub-group&quot;,&quot;loc&quot;:{&quot;line&quot;:808,&quot;column&quot;:15}}">
                <span className="hub-group-title" data-qoder-id="qel-hub-group-title-dac751a9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hub-group-title-dac751a9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;hub-group-title&quot;,&quot;loc&quot;:{&quot;line&quot;:809,&quot;column&quot;:17}}">
                  {g}
                  <span className="hub-count" data-qoder-id="qel-hub-count-39e4530f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hub-count-39e4530f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;hub-count&quot;,&quot;loc&quot;:{&quot;line&quot;:811,&quot;column&quot;:19}}">{items.length}</span>
                </span>
                {items.map((c) => (
                  <Button
                    key={c.id}
                    variant="hub"
                    active={active === c.id}
                    onClick={() => setActive(c.id)}
                   data-qoder-id="qel-button-cb00614b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-cb00614b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:814,&quot;column&quot;:19}}">
                    <span className="hub-item-name" data-qoder-id="qel-hub-item-name-1bd0b51f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hub-item-name-1bd0b51f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;hub-item-name&quot;,&quot;loc&quot;:{&quot;line&quot;:820,&quot;column&quot;:21}}">{c.name}</span>
                    <span className="hub-item-desc" data-qoder-id="qel-hub-item-desc-bdd95696" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-hub-item-desc-bdd95696&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;hub-item-desc&quot;,&quot;loc&quot;:{&quot;line&quot;:821,&quot;column&quot;:21}}">{c.desc}</span>
                  </Button>
                ))}
              </div>
            );
          })}
        </aside>

        <section className="hub-main" data-component="Calc Panel Wrap" data-od-id="calc-panel-wrap" data-qoder-id="qel-calc-panel-wrap-7dc46593" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-panel-wrap-7dc46593&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;calc-panel-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:829,&quot;column&quot;:9}}">
          {renderCalc()}
          <div className="mt-32" data-qoder-id="qel-mt-32-57c1c858" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-32-57c1c858&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;mt-32&quot;,&quot;loc&quot;:{&quot;line&quot;:831,&quot;column&quot;:11}}">
            <Notice data-qoder-id="qel-notice-d9e58127" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-d9e58127&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:832,&quot;column&quot;:13}}">
              <b data-qoder-id="qel-b-b51864f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-b51864f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/CalcHub.jsx&quot;,&quot;componentName&quot;:&quot;CalcHub&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:833,&quot;column&quot;:15}}">免责说明：</b>
              {FEE_POLICY.disclaimer}
              各地方标准如有更新，以发文机关原文为准；可点击「查看原文」核对费率表。
            </Notice>
          </div>
        </section>
      </div>
    </div>
  );
}
