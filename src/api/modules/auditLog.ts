import { get, del } from '@/api/axios'
import type { PageResult, PageParams } from '@/types/common'

export interface AuditLog {
  id: number
  userId: number
  userName: string
  module: string
  operation: string
  method: string
  url: string
  ip: string
  location?: string
  params?: Record<string, any>
  result?: string
  status: number
  duration?: number
  errorMessage?: string
  createdAt: string
}

export interface AuditLogQueryParams extends PageParams {
  userId?: number
  module?: string
  operation?: string
  status?: number
  startDate?: string
  endDate?: string
  keyword?: string
}

export function getAuditLogList(params: AuditLogQueryParams) {
  return get<PageResult<AuditLog>>('/audit/log/list', params)
}

export function getAuditLogDetail(id: number) {
  return get<AuditLog>(`/audit/log/${id}`)
}

export function exportAuditLogs(params: AuditLogQueryParams) {
  return get<Blob>('/audit/log/export', params, {
    responseType: 'blob'
  })
}

export function cleanAuditLogs(days: number) {
  return del<void>('/audit/log/clean', { days })
}
