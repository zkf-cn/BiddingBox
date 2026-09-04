/**
 * Excel(.xlsx) 导出 —— 全部在浏览器前端生成，无后端参与。
 * xlsx 库按需动态引入，避免进入首屏包体。
 */

/** 文件名安全化：去掉 Windows/Excel 不允许的字符 */
export function safeFilename(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
}

/** 生成带时间戳的文件名 */
export function timestamped(name) {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`
  return safeFilename(`${name}_${stamp}.xlsx`)
}

/**
 * 导出多表工作簿
 * @param {string} filename 文件名（含 .xlsx）
 * @param {{name:string, aoa:(string|number)[][], cols?:number[]}[]} sheets 工作表数组
 */
export async function exportWorkbook(filename, sheets) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.aoa)
    if (sheet.cols && sheet.cols.length) {
      ws['!cols'] = sheet.cols.map((w) => ({ wch: w }))
    } else {
      // 自动列宽：取该列最长单元格长度，上限 42
      const widths = []
      sheet.aoa.forEach((row) => {
        row.forEach((cell, i) => {
          const len = cell === null || cell === undefined ? 0 : String(cell).length
          if (!widths[i] || len > widths[i]) widths[i] = len
        })
      })
      ws['!cols'] = widths.map((w) => ({ wch: Math.min(Math.max((w || 8) + 2, 10), 42) }))
    }
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(sheet.name))
  }

  XLSX.writeFile(wb, safeFilename(filename))
}

/* Excel 工作表名最长 31 字符，且不能包含 : \ / ? * [ ] */
function safeSheetName(name) {
  return String(name).replace(/[:\\/?*[\]]/g, '-').slice(0, 31) || 'Sheet1'
}
