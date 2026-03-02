import request from '@/utils/request'
import type { AuditLog, AuditLogDetail, LogRetentionPolicy } from '@/types/auditLog'

export interface AuditLogListParams {
  page: number
  size: number
  keyword?: string
  username?: string
  module?: string
  operation?: string
  startDate?: string
  endDate?: string
  status?: number
}

export interface AuditLogListResponse {
  list: AuditLog[]
  total: number
  page: number
  size: number
}

export function getAuditLogListApi(params: AuditLogListParams) {
  return request<AuditLogListResponse>({
    url: '/audit/log/list',
    method: 'get',
    params
  })
}

export function getAuditLogDetailApi(id: number) {
  return request<AuditLogDetail>({
    url: `/audit/log/${id}`,
    method: 'get'
  })
}

export function exportAuditLogsApi(params: AuditLogListParams, format: 'csv' | 'excel') {
  return request({
    url: '/audit/log/export',
    method: 'get',
    params: { ...params, format },
    responseType: 'blob'
  })
}

export function getLogStatisticsApi() {
  return request<{
    totalCount: number
    todayCount: number
    errorCount: number
    moduleDistribution: { module: string; count: number }[]
    dailyTrend: { date: string; count: number }[]
  }>({
    url: '/audit/log/statistics',
    method: 'get'
  })
}

export function getRetentionPolicyApi() {
  return request<LogRetentionPolicy>({
    url: '/audit/log/policy',
    method: 'get'
  })
}

export function updateRetentionPolicyApi(data: Partial<LogRetentionPolicy>) {
  return request({
    url: '/audit/log/policy',
    method: 'put',
    data
  })
}

export function cleanOldLogsApi(days: number) {
  return request({
    url: '/audit/log/clean',
    method: 'post',
    data: { days }
  })
}

export function archiveLogsApi(startDate: string, endDate: string) {
  return request({
    url: '/audit/log/archive',
    method: 'post',
    data: { startDate, endDate }
  })
}
