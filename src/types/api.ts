export interface ApiKey {
  id: number
  name: string
  key: string
  secret?: string
  userId: number
  username: string
  description?: string
  permissions: string[]
  expiresAt?: string
  lastUsedAt?: string
  callCount: number
  status: ApiKeyStatus
  createdAt: string
  updatedAt?: string
}

export type ApiKeyStatus = 'active' | 'expired' | 'revoked'

export interface ApiEndpoint {
  id: string
  path: string
  method: HttpMethod
  summary: string
  description?: string
  tags: string[]
  parameters: ApiParameter[]
  requestBody?: ApiRequestBody
  responses: ApiResponse[]
  security: boolean
  deprecated: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiParameter {
  name: string
  in: 'query' | 'path' | 'header' | 'body'
  required: boolean
  type: string
  description?: string
  defaultValue?: string
}

export interface ApiRequestBody {
  contentType: string
  schema: string
  example?: Record<string, any>
}

export interface ApiResponse {
  statusCode: number
  description: string
  schema?: string
  example?: Record<string, any>
}

export interface ApiCallLog {
  id: number
  apiKeyId: number
  apiKeyName: string
  endpoint: string
  method: HttpMethod
  path: string
  queryParams?: Record<string, any>
  requestHeaders?: Record<string, string>
  requestBody?: any
  responseStatus: number
  responseBody?: any
  responseTime: number
  ip: string
  userAgent?: string
  createdAt: string
}

export interface ApiStatistics {
  totalCalls: number
  successCalls: number
  errorCalls: number
  avgResponseTime: number
  topEndpoints: { endpoint: string; count: number }[]
  dailyTrend: { date: string; count: number }[]
}

export const API_TAGS = [
  { name: '认证', description: '登录、登出、Token相关接口' },
  { name: '用户', description: '用户管理相关接口' },
  { name: '角色', description: '角色管理相关接口' },
  { name: '资产', description: '资产管理相关接口' },
  { name: '订单', description: '订单管理相关接口' },
  { name: '审批', description: '审批管理相关接口' },
  { name: '通知', description: '消息通知相关接口' }
]

export const DEFAULT_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'auth-login',
    path: '/api/auth/login',
    method: 'POST',
    summary: '用户登录',
    description: '使用用户名密码登录系统，返回访问令牌',
    tags: ['认证'],
    parameters: [],
    requestBody: {
      contentType: 'application/json',
      schema: 'LoginRequest',
      example: { username: 'admin', password: 'admin123' }
    },
    responses: [
      { statusCode: 200, description: '登录成功', example: { token: 'xxx', user: {} } },
      { statusCode: 401, description: '用户名或密码错误' }
    ],
    security: false,
    deprecated: false
  },
  {
    id: 'auth-logout',
    path: '/api/auth/logout',
    method: 'POST',
    summary: '用户登出',
    description: '使当前访问令牌失效',
    tags: ['认证'],
    parameters: [],
    responses: [
      { statusCode: 200, description: '登出成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'user-list',
    path: '/api/user',
    method: 'GET',
    summary: '获取用户列表',
    description: '分页获取用户列表，支持关键词搜索',
    tags: ['用户'],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer', description: '页码，默认1' },
      { name: 'size', in: 'query', required: false, type: 'integer', description: '每页数量，默认10' },
      { name: 'keyword', in: 'query', required: false, type: 'string', description: '关键词搜索' }
    ],
    responses: [
      { statusCode: 200, description: '成功', example: { list: [], total: 0 } }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'user-create',
    path: '/api/user',
    method: 'POST',
    summary: '创建用户',
    description: '创建一个新的用户账号',
    tags: ['用户'],
    parameters: [],
    requestBody: {
      contentType: 'application/json',
      schema: 'CreateUserRequest',
      example: { username: 'newuser', nickname: '新用户', password: 'password123', email: 'user@example.com' }
    },
    responses: [
      { statusCode: 201, description: '创建成功' },
      { statusCode: 400, description: '参数错误' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'asset-list',
    path: '/api/asset',
    method: 'GET',
    summary: '获取资产列表',
    description: '分页获取资产列表，支持多种筛选条件',
    tags: ['资产'],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer' },
      { name: 'size', in: 'query', required: false, type: 'integer' },
      { name: 'status', in: 'query', required: false, type: 'string', description: '资产状态' },
      { name: 'category', in: 'query', required: false, type: 'string', description: '资产分类' }
    ],
    responses: [
      { statusCode: 200, description: '成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'asset-create',
    path: '/api/asset',
    method: 'POST',
    summary: '创建资产',
    description: '创建一条新的资产记录',
    tags: ['资产'],
    parameters: [],
    requestBody: {
      contentType: 'application/json',
      schema: 'CreateAssetRequest',
      example: { name: '笔记本电脑', category: 'electronics', serialNumber: 'SN001' }
    },
    responses: [
      { statusCode: 201, description: '创建成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'order-list',
    path: '/api/order',
    method: 'GET',
    summary: '获取订单列表',
    description: '分页获取订单列表',
    tags: ['订单'],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer' },
      { name: 'size', in: 'query', required: false, type: 'integer' },
      { name: 'status', in: 'query', required: false, type: 'string' }
    ],
    responses: [
      { statusCode: 200, description: '成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'order-create',
    path: '/api/order',
    method: 'POST',
    summary: '创建订单',
    description: '创建一个新的订单',
    tags: ['订单'],
    parameters: [],
    requestBody: {
      contentType: 'application/json',
      schema: 'CreateOrderRequest',
      example: { orderType: 'purchase', customerName: '客户A', totalAmount: 10000 }
    },
    responses: [
      { statusCode: 201, description: '创建成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'approval-list',
    path: '/api/approval',
    method: 'GET',
    summary: '获取审批列表',
    description: '获取当前用户的审批任务列表',
    tags: ['审批'],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer' },
      { name: 'status', in: 'query', required: false, type: 'string', description: '审批状态' }
    ],
    responses: [
      { statusCode: 200, description: '成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'approval-action',
    path: '/api/approval/{id}/action',
    method: 'POST',
    summary: '审批操作',
    description: '对审批任务进行通过或拒绝操作',
    tags: ['审批'],
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'integer', description: '审批任务ID' }
    ],
    requestBody: {
      contentType: 'application/json',
      schema: 'ApprovalActionRequest',
      example: { action: 'approve', comment: '同意' }
    },
    responses: [
      { statusCode: 200, description: '操作成功' }
    ],
    security: true,
    deprecated: false
  },
  {
    id: 'notification-list',
    path: '/api/notification',
    method: 'GET',
    summary: '获取通知列表',
    description: '获取当前用户的消息通知列表',
    tags: ['通知'],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer' },
      { name: 'type', in: 'query', required: false, type: 'string', description: '通知类型' },
      { name: 'isRead', in: 'query', required: false, type: 'boolean', description: '已读状态' }
    ],
    responses: [
      { statusCode: 200, description: '成功' }
    ],
    security: true,
    deprecated: false
  }
]
