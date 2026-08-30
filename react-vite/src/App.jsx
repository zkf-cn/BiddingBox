import { useEffect, useRef, useState } from "react";
import Home from "@/pages/Home";
import CalcHub from "@/pages/CalcHub";
import QuotaQuery from "@/pages/QuotaQuery";
import ExpertQuery from "@/pages/ExpertQuery";
import Laws from "@/pages/Laws";
import { IconMenu, IconClose, Button, IconButton } from "@/components/ui";
import { FEE_POLICY } from "@/data/bidding";

const NAV = [
  { id: "home", label: "首页" },
  { id: "calculator", label: "计算中心" },
  { id: "quota", label: "定额" },
  { id: "expert", label: "专家" },
  { id: "laws", label: "文件" },
];

export default function App(qoderProps) {
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lawFocus, setLawFocus] = useState(null);
  const mainRef = useRef(null);
  const navRef = useRef(null);
  const firstRender = useRef(true);

  const go = (v) => {
    const wasMenuOpen = menuOpen;
    setView(v);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
    // 菜单收起后原焦点元素随 display:none 消失。若视图没变（不会触发主内容聚焦），
    // 需把焦点交还给汉堡按钮，否则焦点会掉回 body。
    if (wasMenuOpen && v === view) {
      requestAnimationFrame(() => document.getElementById("nav-toggle")?.focus());
    }
  };

  const openLaw = (lawId) => {
    setLawFocus(lawId);
    go("laws");
  };

  // 视图切换后同步文档标题，并把焦点送到主内容顶部
  // （首次挂载不抢焦点，否则会打断用户的初始浏览位置）
  useEffect(() => {
    const current = NAV.find((n) => n.id === view);
    document.title = current
      ? `${current.label} · 招标百宝箱`
      : "招标百宝箱 - 招标费用计算与查询工具";
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [view]);

  // 移动端菜单：Esc 关闭并把焦点还给汉堡按钮；展开后焦点进入菜单首项
  useEffect(() => {
    if (!menuOpen) return;
    const first = navRef.current?.querySelector("button");
    first?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      document.getElementById("nav-toggle")?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div
      className={["app-root", qoderProps?.className].filter(Boolean).join(" ")}
      data-theme="light"
      data-style="mono"
      data-component="App Root"
     style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="site-nav" data-component="TopNav" data-od-id="top-nav" data-qoder-id="qel-topnav-aeaf947d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-topnav-aeaf947d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;topnav&quot;,&quot;loc&quot;:{&quot;line&quot;:33,&quot;column&quot;:7}}">
        <div className="container nav-inner" data-qoder-id="qel-container-fcaae675" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-container-fcaae675&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;container&quot;,&quot;loc&quot;:{&quot;line&quot;:34,&quot;column&quot;:9}}">
          <Button variant="brand" onClick={() => go("home")} aria-label="回到首页" data-qoder-id="qel-button-803b75d4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-803b75d4&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:35,&quot;column&quot;:11}}">
            <img className="brand-logo" src="/logo.png" alt="招标百宝箱 LOGO"  data-qoder-id="qel-brand-logo-ac6eabc5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-brand-logo-ac6eabc5&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;brand-logo&quot;,&quot;loc&quot;:{&quot;line&quot;:36,&quot;column&quot;:13}}"/>
            <span className="brand-name" data-qoder-id="qel-brand-name-a4e4d2ed" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-brand-name-a4e4d2ed&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;brand-name&quot;,&quot;loc&quot;:{&quot;line&quot;:37,&quot;column&quot;:13}}">招标百宝箱</span>
          </Button>
          <nav
            id="primary-nav"
            ref={navRef}
            className={`nav-links ${menuOpen ? "open" : ""}`}
            aria-label="主导航"
           data-qoder-id="qel-nav-4e2a2365" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-nav-4e2a2365&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;nav&quot;,&quot;loc&quot;:{&quot;line&quot;:39,&quot;column&quot;:11}}">
            {NAV.map((n) => (
              <Button
                key={n.id}
                variant="nav"
                active={view === n.id}
                onClick={() => go(n.id)}
                aria-current={view === n.id ? "page" : undefined}
               data-qoder-id="qel-button-743b62f0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-743b62f0&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:44,&quot;column&quot;:15}}">
                {n.label}
              </Button>
            ))}
          </nav>
          <IconButton
            id="nav-toggle"
            label={menuOpen ? "关闭菜单" : "打开菜单"}
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((o) => !o)}
           data-qoder-id="qel-nav-toggle-1a2555f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-nav-toggle-1a2555f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;nav-toggle&quot;,&quot;loc&quot;:{&quot;line&quot;:55,&quot;column&quot;:11}}">
            {menuOpen ? <IconClose  data-qoder-id="qel-iconclose-1fbd1a8d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconclose-1fbd1a8d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;iconclose&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:25}}"/> : <IconMenu  data-qoder-id="qel-iconmenu-d604a25e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-iconmenu-d604a25e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;iconmenu&quot;,&quot;loc&quot;:{&quot;line&quot;:61,&quot;column&quot;:41}}"/>}
          </IconButton>
        </div>
      </header>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="app-main"
        data-component="Main Content"
        data-od-id="main"
        data-qoder-id="qel-main-content-475a1c79"
        data-qoder-source="{&quot;qoderId&quot;:&quot;qel-main-content-475a1c79&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;main-content&quot;,&quot;loc&quot;:{&quot;line&quot;:66,&quot;column&quot;:7}}"
      >
        {view === "home" && <Home onNavigate={go}  data-qoder-id="qel-home-26ab6f2e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-home-26ab6f2e&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;home&quot;,&quot;loc&quot;:{&quot;line&quot;:67,&quot;column&quot;:29}}"/>}
        {view === "calculator" && <CalcHub onOpenLaw={openLaw}  data-qoder-id="qel-calchub-46b1e46d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-calchub-46b1e46d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;calchub&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:35}}"/>}
        {view === "laws" && <Laws focusId={lawFocus}  data-qoder-id="qel-laws-68045234" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-laws-68045234&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;laws&quot;,&quot;loc&quot;:{&quot;line&quot;:77,&quot;column&quot;:29}}"/>}
        {view === "quota" && <QuotaQuery  data-qoder-id="qel-quotaquery-d4f10bba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-quotaquery-d4f10bba&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;quotaquery&quot;,&quot;loc&quot;:{&quot;line&quot;:69,&quot;column&quot;:30}}"/>}
        {view === "expert" && <ExpertQuery  data-qoder-id="qel-expertquery-66ae2667" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-expertquery-66ae2667&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;expertquery&quot;,&quot;loc&quot;:{&quot;line&quot;:70,&quot;column&quot;:31}}"/>}
      </main>

      <footer className="site-footer" data-component="Footer" data-od-id="footer" data-qoder-id="qel-footer-67ec3972" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-footer-67ec3972&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;footer&quot;,&quot;loc&quot;:{&quot;line&quot;:73,&quot;column&quot;:7}}">
        <div className="container" data-qoder-id="qel-container-12041455" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-container-12041455&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;container&quot;,&quot;loc&quot;:{&quot;line&quot;:74,&quot;column&quot;:9}}">
          <p className="footer-title" data-qoder-id="qel-footer-title-c998d4ba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-footer-title-c998d4ba&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;footer-title&quot;,&quot;loc&quot;:{&quot;line&quot;:75,&quot;column&quot;:11}}">招标百宝箱</p>
          <p data-qoder-id="qel-p-3220248a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3220248a&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:76,&quot;column&quot;:11}}">
            面向招标采购从业者的测算与查询工具。费率依据 {FEE_POLICY.basis} 等文件，
            自发改价格〔2015〕299号起招标代理服务费实行市场调节价，测算结果仅供参考。
          </p>
          <p data-qoder-id="qel-p-3320261d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-3320261d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:81,&quot;column&quot;:11}}">
            定额条目为演示数据，专家分类参考发改法规〔2018〕316号框架整理，
            均不代表官方口径；正式业务请以最新有效文件及当地主管部门规定为准。
          </p>
        </div>
      </footer>
    </div>
  );
}
