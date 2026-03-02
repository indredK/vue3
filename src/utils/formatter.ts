export function formatDate(date: string | Date | number, format: string = 'YYYY-MM-DD'): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

export function formatTime(date: string | Date | number): string {
  return formatDate(date, 'HH:mm:ss')
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num === null || num === undefined) return ''
  return Number(num).toFixed(decimals)
}

export function formatCurrency(amount: number, symbol: string = '¥'): string {
  if (amount === null || amount === undefined) return ''
  return `${symbol}${formatNumber(amount, 2)}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function formatPercent(value: number, decimals: number = 2): string {
  if (value === null || value === undefined) return ''
  return `${(Number(value) * 100).toFixed(decimals)}%`
}

export function truncate(str: string, length: number, ellipsis: string = '...'): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + ellipsis
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function ellipsisMiddle(str: string, startLen: number = 6, endLen: number = 4): string {
  if (!str) return ''
  if (str.length <= startLen + endLen) return str
  return str.substring(0, startLen) + '...' + str.substring(str.length - endLen)
}
