export interface AuditLog {
  id: number
  userId: number
  username: string
  nickname: string
  module: string
  operation: string
  method: string
  url: string
  ip: string
  location?: string
  userAgent?: string
  requestParams?: Record<string, any>
  responseResult?: any
  status: number
  errorMessage?: string
  duration: number
  createdAt: string
}

export interface AuditLogDetail {
  id: number
  userId: number
  username: string
  nickname: string
  module: string
  operation: string
  method: string
  url: string
  ip: string
  location?: string
  requestParams?: Record<string, any>
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  changes?: FieldChange[]
  status: number
  errorMessage?: string
  duration: number
  createdAt: string
}

export interface FieldChange {
  field: string
  fieldLabel: string
  oldValue: string
  newValue: string
}

export interface LogRetentionPolicy {
  id: number
  name: string
  retentionDays: number
  archiveEnabled: boolean
  archivePath?: string
  autoDelete: boolean
  status: number
  createdAt: string
}

export const OPERATION_TYPES = [
  { label: '登录', value: 'login', module: '系统' },
  { label: '登出', value: 'logout', module: '系统' },
  { label: '新增', value: 'create', module: '业务' },
  { label: '修改', value: 'update', module: '业务' },
  { label: '删除', value: 'delete', module: '业务' },
  { label: '查询', value: 'query', module: '业务' },
  { label: '导入', value: 'import', module: '业务' },
  { label: '导出', value: 'export', module: '业务' },
  { label: '审批', value: 'approve', module: '审批' },
  { label: '拒绝', value: 'reject', module: '审批' },
  { label: '配置', value: 'config', module: '系统' },
  { label: '权限变更', value: 'permission', module: '系统' }
]

export const MODULE_TYPES = [
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '权限管理', value: 'permission' },
  { label: '资产管理', value: 'asset' },
  { label: '订单管理', value: 'order' },
  { label: '审批管理', value: 'approval' },
  { label: '系统配置', value: 'system' }
]

export const RETENTION_OPTIONS = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
  { label: '180天', value: 180 },
  { label: '365天', value: 365 },
  { label: '永久保留', value: 0 }
]
