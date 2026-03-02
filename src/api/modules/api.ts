import request from '@/utils/request'
import type { ApiKey, ApiCallLog, ApiStatistics, ApiEndpoint } from '@/types/api'

export interface ApiKeyListParams {
  page: number
  size: number
  status?: string
  keyword?: string
}

export interface ApiKeyListResponse {
  list: ApiKey[]
  total: number
  page: number
  size: number
}

export function getApiKeyListApi(params: ApiKeyListParams) {
  return request<ApiKeyListResponse>({
    url: '/api/key/list',
    method: 'get',
    params
  })
}

export function createApiKeyApi(data: {
  name: string
  description?: string
  permissions: string[]
  expiresAt?: string
}) {
  return request<ApiKey>({
    url: '/api/key',
    method: 'post',
    data
  })
}

export function revokeApiKeyApi(id: number) {
  return request({
    url: `/api/key/${id}/revoke`,
    method: 'post'
  })
}

export function deleteApiKeyApi(id: number) {
  return request({
    url: `/api/key/${id}`,
    method: 'delete'
  })
}

export function getApiCallLogListApi(params: {
  page: number
  size: number
  apiKeyId?: number
  startDate?: string
  endDate?: string
  status?: number
}) {
  return request<{ list: ApiCallLog[]; total: number }>({
    url: '/api/log/list',
    method: 'get',
    params
  })
}

export function getApiStatisticsApi() {
  return request<ApiStatistics>({
    url: '/api/log/statistics',
    method: 'get'
  })
}

export function getApiEndpointsApi() {
  return request<ApiEndpoint[]>({
    url: '/api/endpoints',
    method: 'get'
  })
}

export function testApiEndpointApi(data: {
  method: string
  path: string
  headers?: Record<string, string>
  body?: any
}) {
  return request({
    url: '/api/test',
    method: 'post',
    data
  })
}
