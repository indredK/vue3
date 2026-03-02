export interface Rule {
  id: number
  name: string
  code: string
  description?: string
  triggerType: 'data_change' | 'schedule' | 'manual'
  triggerConfig?: TriggerConfig
  conditions: RuleCondition[]
  actions: RuleAction[]
  status: number
  priority: number
  executionCount: number
  lastExecuteTime?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export interface TriggerConfig {
  cron?: string
  assetTypeId?: number
  events?: string[]
}

export interface RuleCondition {
  id: number
  field: string
  fieldLabel: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'in' | 'not_in' | 'like' | 'not_like' | 'is_null' | 'is_not_null' | 'between'
  value: any
  logic: 'and' | 'or'
  children?: RuleCondition[]
}

export interface RuleAction {
  id: number
  actionType: 'update_field' | 'change_status' | 'send_notification' | 'call_api' | 'create_record'
  actionName: string
  config: Record<string, any>
  order: number
}

export interface RuleExecutionLog {
  id: number
  ruleId: number
  ruleName: string
  triggerType: string
  triggerData?: Record<string, any>
  conditionsResult: boolean
  actionsResult: ActionResult[]
  executionTime: number
  status: 'success' | 'failed' | 'partial'
  errorMessage?: string
  executedBy: string
  executedAt: string
}

export interface ActionResult {
  actionId: number
  actionName: string
  success: boolean
  message?: string
  result?: any
}

export const TRIGGER_TYPES = [
  { label: '数据变更触发', value: 'data_change', description: '当资产数据发生变更时触发' },
  { label: '定时任务触发', value: 'schedule', description: '按照Cron表达式定时触发' },
  { label: '手动触发', value: 'manual', description: '需要手动执行' }
]

export const OPERATORS = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'ne' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'ge' },
  { label: '小于等于', value: 'le' },
  { label: '在范围内', value: 'in' },
  { label: '不在范围内', value: 'not_in' },
  { label: '包含', value: 'like' },
  { label: '不包含', value: 'not_like' },
  { label: '为空', value: 'is_null' },
  { label: '不为空', value: 'is_not_null' },
  { label: '介于', value: 'between' }
]

export const ACTION_TYPES = [
  { label: '更新字段', value: 'update_field', description: '更新资产的指定字段值' },
  { label: '变更状态', value: 'change_status', description: '变更资产的状态' },
  { label: '发送通知', value: 'send_notification', description: '发送系统通知' },
  { label: '调用接口', value: 'call_api', description: '调用外部API接口' },
  { label: '创建记录', value: 'create_record', description: '创建新的资产记录' }
]

export const LOGIC_OPERATORS = [
  { label: '并且 (AND)', value: 'and' },
  { label: '或者 (OR)', value: 'or' }
]
