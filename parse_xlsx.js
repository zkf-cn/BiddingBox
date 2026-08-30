const XLSX = require("xlsx");
const path = "E:/编程专用/招标百宝箱网页版/造价咨询服务费 费率表.xlsx";
const wb = XLSX.readFile(path);
console.log("SHEETS:", wb.SheetNames);
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  console.log("=== SHEET:", name, "rows:", rows.length);
  for (const r of rows.slice(0, 80)) console.log(JSON.stringify(r));
}
