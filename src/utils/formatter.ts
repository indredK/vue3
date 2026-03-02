export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

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

export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (weeks < 4) return `${weeks}周前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

export function formatNumber(num: number | string, decimals = 0, decPoint = '.', thousandsSep = ','): string {
  const n = Number(num)
  if (isNaN(n)) return '-'

  const fixed = n.toFixed(decimals)
  const parts = fixed.split(decPoint)

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep)

  return parts.join(decPoint)
}

export function formatCurrency(amount: number | string, currency = '¥', decimals = 2): string {
  const num = Number(amount)
  if (isNaN(num)) return '-'

  return `${currency}${formatNumber(num, decimals)}`
}

export function formatFileSize(bytes: number | string): string {
  const size = Number(bytes)
  if (isNaN(size)) return '-'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let sizeValue = size

  while (sizeValue >= 1024 && unitIndex < units.length - 1) {
    sizeValue /= 1024
    unitIndex++
  }

  return `${sizeValue.toFixed(2)} ${units[unitIndex]}`
}

export function formatPercentage(value: number | string, decimals = 2): string {
  const num = Number(value)
  if (isNaN(num)) return '-'

  return `${num.toFixed(decimals)}%`
}

export function formatPhone(phone: string): string {
  if (!phone) return '-'
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
}

export function formatIdCard(idCard: string): string {
  if (!idCard) return '-'
  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1 $2 $3')
}

export function formatBankCard(cardNumber: string): string {
  if (!cardNumber) return '-'
  return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
}

export function truncate(str: string, length: number, suffix = '...'): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + suffix
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^(.)/, (_, c) => c.toLowerCase())
}

export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '')
}

export function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '')
}

export function formatJSON(obj: any, indent = 2): string {
  try {
    return JSON.stringify(obj, null, indent)
  } catch {
    return String(obj)
  }
}

export function parseJSON<T = any>(str: string, defaultValue: T | null = null): T | null {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

export function maskString(str: string, start: number, end: number, mask = '*'): string {
  if (!str) return ''
  const visibleStart = str.slice(0, start)
  const visibleEnd = str.slice(-end)
  const maskedLength = str.length - start - end
  const masked = mask.repeat(Math.max(0, maskedLength))
  return visibleStart + masked + visibleEnd
}

export function maskPhone(phone: string): string {
  return maskString(phone, 3, 4)
}

export function maskEmail(email: string): string {
  if (!email) return ''
  const [name, domain] = email.split('@')
  if (!domain) return maskString(email, 2, 0)
  return maskString(name, 1, 0) + '@' + domain
}

export function maskIdCard(idCard: string): string {
  return maskString(idCard, 6, 4)
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return str.replace(/[&<>"'/]/g, (char) => escapeMap[char])
}

export function unescapeHtml(str: string): string {
  const unescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/'
  }
  return str.replace(/&(amp|lt|gt|quot|#x27|#x2F);/g, (_, entity) => unescapeMap[entity])
}

export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
