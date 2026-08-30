import { useMemo, useState } from "react";
import {
  PROJECT_TYPES,
  FEE_BANDS,
  FEE_POLICY,
  calcAgentFee,
} from "@/data/bidding";
import { Notice, IconEmpty, Button, Input, Segmented, TableScroll, LiveResult } from "@/components/ui";

const fmt = (n) =>
  n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

export default function AgentFeeCalculator({ embedded = false, ...qoderProps } = {}) {
  const [amount, setAmount] = useState("500");
  const [typeId, setTypeId] = useState("goods");
  const [discount, setDiscount] = useState("0");
  const [rateViewId, setRateViewId] = useState("goods");

  const type = PROJECT_TYPES.find((t) => t.id === typeId);
  const rateViewType = PROJECT_TYPES.find((t) => t.id === rateViewId);

  const amountNum = Number(amount);
  const amountValid =
    amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0 && amountNum <= 1e8;

  const discountNum = discount.trim() === "" ? 0 : Number(discount);
  const discountValid =
    Number.isFinite(discountNum) && discountNum >= 0 && discountNum <= 100;

  const result = useMemo(
    () => (amountValid ? calcAgentFee(amountNum, type.rates) : null),
    [amountValid, amountNum, type]
  );

  const discounted =
    result && discountValid ? result.total * (1 - discountNum / 100) : null;

  return (
    <div
      className={[(embedded ? "calc-embedded" : "container"), qoderProps?.className].filter(Boolean).join(" ")}
      data-component="Agent Fee Calculator"
      data-od-id="calculator"
     style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {!embedded && (
        <header className="page-head" data-qoder-id="qel-page-head-c787fc76" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-head-c787fc76&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;page-head&quot;,&quot;loc&quot;:{&quot;line&quot;:48,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-a05603ff" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-a05603ff&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:49,&quot;column&quot;:11}}">招标代理服务费计算器</h1>
          <p className="page-sub" data-qoder-id="qel-page-sub-ebc32409" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-sub-ebc32409&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;page-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:50,&quot;column&quot;:11}}">
            依据{FEE_POLICY.basis}附表，按中标金额差累进分段计费。输入即时测算，无需提交。
          </p>
        </header>
      )}

      <div className={embedded ? "calc-layout" : "calc-layout mt-24"} data-qoder-id="qel-div-91c7e298" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-91c7e298&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:56,&quot;column&quot;:7}}">
        {/* 输入表单 */}
        <div className="card calc-form" data-component="Calc Inputs" data-od-id="calc-inputs" data-qoder-id="qel-calc-inputs-9825f1bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-inputs-9825f1bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;calc-inputs&quot;,&quot;loc&quot;:{&quot;line&quot;:58,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-bed2cb1f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-bed2cb1f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:59,&quot;column&quot;:11}}">Input · 测算条件</span>
          <h2 className="card-title" data-qoder-id="qel-card-title-ab009d2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-title-ab009d2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;card-title&quot;,&quot;loc&quot;:{&quot;line&quot;:60,&quot;column&quot;:11}}">测算条件</h2>

          <Input
            id="win-amount"
            label="中标金额"
            hint="填写中标通知书金额"
            unit="万元"
            type="text"
            autoComplete="off"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="例如 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!amountValid ? "请输入大于 0 的有效金额" : undefined}
           data-qoder-id="qel-win-amount-66807410" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-win-amount-66807410&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;win-amount&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:11}}"/>

          <Segmented
            id="project-type"
            name="项目类型"
            hint="对应不同费率表"
            options={PROJECT_TYPES.map((t) => ({ value: t.id, label: t.short }))}
            value={typeId}
            onChange={setTypeId}
           data-qoder-id="qel-project-type-d1cf44c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-project-type-d1cf44c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;project-type&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:11}}"/>

          <Input
            id="discount"
            label="下浮比例"
            hint="市场调节议价，0–100%"
            unit="%"
            type="text"
            autoComplete="off"
            inputMode="decimal"
            min="0"
            max="100"
            step="any"
            placeholder="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            error={!discountValid ? "下浮比例需在 0–100 之间" : undefined}
           data-qoder-id="qel-discount-0862624b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-discount-0862624b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;discount&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:11}}"/>

          <Notice data-qoder-id="qel-notice-9036ec4f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-9036ec4f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:101,&quot;column&quot;:11}}">
            差累进计费：中标金额按 {FEE_BANDS.length} 档区间逐段乘以对应费率后累加，
            并非全额套用单一费率。
          </Notice>
        </div>

        {/* 结果 */}
        <div className="card" data-component="Calc Result" data-od-id="calc-result" data-qoder-id="qel-calc-result-fa588400" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-result-fa588400&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;calc-result&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:9}}">
          <span className="kicker" data-qoder-id="qel-kicker-0cd087b7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-kicker-0cd087b7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;kicker&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:11}}">Output · 测算结果</span>
          <h2 className="card-title" data-qoder-id="qel-card-title-bf0dcb46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-title-bf0dcb46&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;card-title&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:11}}">测算结果</h2>
          <p className="card-sub" data-qoder-id="qel-card-sub-25eaaeed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-sub-25eaaeed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;card-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:11}}">
            {type.name} · 中标金额 {amountValid ? `${fmt(amountNum)} 万元` : "—"}
            {discountValid && discountNum > 0 ? ` · 下浮 ${fmt(discountNum)}%` : ""}
          </p>

          {result ? (
            <>
              <LiveResult
                className="mt-16"
                message={
                  result
                    ? `${type.name}：测算结果 ${fmt(result.total)} 万元${
                        discounted !== null && discountNum > 0
                          ? `；下浮 ${fmt(discountNum)}% 后应收 ${fmt(discounted)} 万元`
                          : ""
                      }`
                    : "中标金额无效，请输入大于 0 的数字"
                }
                data-qoder-id="qel-mt-16-c72420bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-c72420bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:117,&quot;column&quot;:15}}"
              >
                <div className="result-hero" data-qoder-id="qel-result-hero-35ee1157" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-hero-35ee1157&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;result-hero&quot;,&quot;loc&quot;:{&quot;line&quot;:118,&quot;column&quot;:17}}">
                  <span className="result-value" data-qoder-id="qel-result-value-740e72ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-value-740e72ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;result-value&quot;,&quot;loc&quot;:{&quot;line&quot;:119,&quot;column&quot;:19}}">{fmt(result.total)}</span>
                  <span className="result-unit" data-qoder-id="qel-result-unit-1187c828" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-unit-1187c828&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;result-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:120,&quot;column&quot;:19}}">万元</span>
                </div>
                {discounted !== null && discountNum > 0 && (
                  <p className="result-sub" data-qoder-id="qel-result-sub-d2cbaa33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-result-sub-d2cbaa33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;result-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:123,&quot;column&quot;:19}}">
                    下浮 {fmt(discountNum)}% 后应收 <b data-qoder-id="qel-b-17550743" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-b-17550743&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;b&quot;,&quot;loc&quot;:{&quot;line&quot;:124,&quot;column&quot;:48}}">{fmt(discounted)} 万元</b>
                    （优惠 {fmt(result.total - discounted)} 万元）
                  </p>
                )}
              </LiveResult>

              <div className="calc-divider"  data-qoder-id="qel-calc-divider-0e1fce22" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calc-divider-0e1fce22&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;calc-divider&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:15}}"/>

              <div className="table-wrap" data-qoder-id="qel-table-wrap-dbe93ccd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-dbe93ccd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:132,&quot;column&quot;:15}}">
                <TableScroll label="差累进分段计算明细" data-qoder-id="qel-table-scroll-9ff294b9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-9ff294b9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:17}}">
                  <table className="data" aria-label="差累进分段计算明细" data-qoder-id="qel-table-ae4e57c7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-ae4e57c7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:134,&quot;column&quot;:19}}">
                    <thead data-qoder-id="qel-thead-620b5148" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-620b5148&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:135,&quot;column&quot;:21}}">
                      <tr data-qoder-id="qel-tr-f68b2ff5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-f68b2ff5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:23}}">
                        <th scope="col" data-qoder-id="qel-th-1546d62a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-1546d62a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:25}}">计费区间</th>
                        <th scope="col" className="num" data-qoder-id="qel-num-260658b5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-260658b5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:25}}">费率</th>
                        <th scope="col" className="num" data-qoder-id="qel-num-25065722" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-25065722&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:25}}">该段金额（万元）</th>
                        <th scope="col" className="num" data-qoder-id="qel-num-28041d44" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-28041d44&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:140,&quot;column&quot;:25}}">该段收费（万元）</th>
                      </tr>
                    </thead>
                    <tbody data-qoder-id="qel-tbody-f3097eed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-f3097eed&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:143,&quot;column&quot;:21}}">
                      {result.breakdown.map((row) => (
                        <tr key={row.label} data-qoder-id="qel-tr-08890db4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-08890db4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:145,&quot;column&quot;:25}}">
                          <td data-qoder-id="qel-td-190115e7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-190115e7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:27}}">{row.label}</td>
                          <td className="num" data-qoder-id="qel-num-b814e0bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-b814e0bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:147,&quot;column&quot;:27}}">{row.rate}%</td>
                          <td className="num" data-qoder-id="qel-num-b914e24f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-b914e24f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:27}}">{fmt(row.segAmount)}</td>
                          <td className="num" data-qoder-id="qel-num-ba14e3e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-ba14e3e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:149,&quot;column&quot;:27}}">{fmt(row.segFee)}</td>
                        </tr>
                      ))}
                      <tr className="total-row" data-qoder-id="qel-total-row-9b8dd73e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-total-row-9b8dd73e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;total-row&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:23}}">
                        <td data-qoder-id="qel-td-12010ae2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-12010ae2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:25}}">合计</td>
                        <td className="num" data-qoder-id="qel-num-bd14e89b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-bd14e89b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:25}}">—</td>
                        <td className="num" data-qoder-id="qel-num-be26334f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-be26334f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:25}}">{fmt(amountNum)}</td>
                        <td className="num" data-qoder-id="qel-num-bd2631bc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-bd2631bc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:25}}">{fmt(result.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </TableScroll>
              </div>
            </>
          ) : (
            <div className="empty mt-16" data-qoder-id="qel-empty-4b9f9c89" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-4b9f9c89&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;empty&quot;,&quot;loc&quot;:{&quot;line&quot;:164,&quot;column&quot;:13}}">
              <IconEmpty  data-qoder-id="qel-iconempty-928a2dcc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconempty-928a2dcc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;iconempty&quot;,&quot;loc&quot;:{&quot;line&quot;:165,&quot;column&quot;:15}}"/>
              <p data-qoder-id="qel-p-1f5a4729" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-1f5a4729&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:166,&quot;column&quot;:15}}">
                请输入有效的中标金额，系统将按{type.name}
                费率表自动分段测算并展示计算过程。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 费率依据 */}
      <section
        className={embedded ? "mt-32" : "section"}
        style={embedded ? undefined : { paddingBottom: 0 }}
        data-component="Rate Reference"
        data-od-id="rate-reference"
       data-qoder-id="qel-rate-reference-8ebc26f1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rate-reference-8ebc26f1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;rate-reference&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:7}}">
        <div className="section-head" data-qoder-id="qel-section-head-51edfb82" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-section-head-51edfb82&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;section-head&quot;,&quot;loc&quot;:{&quot;line&quot;:182,&quot;column&quot;:9}}">
          <h2 className="section-title" data-qoder-id="qel-section-title-5b20348c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-section-title-5b20348c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:183,&quot;column&quot;:11}}">差累进费率依据表</h2>
          <p className="section-sub" data-qoder-id="qel-section-sub-19b9b145" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-section-sub-19b9b145&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;section-sub&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:11}}">
            {FEE_POLICY.basis}附表 · {FEE_POLICY.update}
          </p>
        </div>

        <div className="card" data-qoder-id="qel-card-bc3f80d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-bc3f80d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:189,&quot;column&quot;:9}}">
          <div className="rate-switch" role="group" aria-label="切换项目类型费率表" data-qoder-id="qel-div-25a9ce78" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-25a9ce78&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:11}}">
            {PROJECT_TYPES.map((t) => (
              <Button
                key={t.id}
                variant="chip"
                active={rateViewId === t.id}
                onClick={() => setRateViewId(t.id)}
               data-qoder-id="qel-button-7f383013" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-7f383013&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:192,&quot;column&quot;:15}}">
                {t.name}
              </Button>
            ))}
          </div>

          <div className="table-wrap" data-qoder-id="qel-table-wrap-d1d7e3ee" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-wrap-d1d7e3ee&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;table-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:205,&quot;column&quot;:11}}">
            <TableScroll label={`${rateViewType.name}差累进费率表`} data-qoder-id="qel-table-scroll-a803ea72" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-scroll-a803ea72&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;table-scroll&quot;,&quot;loc&quot;:{&quot;line&quot;:206,&quot;column&quot;:13}}">
              <table className="data" aria-label={`${rateViewType.name}差累进费率表`} data-qoder-id="qel-data-f3f368a2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-data-f3f368a2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;data&quot;,&quot;loc&quot;:{&quot;line&quot;:207,&quot;column&quot;:15}}">
                <thead data-qoder-id="qel-thead-61fa0827" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-61fa0827&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-f48d6b66" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-f48d6b66&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:209,&quot;column&quot;:19}}">
                    <th scope="col" data-qoder-id="qel-th-154914c1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-154914c1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:210,&quot;column&quot;:21}}">中标金额区间</th>
                    <th scope="col" className="num" data-qoder-id="qel-num-a3fed04a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-a3fed04a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:21}}">费率</th>
                  </tr>
                </thead>
                <tbody data-qoder-id="qel-tbody-e70de937" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-e70de937&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:214,&quot;column&quot;:17}}">
                  {FEE_BANDS.map((band, i) => (
                    <tr key={band.label} data-qoder-id="qel-tr-88951027" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-88951027&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:216,&quot;column&quot;:21}}">
                      <td data-qoder-id="qel-td-170ddeb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-170ddeb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:217,&quot;column&quot;:23}}">{band.label}</td>
                      <td className="num" data-qoder-id="qel-num-502108f7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-num-502108f7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;num&quot;,&quot;loc&quot;:{&quot;line&quot;:218,&quot;column&quot;:23}}">{rateViewType.rates[i]}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </div>

          <div className="mt-16" data-qoder-id="qel-mt-16-4521157e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-mt-16-4521157e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;mt-16&quot;,&quot;loc&quot;:{&quot;line&quot;:226,&quot;column&quot;:11}}">
            <Notice data-qoder-id="qel-notice-8d34a8ff" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-notice-8d34a8ff&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/AgentFeeCalculator.jsx&quot;,&quot;componentName&quot;:&quot;AgentFeeCalculator&quot;,&quot;elementRole&quot;:&quot;notice&quot;,&quot;loc&quot;:{&quot;line&quot;:227,&quot;column&quot;:13}}">{FEE_POLICY.disclaimer}</Notice>
          </div>
        </div>
      </section>
    </div>
  );
}
