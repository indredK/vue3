import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

export enum ErrorCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

export enum BusinessErrorCode {
  VALIDATION_ERROR = 1001,
  RESOURCE_NOT_FOUND = 1002,
  RESOURCE_EXISTS = 1003,
  PERMISSION_DENIED = 1004,
  TOKEN_EXPIRED = 1005,
  TOKEN_INVALID = 1006,
  OPERATION_TOO_FREQUENT = 1007,
  DATA_DEPENDENCY_ERROR = 2001,
  BUSINESS_RULE_VIOLATION = 3001
}

export interface ErrorInfo {
  code: number
  message: string
  details?: any
  timestamp?: string
  path?: string
}

export interface ErrorHandlerOptions {
  showMessage?: boolean
  messageType?: 'message' | 'notification' | 'alert'
  customHandler?: (error: ErrorInfo) => void
}

const errorMessages: Record<number, string> = {
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.UNAUTHORIZED]: '登录已过期，请重新登录',
  [ErrorCode.FORBIDDEN]: '没有权限访问此资源',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.UNPROCESSABLE_ENTITY]: '请求参数验证失败',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ErrorCode.GATEWAY_TIMEOUT]: '请求超时',

  [BusinessErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [BusinessErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [BusinessErrorCode.RESOURCE_EXISTS]: '资源已存在',
  [BusinessErrorCode.PERMISSION_DENIED]: '权限不足',
  [BusinessErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [BusinessErrorCode.TOKEN_INVALID]: '登录凭证无效，请重新登录',
  [BusinessErrorCode.OPERATION_TOO_FREQUENT]: '操作过于频繁，请稍后再试',
  [BusinessErrorCode.DATA_DEPENDENCY_ERROR]: '数据关联错误',
  [BusinessErrorCode.BUSINESS_RULE_VIOLATION]: '业务规则校验失败'
}

export function getErrorMessage(code: number, customMessage?: string): string {
  if (customMessage) return customMessage
  return errorMessages[code] || '操作失败，请稍后重试'
}

export function handleError(error: any, options: ErrorHandlerOptions = {}) {
  const {
    showMessage = true,
    messageType = 'message',
    customHandler
  } = options

  let errorInfo: ErrorInfo

  if (error.response) {
    const { status, data } = error.response
    errorInfo = {
      code: status,
      message: data?.message || data?.msg || getErrorMessage(status),
      details: data?.details,
      timestamp: new Date().toISOString()
    }
  } else if (error.request) {
    errorInfo = {
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: '网络连接失败，请检查网络设置',
      details: error.message
    }
  } else {
    errorInfo = {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message || '操作失败，请稍后重试',
      details: error.stack
    }
  }

  console.error('[Error]', errorInfo)

  if (customHandler) {
    customHandler(errorInfo)
  }

  if (showMessage) {
    const message = errorInfo.message

    switch (messageType) {
      case 'notification':
        ElNotification.error({
          title: '错误',
          message,
          duration: 4000
        })
        break
      case 'alert':
        ElMessageBox.alert(message, '错误', {
          type: 'error'
        })
        break
      default:
        ElMessage.error(message)
    }
  }

  if (errorInfo.code === ErrorCode.UNAUTHORIZED || errorInfo.code === BusinessErrorCode.TOKEN_EXPIRED) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  }

  return errorInfo
}

export function handleSuccess(message = '操作成功', options: { type?: 'message' | 'notification' } = {}) {
  const { type = 'message' } = options

  if (type === 'notification') {
    ElNotification.success({
      title: '成功',
      message,
      duration: 3000
    })
  } else {
    ElMessage.success(message)
  }
}

export function handleWarning(message: string, options: { type?: 'message' | 'notification' } = {}) {
  const { type = 'message' } = options

  if (type === 'notification') {
    ElNotification.warning({
      title: '警告',
      message,
      duration: 4000
    })
  } else {
    ElMessage.warning(message)
  }
}

export function handleInfo(message: string, options: { type?: 'message' | 'notification' } = {}) {
  const { type = 'message' } = options

  if (type === 'notification') {
    ElNotification.info({
      title: '提示',
      message,
      duration: 3000
    })
  } else {
    ElMessage.info(message)
  }
}

export function showConfirm(message: string, title = '确认操作'): Promise<void> {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => resolve())
      .catch(() => reject(new Error('User cancelled')))
  })
}

export function logError(error: ErrorInfo): void {
  const logData = {
    ...error,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }

  console.error('[Error Log]', logData)

  if (import.meta.env.PROD) {
    // In production, you would send to a logging service
    // Example: sendToLoggingService(logData)
  }
}

export function isNetworkError(error: any): boolean {
  return !error.response && !error.request
}

export function isBusinessError(error: any): boolean {
  return error.response?.status === BusinessErrorCode.VALIDATION_ERROR ||
    error.response?.status === BusinessErrorCode.BUSINESS_RULE_VIOLATION
}

export function isAuthError(error: any): boolean {
  const status = error.response?.status
  return status === ErrorCode.UNAUTHORIZED ||
    status === BusinessErrorCode.TOKEN_EXPIRED ||
    status === BusinessErrorCode.TOKEN_INVALID
}
