import request from '@/utils/request'
import type { Rule, RuleCondition, RuleAction, RuleExecutionLog } from '@/types/rule'

export interface RuleListParams {
  page: number
  size: number
  keyword?: string
  triggerType?: string
  status?: number
}

export interface RuleListResponse {
  list: Rule[]
  total: number
  page: number
  size: number
}

export function getRuleListApi(params: RuleListParams) {
  return request<RuleListResponse>({
    url: '/rule/list',
    method: 'get',
    params
  })
}

export function getRuleDetailApi(id: number) {
  return request<Rule>({
    url: `/rule/${id}`,
    method: 'get'
  })
}

export function createRuleApi(data: Partial<Rule>) {
  return request<Rule>({
    url: '/rule',
    method: 'post',
    data
  })
}

export function updateRuleApi(id: number, data: Partial<Rule>) {
  return request<Rule>({
    url: `/rule/${id}`,
    method: 'put',
    data
  })
}

export function deleteRuleApi(id: number) {
  return request({
    url: `/rule/${id}`,
    method: 'delete'
  })
}

export function updateRuleStatusApi(id: number, status: number) {
  return request({
    url: `/rule/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function executeRuleApi(id: number, data?: Record<string, any>) {
  return request({
    url: `/rule/${id}/execute`,
    method: 'post',
    data
  })
}

export function getRuleExecutionLogsApi(ruleId: number, params?: { page: number; size: number }) {
  return request<{ list: RuleExecutionLog[]; total: number }>({
    url: `/rule/${ruleId}/logs`,
    method: 'get',
    params
  })
}

export function testRuleConditionsApi(conditions: RuleCondition[], testData: Record<string, any>) {
  return request<{ result: boolean; matchedConditions: number[] }>({
    url: '/rule/test-conditions',
    method: 'post',
    data: { conditions, testData }
  })
}

export function getRuleStatisticsApi() {
  return request<{
    total: number
    enabled: number
    disabled: number
    executionsToday: number
    executionsSuccess: number
    executionsFailed: number
  }>({
    url: '/rule/statistics',
    method: 'get'
  })
}
