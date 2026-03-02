import { get, post, del, put } from '@/api/axios'
import type { PageResult, PageParams } from '@/types/common'

export type TriggerType = 'data_change' | 'schedule' | 'manual'
export type ActionType = 'update_field' | 'change_status' | 'send_notification' | 'call_api'

export interface Rule {
  id: number
  name: string
  code: string
  description?: string
  entityType: string
  triggerType: TriggerType
  conditions: RuleCondition[]
  actions: RuleAction[]
  status: number
  createdBy?: number
  createdAt: string
  updatedAt?: string
}

export interface RuleCondition {
  id?: number
  field: string
  operator: string
  value: any
  logic?: 'and' | 'or'
  children?: RuleCondition[]
}

export interface RuleAction {
  id?: number
  type: ActionType
  config: Record<string, any>
  order: number
}

export interface RuleExecutionLog {
  id: number
  ruleId: number
  ruleName: string
  triggerType: TriggerType
  triggerData?: Record<string, any>
  status: 'success' | 'failed' | 'skipped'
  inputData?: Record<string, any>
  outputData?: Record<string, any>
  errorMessage?: string
  executedBy?: number
  executedAt: string
}

export interface RuleQueryParams extends PageParams {
  keyword?: string
  entityType?: string
  triggerType?: TriggerType
  status?: number
}

export interface TestRuleParams {
  ruleId?: number
  conditions: RuleCondition[]
  testData: Record<string, any>
}

export function getRuleList(params: RuleQueryParams) {
  return get<PageResult<Rule>>('/rule/list', params)
}

export function getRuleDetail(id: number) {
  return get<Rule>(`/rule/${id}`)
}

export function createRule(data: Partial<Rule>) {
  return post<Rule>('/rule', data)
}

export function updateRule(data: Partial<Rule>) {
  return put<Rule>(`/rule/${data.id}`, data)
}

export function deleteRule(id: number) {
  return del<void>(`/rule/${id}`)
}

export function updateRuleStatus(id: number, status: number) {
  return put<void>(`/rule/${id}/status`, { status })
}

export function testRule(params: TestRuleParams) {
  return post<{ matched: boolean; result: any }>('/rule/test', params)
}

export function executeRule(ruleId: number, data: Record<string, any>) {
  return post<void>(`/rule/${ruleId}/execute`, data)
}

export function getRuleLogs(ruleId?: number) {
  return get<PageResult<RuleExecutionLog>>('/rule/log', { ruleId })
}
