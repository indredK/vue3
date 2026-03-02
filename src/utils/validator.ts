export const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '此项为必填项'
    }
    return true
  },

  email: (value: string) => {
    if (!value) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return '请输入有效的邮箱地址'
    }
    return true
  },

  phone: (value: string) => {
    if (!value) return true
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      return '请输入有效的手机号码'
    }
    return true
  },

  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return '请输入有效的URL'
    }
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return true
    if (value.length < min) {
      return `长度不能少于${min}个字符`
    }
    return true
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return true
    if (value.length > max) {
      return `长度不能超过${max}个字符`
    }
    return true
  },

  min: (min: number) => (value: number) => {
    if (value === null || value === undefined) return true
    if (value < min) {
      return `值不能小于${min}`
    }
    return true
  },

  max: (max: number) => (value: number) => {
    if (value === null || value === undefined) return true
    if (value > max) {
      return `值不能大于${max}`
    }
    return true
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value) return true
    if (!regex.test(value)) {
      return message
    }
    return true
  }
}

export function validate(value: any, rules: Array<(value: any) => true | string>) {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) {
      return result
    }
  }
  return true
}

export function validateForm(form: Record<string, any>, rules: Record<string, Array<(value: any) => true | string>>) {
  const errors: Record<string, string> = {}
  
  for (const field in rules) {
    const value = form[field]
    const fieldRules = rules[field]
    const result = validate(value, fieldRules)
    
    if (result !== true) {
      errors[field] = result
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
