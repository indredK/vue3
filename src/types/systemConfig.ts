export interface SystemConfig {
  id: number
  configKey: string
  configValue: string
  configName: string
  configDesc?: string
  configType: ConfigType
  group: ConfigGroup
  isSystem: boolean
  isEncrypted: boolean
  needRestart: boolean
  validator?: string
  defaultValue?: string
  options?: ConfigOption[]
  sort: number
  status: number
  createdAt: string
  updatedAt?: string
}

export type ConfigType = 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'json'

export type ConfigGroup = 'security' | 'performance' | 'business' | 'system'

export interface ConfigOption {
  label: string
  value: string | number | boolean
}

export interface ConfigGroupInfo {
  group: ConfigGroup
  name: string
  icon: string
  description: string
  configCount: number
}

export interface ConfigImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: { key: string; message: string }[]
}

export const CONFIG_GROUPS: { value: ConfigGroup; label: string; icon: string; description: string }[] = [
  { value: 'security', label: '安全配置', icon: 'el-icon-Lock', description: '安全相关的系统配置' },
  { value: 'performance', label: '性能配置', icon: 'el-icon-Speed', description: '性能优化相关配置' },
  { value: 'business', label: '业务配置', icon: 'el-icon-Set', description: '业务功能相关配置' },
  { value: 'system', label: '系统配置', icon: 'el-icon-Setting', description: '基础系统配置' }
]

export const DEFAULT_CONFIGS: SystemConfig[] = [
  {
    id: 1,
    configKey: 'session.timeout',
    configValue: '3600',
    configName: '会话超时时间',
    configDesc: '用户登录后无操作自动退出时间，单位秒',
    configType: 'number',
    group: 'security',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '3600',
    sort: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    configKey: 'password.minLength',
    configValue: '8',
    configName: '密码最小长度',
    configDesc: '用户密码最小字符数',
    configType: 'number',
    group: 'security',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '8',
    sort: 2,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    configKey: 'password.requireSpecialChar',
    configValue: 'true',
    configName: '密码必须包含特殊字符',
    configDesc: '密码是否必须包含特殊字符(!@#$%^&*)',
    configType: 'boolean',
    group: 'security',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'true',
    sort: 3,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 4,
    configKey: 'password.maxRetryCount',
    configValue: '5',
    configName: '密码最大错误次数',
    configDesc: '密码错误次数达到后账户将被锁定',
    configType: 'number',
    group: 'security',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '5',
    sort: 4,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 5,
    configKey: 'password.lockDuration',
    configValue: '1800',
    configName: '密码错误锁定时长',
    configDesc: '密码错误达到最大次数后锁定时长，单位秒',
    configType: 'number',
    group: 'security',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '1800',
    sort: 5,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 6,
    configKey: 'upload.maxFileSize',
    configValue: '10485760',
    configName: '文件上传大小限制',
    configDesc: '单个文件最大上传大小，单位字节',
    configType: 'number',
    group: 'performance',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '10485760',
    options: [
      { label: '1MB', value: 1048576 },
      { label: '5MB', value: 5242880 },
      { label: '10MB', value: 10485760 },
      { label: '20MB', value: 20971520 },
      { label: '50MB', value: 52428800 }
    ],
    sort: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 7,
    configKey: 'upload.allowedExtensions',
    configValue: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip',
    configName: '允许上传的文件类型',
    configDesc: '允许上传的文件扩展名，多个用逗号分隔',
    configType: 'text',
    group: 'performance',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip',
    sort: 2,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 8,
    configKey: 'upload.imageCompress',
    configValue: 'true',
    configName: '图片上传时压缩',
    configDesc: '上传图片是否自动压缩',
    configType: 'boolean',
    group: 'performance',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'true',
    sort: 3,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 9,
    configKey: 'cache.enabled',
    configValue: 'true',
    configName: '启用缓存',
    configDesc: '是否启用系统缓存',
    configType: 'boolean',
    group: 'performance',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'true',
    sort: 4,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 10,
    configKey: 'cache.ttl',
    configValue: '3600',
    configName: '缓存默认过期时间',
    configDesc: '缓存默认过期时间，单位秒',
    configType: 'number',
    group: 'performance',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '3600',
    sort: 5,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 11,
    configKey: 'business.assetDepreciationMethod',
    configValue: 'straight_line',
    configName: '资产折旧方法',
    configDesc: '资产折旧计算方式',
    configType: 'select',
    group: 'business',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'straight_line',
    options: [
      { label: '直线法', value: 'straight_line' },
      { label: '年数总和法', value: 'sum_of_years' },
      { label: '双倍余额递减法', value: 'double_declining' }
    ],
    sort: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 12,
    configKey: 'business.assetDefaultLife',
    configValue: '60',
    configName: '资产默认使用年限',
    configDesc: '新资产默认的使用年限，单位月',
    configType: 'number',
    group: 'business',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '60',
    sort: 2,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 13,
    configKey: 'business.orderAutoApprove',
    configValue: 'false',
    configName: '订单自动审批',
    configDesc: '是否启用订单自动审批（金额小于阈值时）',
    configType: 'boolean',
    group: 'business',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'false',
    sort: 3,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 14,
    configKey: 'business.orderAutoApproveThreshold',
    configValue: '10000',
    configName: '订单自动审批阈值',
    configDesc: '金额小于此值时自动审批，单位：元',
    configType: 'number',
    group: 'business',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '10000',
    sort: 4,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 15,
    configKey: 'system.siteName',
    configValue: '通用资产管理平台',
    configName: '系统名称',
    configDesc: '系统显示名称',
    configType: 'text',
    group: 'system',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: '通用资产管理平台',
    sort: 1,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 16,
    configKey: 'system.enableRegister',
    configValue: 'false',
    configName: '允许用户注册',
    configDesc: '是否开放用户自行注册',
    configType: 'boolean',
    group: 'system',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'false',
    sort: 2,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 17,
    configKey: 'system.defaultLanguage',
    configValue: 'zh-CN',
    configName: '默认语言',
    configDesc: '系统默认语言',
    configType: 'select',
    group: 'system',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'zh-CN',
    options: [
      { label: '中文', value: 'zh-CN' },
      { label: 'English', value: 'en-US' }
    ],
    sort: 3,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 18,
    configKey: 'system.enableWatermark',
    configValue: 'true',
    configName: '启用水印',
    configDesc: '是否启用页面水印',
    configType: 'boolean',
    group: 'system',
    isSystem: false,
    isEncrypted: false,
    needRestart: false,
    defaultValue: 'true',
    sort: 4,
    status: 1,
    createdAt: '2024-01-01 00:00:00'
  }
]
