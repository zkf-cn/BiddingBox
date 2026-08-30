function hex2rgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16));}
function lum(rgb){const a=rgb.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
function ratio(a,b){const l1=lum(hex2rgb(a)),l2=lum(hex2rgb(b));const hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+0.05)/(lo+0.05);}
const pairs=[
 // ---------- 修复后（当前生效值） ----------
 ['L 主文字 fg / 白底','#0a0a0a','#ffffff'],
 ['L text-secondary 正文','#525252','#ffffff'],
 ['L text-muted 次要·表头·提示 [新]','#6f6f6f','#ffffff'],
 ['L text-quaternary [新]','#737373','#ffffff'],
 ['L danger 错误文字','#e7000b','#ffffff'],
 ['L success 状态徽章 [新]','#15803d','#ffffff'],
 ['L chip.active 反白字','#ffffff','#0a0a0a'],
 ['L 页脚 secondary on #fafafa','#525252','#fafafa'],
 ['D 主文字 fg / #0a0a0a','#fafafa','#0a0a0a'],
 ['D text-secondary','#a1a1a1','#0a0a0a'],
 ['D text-muted 次要·表头 [新]','#8a8a8a','#0a0a0a'],
 ['D text-quaternary [新]','#7a7a7a','#0a0a0a'],
 ['D danger','#ff6467','#0a0a0a'],
 ['D success 状态徽章 [新]','#16a34a','#0a0a0a'],
 ['D chip.active 反色字(#0a0a0a on #e5e5e5)','#0a0a0a','#e5e5e5'],
 ['D 焦点环 focus-ring / 面板#171717','#737373','#171717'],
 ['L 焦点环 focus-ring / 白底','#0d0d0d','#ffffff'],
 ['L border-input 输入框边框 / 白底 [新]','#8a8a8a','#ffffff'],
 ['D border-input 输入框边框 / #0a0a0a [新]','#6b6b6b','#0a0a0a'],
 ['L text-muted on surface #fafafa [新]','#6f6f6f','#fafafa'],
 ['L text-muted on control-bg #fafafa(表头) [新]','#6f6f6f','#fafafa'],
 ['D text-muted on surface #171717 [新]','#8a8a8a','#171717'],
 // ---------- 修复前（留档对照） ----------
 ['[旧] L text-muted','#858585','#ffffff'],
 ['[旧] L text-quaternary','#a3a3a3','#ffffff'],
 ['[旧] L success','#16a34a','#ffffff'],
 ['[旧] L border-input','#e5e5e5','#ffffff'],
 ['[旧] D text-muted','#737373','#0a0a0a'],
 ['[旧] D text-quaternary','#525252','#0a0a0a'],
 ['[旧] D border-input','#343434','#0a0a0a'],
 ['[旧] D success 若继承浅色值','#15803d','#0a0a0a'],
];
const pad=(s,n)=>{let w=0;for(const c of s)w+=/[\u4e00-\u9fa5（）·]/.test(c)?2:1;return s+' '.repeat(Math.max(0,n-w));};
console.log(pad('组合',40),pad('对比度',7),'AA正文4.5  AA大字/UI 3.0');
for(const [n,f,b] of pairs){
  const r=ratio(f,b);
  const a=r>=4.5?'PASS':(r>=3?'大字/UI PASS':'FAIL');
  console.log(pad(n,40),pad(r.toFixed(2),7),pad(a,12),r>=3?'PASS':'FAIL');
}
