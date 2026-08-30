import { useEffect, useRef, useState } from "react";

/**
 * @/components/ui —— source-owned Spark Design 组件层（见 react-vite/components.json）
 * 契约：token 驱动（sparkdesign-tokens.css）+ App 根节点 data-theme/data-style。
 * 图标统一为 1.7px monoline 内联 SVG（currentColor）。
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* ---------- 基础控件 ---------- */

const VARIANT_CLASS = {
  primary: "btn btn--primary",
  ghost: "btn btn--ghost",
  nav: "nav-link",
  chip: "chip",
  tab: "tab",
  segment: "btn--segment",
  brand: "brand",
  module: "card module-card",
  hub: "hub-item",
};

/** Spark Button · source-owned */
export function Button({
  variant = "ghost",
  size,
  active = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    VARIANT_CLASS[variant] ?? "btn btn--ghost",
    size === "sm" ? "btn--sm" : "",
    active ? "active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // 选中态必须有语义，不能只落在 CSS class 上。
  // role="tab"/"radio" 由调用方自行提供 aria-selected/aria-checked，此处不重复施加。
  // 置于 {...rest} 之前，调用方的显式 ARIA 始终优先。
  const stateProps = {};
  if (rest.role !== "tab" && rest.role !== "radio") {
    if (variant === "nav" || variant === "hub") {
      // 导航/当前面板：只在选中时标记，未选中不应出现 aria-current
      if (active) stateProps["aria-current"] = "true";
    } else if (variant === "chip" || variant === "tab") {
      // 切换类选项：必须显式给出 true/false，否则读屏对未选中项无状态可播报
      stateProps["aria-pressed"] = active;
    } else if (active) {
      stateProps["aria-pressed"] = true;
    }
  }

  return (
    <button className={classes} {...stateProps} {...rest} style={rest?.style} data-qoder-id={rest?.["data-qoder-id"]} data-qoder-source={rest?.["data-qoder-source"]}>
      {children}
    </button>
  );
}

/** Spark IconButton · source-owned */
export function IconButton({ label, className = "", children, ...rest }) {
  return (
    <button
      className={`icon-btn ${className}`.trim()}
      aria-label={label}
      {...rest}
     data-qoder-id="qel-button-f8106ae6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-f8106ae6&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconButton&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:5}}" style={rest?.style}>
      {children}
    </button>
  );
}

/** Spark Input · source-owned：label / 前后缀 / 错误提示一体 */
export function Input({
  id,
  label,
  hint,
  unit,
  prefix,
  error,
  className = "",
  ...rest
}) {
  // hint / error 必须与 input 建立程序化关联，否则读屏用户读不到填写要求与错误原因
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`field ${className}`.trim()} data-qoder-id="qel-div-1b396786" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-1b396786&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:77,&quot;column&quot;:5}}" style={rest?.style}>
      {label && (
        <label className="field-label" htmlFor={id} data-qoder-id="qel-field-label-69bda44e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-69bda44e&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:79,&quot;column&quot;:9}}">
          {label}
          {hint && <span className="field-hint" id={hintId} data-qoder-id="qel-field-hint-6e859462" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-hint-6e859462&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;field-hint&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:20}}">{hint}</span>}
        </label>
      )}
      {!label && hint && (
        <span className="field-hint field-hint--standalone" id={hintId}>{hint}</span>
      )}
      <div className="input-wrap" data-qoder-id="qel-input-wrap-3b553865" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-wrap-3b553865&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;input-wrap&quot;,&quot;loc&quot;:{&quot;line&quot;:84,&quot;column&quot;:7}}">
        {prefix && <span className="input-prefix" data-qoder-id="qel-input-prefix-b8badb85" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-prefix-b8badb85&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;input-prefix&quot;,&quot;loc&quot;:{&quot;line&quot;:85,&quot;column&quot;:20}}">{prefix}</span>}
        <input
          id={id}
          className={`input ${unit ? "input--unit" : ""} ${
            prefix ? "input--prefix" : ""
          }`.trim()}
          {...rest}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
         data-qoder-id="qel-input-f37cd2df" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-f37cd2df&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:86,&quot;column&quot;:9}}"/>
        {unit && <span className="input-unit" data-qoder-id="qel-input-unit-86d0b50d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-unit-86d0b50d&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;input-unit&quot;,&quot;loc&quot;:{&quot;line&quot;:94,&quot;column&quot;:18}}">{unit}</span>}
      </div>
      {error && (
        <p className="field-error" id={errorId} role="status" aria-live="polite" data-qoder-id="qel-field-error-03d40891" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-error-03d40891&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Input&quot;,&quot;elementRole&quot;:&quot;field-error&quot;,&quot;loc&quot;:{&quot;line&quot;:97,&quot;column&quot;:9}}">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * 计算结果播报容器（WCAG 4.1.3 Status Messages）
 * 「输入即算」不能每次按键都打断读屏，因此把要播报的消息做防抖后再推入 live region。
 * 传入的 message 是给读屏听的摘要，children 照常渲染视觉内容。
 */
export function LiveResult({ message, delay = 600, children, ...qoderProps }) {
  const [announced, setAnnounced] = useState("");
  const ref = useRef(null);
  // 不写依赖数组：每次渲染都重设定时器，实现"停止输入后才播报"的防抖效果。
  // 未显式传 message 时，直接读取容器文本作为播报内容。
  useEffect(() => {
    const timer = setTimeout(() => {
      const next =
        message !== undefined ? message : (ref.current?.textContent ?? "").trim();
      setAnnounced(next);
    }, delay);
    return () => clearTimeout(timer);
  });
  return (
    <>
      <div
        ref={ref}
        className={qoderProps?.className}
        style={qoderProps?.style}
        data-qoder-id={qoderProps?.["data-qoder-id"]}
        data-qoder-source={qoderProps?.["data-qoder-source"]}
      >
        {children}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{announced}</span>
    </>
  );
}

/** 可键盘滚动的表格容器：横向溢出时键盘用户也能聚焦后滚动查看 */
export function TableScroll({ label = "表格横向滚动区", children, ...qoderProps }) {
  return (
    <div
      className={["table-scroll", qoderProps?.className].filter(Boolean).join(" ")}
      tabIndex={0}
      role="region"
      aria-label={label}
      style={qoderProps?.style}
      data-qoder-id={qoderProps?.["data-qoder-id"]}
      data-qoder-source={qoderProps?.["data-qoder-source"]}
    >
      {children}
    </div>
  );
}

/**
 * Spark Segmented · source-owned：分段选择
 * 使用原生 <input type="radio"> + fieldset/legend，方向键导航、单选语义、
 * 分组标签全部由浏览器原生提供，无需手写 ARIA。
 */
export function Segmented({ id, name, hint, options, value, onChange, ...qoderProps }) {
  const labelId = `${id}-label`;
  const groupName = `seg-${id}`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={["field", qoderProps?.className].filter(Boolean).join(" ")} data-qoder-id="qel-field-6ef8bece" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-6ef8bece&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Segmented&quot;,&quot;elementRole&quot;:&quot;field&quot;,&quot;loc&quot;:{&quot;line&quot;:109,&quot;column&quot;:5}}" style={qoderProps?.style}>
      <fieldset className="field-fieldset">
        <legend className="field-label" id={labelId} data-qoder-id="qel-field-label-d2beac55" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-label-d2beac55&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Segmented&quot;,&quot;elementRole&quot;:&quot;field-label&quot;,&quot;loc&quot;:{&quot;line&quot;:110,&quot;column&quot;:7}}">
          {name}
          {hint && <span className="field-hint" id={hintId} data-qoder-id="qel-field-hint-e92d384b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-field-hint-e92d384b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Segmented&quot;,&quot;elementRole&quot;:&quot;field-hint&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:18}}">{hint}</span>}
        </legend>
        <div className="segmented" data-qoder-id="qel-segmented-e29dc451" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-segmented-e29dc451&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Segmented&quot;,&quot;elementRole&quot;:&quot;segmented&quot;,&quot;loc&quot;:{&quot;line&quot;:114,&quot;column&quot;:7}}">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`btn--segment ${value === opt.value ? "active" : ""}`}
              data-qoder-id="qel-button-82e92c7b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-82e92c7b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Segmented&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:11}}"
            >
              <input
                className="sr-only"
                type="radio"
                name={groupName}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** 提示条 */
export function Notice({ children, icon = <IconInfo  data-qoder-id="qel-iconinfo-b4e93592" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconinfo-b4e93592&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Notice&quot;,&quot;elementRole&quot;:&quot;iconinfo&quot;,&quot;loc&quot;:{&quot;line&quot;:133,&quot;column&quot;:43}}"/>, ...qoderProps }) {
  return (
    <div className={["notice", qoderProps?.className].filter(Boolean).join(" ")} role="note" style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      {icon}
      <div data-qoder-id="qel-div-e9b57632" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-e9b57632&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;Notice&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:7}}">{children}</div>
    </div>
  );
}

/** 徽章 */
export function Pill({ children, tone = "default", ...qoderProps }) {
  const toneClass =
    tone === "success"
      ? "pill pill--success"
      : tone === "neutral"
        ? "pill pill--neutral"
        : tone === "muted"
          ? "pill pill--muted"
          : "pill";
  return <span className={[toneClass, qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>{children}</span>;
}

/* ---------- 图标（1.7px monoline） ---------- */

/** 品牌图标：百宝箱 */
export function BrandMark({ size = 30, className = "brand-mark", ...qoderProps }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M3 9a9 5.2 0 0 1 18 0"  data-qoder-id="qel-path-731b05f2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-731b05f2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;BrandMark&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:7}}"/>
      <rect x="3" y="9" width="18" height="11" rx="1.6"  data-qoder-id="qel-rect-85d73711" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-85d73711&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;BrandMark&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:154,&quot;column&quot;:7}}"/>
      <circle cx="12" cy="13.6" r="1.5"  data-qoder-id="qel-circle-412f95e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-412f95e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;BrandMark&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:155,&quot;column&quot;:7}}"/>
      <path d="M12 15.1v2"  data-qoder-id="qel-path-701b0139" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-701b0139&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;BrandMark&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:156,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconCalc({ size = 22, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <rect x="5" y="3" width="14" height="18" rx="2"  data-qoder-id="qel-rect-ea524847" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-rect-ea524847&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconCalc&quot;,&quot;elementRole&quot;:&quot;rect&quot;,&quot;loc&quot;:{&quot;line&quot;:164,&quot;column&quot;:7}}"/>
      <path d="M8.5 7.5h7"  data-qoder-id="qel-path-89cd957a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-89cd957a&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconCalc&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:165,&quot;column&quot;:7}}"/>
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" strokeWidth="2.2"  data-qoder-id="qel-path-7ccd8103" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-7ccd8103&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconCalc&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:166,&quot;column&quot;:7}}"/>
      <path d="M8.5 18.5h7"  data-qoder-id="qel-path-7bcd7f70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-7bcd7f70&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconCalc&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:167,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconBook({ size = 22, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M12 6.2C10 4.8 7.5 4.2 4 4.2v13.6c3.5 0 6 .6 8 2 2-1.4 4.5-2 8-2V4.2c-3.5 0-6 .6-8 2z"  data-qoder-id="qel-path-e127fccd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-e127fccd&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconBook&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:175,&quot;column&quot;:7}}"/>
      <path d="M12 6.2v13.6"  data-qoder-id="qel-path-de27f814" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-de27f814&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconBook&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconUsers({ size = 22, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <circle cx="9" cy="7.5" r="3.4"  data-qoder-id="qel-circle-f5e2b99b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-f5e2b99b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconUsers&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:7}}"/>
      <path d="M3.2 20c.7-3.2 3-4.8 5.8-4.8s5.1 1.6 5.8 4.8"  data-qoder-id="qel-path-a95dfc26" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-a95dfc26&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconUsers&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:185,&quot;column&quot;:7}}"/>
      <path d="M15.6 4.4a3.4 3.4 0 0 1 0 6.2"  data-qoder-id="qel-path-a85dfa93" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-a85dfa93&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconUsers&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:186,&quot;column&quot;:7}}"/>
      <path d="M17.8 15.6c1.8.7 2.8 2.2 3.2 4.4"  data-qoder-id="qel-path-a75df900" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-a75df900&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconUsers&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconSearch({ size = 16, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <circle cx="11" cy="11" r="7"  data-qoder-id="qel-circle-3e272948" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-3e272948&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconSearch&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:195,&quot;column&quot;:7}}"/>
      <path d="M16.2 16.2 21 21"  data-qoder-id="qel-path-540a54de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-540a54de&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconSearch&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconInfo({ size = 15, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={1.8} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <circle cx="12" cy="12" r="8.6"  data-qoder-id="qel-circle-87e8bff2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-87e8bff2&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconInfo&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:204,&quot;column&quot;:7}}"/>
      <path d="M12 11.2v5"  data-qoder-id="qel-path-3f2941cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-3f2941cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconInfo&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:205,&quot;column&quot;:7}}"/>
      <path d="M12 7.6h.01" strokeWidth="2.4"  data-qoder-id="qel-path-442949aa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-442949aa&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconInfo&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:206,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconArrowRight({ size = 15, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M4.5 12h15"  data-qoder-id="qel-path-f1d8983f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-f1d8983f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconArrowRight&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:214,&quot;column&quot;:7}}"/>
      <path d="m13 5.5 6.5 6.5L13 18.5"  data-qoder-id="qel-path-f0d896ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-f0d896ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconArrowRight&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:215,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconMenu({ size = 22, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M4 7h16M4 12h16M4 17h16"  data-qoder-id="qel-path-f03bf0f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-f03bf0f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconMenu&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:223,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconClose({ size = 22, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke} strokeWidth={2} style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="m6 6 12 12M18 6 6 18"  data-qoder-id="qel-path-0ef9273c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-0ef9273c&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconClose&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:231,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconEmpty({ size = 44, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M8 20 24 12l16 8-16 8-16-8z"  data-qoder-id="qel-path-e085e719" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-e085e719&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconEmpty&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:239,&quot;column&quot;:7}}"/>
      <path d="M8 20v12l16 8 16-8V20"  data-qoder-id="qel-path-e185e8ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-e185e8ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconEmpty&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:240,&quot;column&quot;:7}}"/>
      <path d="M24 28v12"  data-qoder-id="qel-path-e285ea3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-path-e285ea3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconEmpty&quot;,&quot;elementRole&quot;:&quot;path&quot;,&quot;loc&quot;:{&quot;line&quot;:241,&quot;column&quot;:7}}"/>
      <circle cx="24" cy="24" r="1.4" fill="currentColor" stroke="none"  data-qoder-id="qel-circle-94567684" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-circle-94567684&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui.jsx&quot;,&quot;componentName&quot;:&quot;IconEmpty&quot;,&quot;elementRole&quot;:&quot;circle&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:7}}"/>
    </svg>
  );
}

export function IconChevronRight({ size = 16, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconFolder({ size = 16, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M4 7a2 2 0 0 1 2-2h3.2l1.6 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

export function IconFolderOpen({ size = 16, ...qoderProps }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={qoderProps?.style} className={qoderProps?.className} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <path d="M4 7a2 2 0 0 1 2-2h3.2l1.6 2H18a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H6.5a1 1 0 0 0-1 1.2l1.1 5.8a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-2v-1" />
    </svg>
  );
}
