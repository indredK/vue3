export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'phone' | 'url' | 'ip'
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
}

export interface ValidationResult {
  valid: boolean
  message?: string
  errors: { field: string; message: string }[]
}

export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: { field: string; message: string }[] = []

  for (const rule of rules) {
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: '', message: rule.message || '此字段为必填项' })
      continue
    }

    if (value === undefined || value === null || value === '') {
      continue
    }

    if (rule.type) {
      const typeValid = validateType(value, rule.type)
      if (!typeValid) {
        errors.push({ field: '', message: rule.message || `类型必须是 ${rule.type}` })
        continue
      }
    }

    if (rule.minLength !== undefined && String(value).length < rule.minLength) {
      errors.push({ field: '', message: rule.message || `长度不能少于 ${rule.minLength} 个字符` })
    }

    if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
      errors.push({ field: '', message: rule.message || `长度不能超过 ${rule.maxLength} 个字符` })
    }

    if (rule.min !== undefined && Number(value) < rule.min) {
      errors.push({ field: '', message: rule.message || `值不能小于 ${rule.min}` })
    }

    if (rule.max !== undefined && Number(value) > rule.max) {
      errors.push({ field: '', message: rule.message || `值不能大于 ${rule.max}` })
    }

    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push({ field: '', message: rule.message || '格式不正确' })
    }

    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        errors.push({ field: '', message: result === false ? '验证失败' : result })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

function validateType(value: any, type: string): boolean {
  const typeMap: Record<string, (v: any) => boolean> = {
    string: (v) => typeof v === 'string',
    number: (v) => typeof v === 'number' && !isNaN(v),
    boolean: (v) => typeof v === 'boolean',
    array: (v) => Array.isArray(v),
    object: (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    phone: (v) => /^1[3-9]\d{9}$/.test(v),
    url: (v) => /^https?:\/\/.+/.test(v),
    ip: (v) => /^(\d{1,3}\.){3}\d{1,3}$/.test(v)
  }

  const validator = typeMap[type]
  return validator ? validator(value) : true
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

export function isUrl(value: string): boolean {
  return /^https?:\/\/.+/.test(value)
}

export function isIp(value: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value)
}

export function isIdCard(value: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)
}

export function isStrongPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(value)
}

export function isInteger(value: string | number): boolean {
  return Number.isInteger(Number(value))
}

export function isPositiveInteger(value: string | number): boolean {
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}

export function isDecimal(value: string | number): boolean {
  return /^\d+(\.\d+)?$/.test(String(value))
}

export function isChinese(value: string): boolean {
  return /^[\u4e00-\u9fa5]+$/.test(value)
}

export function isPostalCode(value: string): boolean {
  return /^[1-9]\d{5}$/.test(value)
}

export function validateForm(form: Record<string, any>, rules: Record<string, ValidationRule[]>): ValidationResult {
  const errors: { field: string; message: string }[] = []

  for (const [field, fieldRules] of Object.entries(rules)) {
    const result = validate(form[field], fieldRules)
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ field, message: e.message })))
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
