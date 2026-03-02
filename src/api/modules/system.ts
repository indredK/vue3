import { get, put, post, del } from '@/api/axios'

export interface SystemConfig {
  id: number
  key: string
  value: any
  type: string
  group: string
  label: string
  description?: string
  sort: number
  status: number
}

export interface ConfigGroup {
  key: string
  name: string
  configs: SystemConfig[]
}

export function getConfigList(group?: string) {
  return get<ConfigGroup[]>('/system/config/list', { group })
}

export function getConfigDetail(id: number) {
  return get<SystemConfig>(`/system/config/${id}`)
}

export function updateConfig(data: { key: string; value: any }) {
  return put<void>('/system/config', data)
}

export function exportConfig() {
  return get<Blob>('/system/config/export', {}, { responseType: 'blob' })
}

export function importConfig(file: FormData) {
  return post<void>('/system/config/import', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export interface ApiKey {
  id: number
  name: string
  key: string
  secret: string
  status: number
  lastUsedAt?: string
  createdAt: string
  expiresAt?: string
}

export function getApiKeyList() {
  return get<ApiKey[]>('/system/api-key/list')
}

export function createApiKey(name: string, expiresAt?: string) {
  return post<ApiKey>('/system/api-key', { name, expiresAt })
}

export function revokeApiKey(id: number) {
  return del<void>(`/system/api-key/${id}`)
}

export function getApiDocs() {
  return get<any>('/system/api-docs')
}
