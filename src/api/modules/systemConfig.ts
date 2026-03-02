import request from '@/utils/request'
import type { SystemConfig, ConfigGroup, ConfigImportResult } from '@/types/systemConfig'

export interface SystemConfigListParams {
  group?: ConfigGroup
  keyword?: string
  page?: number
  size?: number
}

export interface SystemConfigListResponse {
  list: SystemConfig[]
  total: number
  page: number
  size: number
}

export function getSystemConfigListApi(params: SystemConfigListParams) {
  return request<SystemConfigListResponse>({
    url: '/system/config/list',
    method: 'get',
    params
  })
}

export function getSystemConfigByKeyApi(key: string) {
  return request<SystemConfig>({
    url: `/system/config/${key}`,
    method: 'get'
  })
}

export function updateSystemConfigApi(key: string, value: string) {
  return request({
    url: `/system/config/${key}`,
    method: 'put',
    data: { configValue: value }
  })
}

export function batchUpdateSystemConfigApi(configs: { key: string; value: string }[]) {
  return request({
    url: '/system/config/batch',
    method: 'put',
    data: { configs }
  })
}

export function resetSystemConfigApi(key: string) {
  return request({
    url: `/system/config/${key}/reset`,
    method: 'post'
  })
}

export function exportSystemConfigApi() {
  return request({
    url: '/system/config/export',
    method: 'get',
    responseType: 'blob'
  })
}

export function importSystemConfigApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<ConfigImportResult>({
    url: '/system/config/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getConfigGroupStatsApi() {
  return request<{ group: ConfigGroup; count: number }[]>({
    url: '/system/config/stats',
    method: 'get'
  })
}
