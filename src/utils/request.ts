import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { AuditLog } from '@/types/auditLog'

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number }
  auditLog?: AuditLog
}

const auditLogs: AuditLog[] = []

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

function getOperationType(url: string, method: string): { module: string; operation: string } {
  const urlMap: Record<string, { module: string; operation: string }> = {
    '/api/auth/login': { module: 'user', operation: 'login' },
    '/api/auth/logout': { module: 'user', operation: 'logout' },
    '/api/user': { module: 'user', operation: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'query' },
    '/api/role': { module: 'role', operation: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'query' },
    '/api/permission': { module: 'permission', operation: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'query' },
    '/api/asset': { module: 'asset', operation: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : method === 'DELETE' ? 'delete' : 'query' },
    '/api/asset-type': { module: 'asset', operation: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'query' },
    '/api/order': { module: 'order', operation: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'query' },
    '/api/approval': { module: 'approval', operation: 'approve' },
    '/api/rule': { module: 'system', operation: method === 'POST' ? 'config' : method === 'PUT' ? 'config' : 'query' },
    '/api/system/config': { module: 'system', operation: 'config' }
  }

  for (const [key, value] of Object.entries(urlMap)) {
    if (url.includes(key)) {
      return value
    }
  }

  return { module: 'system', operation: 'query' }
}

function getClientInfo() {
  return {
    ip: '192.168.1.100',
    location: '内网',
    userAgent: navigator.userAgent
  }
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const extConfig = config as ExtendedAxiosRequestConfig
    const startTime = Date.now()
    extConfig.metadata = { startTime }

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const clientInfo = getClientInfo()
    const url = config.url || ''
    const method = (config.method || 'GET').toUpperCase()
    const { module, operation } = getOperationType(url, method)

    const logEntry: AuditLog = {
      id: Date.now(),
      userId: userInfo.id || 0,
      username: userInfo.username || 'anonymous',
      nickname: userInfo.nickname || '未知用户',
      module,
      operation,
      method,
      url: (config.baseURL || '') + url,
      ip: clientInfo.ip,
      location: clientInfo.location,
      userAgent: clientInfo.userAgent,
      requestParams: config.data || config.params || {},
      status: 0,
      duration: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    extConfig.auditLog = logEntry

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const extConfig = response.config as ExtendedAxiosRequestConfig
    const endTime = Date.now()

    if (extConfig.auditLog) {
      const auditLog = extConfig.auditLog
      auditLog.status = response.status
      auditLog.duration = endTime - (extConfig.metadata?.startTime || endTime)
      auditLog.responseResult = response.data

      auditLogs.push(auditLog)

      if (import.meta.env.DEV) {
        console.log('[Audit Log]', auditLog)
      }

      const maxLogs = 1000
      if (auditLogs.length > maxLogs) {
        auditLogs.splice(0, auditLogs.length - maxLogs)
      }
    }

    const { data } = response
    
    if (data.code === 200 || data.success) {
      return data.data || data
    }
    
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    const extConfig = error.config as ExtendedAxiosRequestConfig | undefined
    const endTime = Date.now()

    if (extConfig?.auditLog) {
      const auditLog = extConfig.auditLog
      auditLog.status = error.response?.status || 500
      auditLog.duration = endTime - (extConfig.metadata?.startTime || endTime)
      auditLog.errorMessage = error.message

      auditLogs.push(auditLog)
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export function getAuditLogs(): AuditLog[] {
  return [...auditLogs]
}

export function clearAuditLogs(): void {
  auditLogs.length = 0
}

export default function <T = any>(config: AxiosRequestConfig): Promise<T> {
  return request(config) as Promise<T>
}

export { request }
