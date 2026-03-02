import { get, post, del, put } from '@/api/axios'
import type { Tenant, TenantQueryParams, CreateTenantParams, UpdateTenantParams } from '@/types/tenant'
import type { PageResult } from '@/types/common'

export function getTenantList(params: TenantQueryParams) {
  return get<PageResult<Tenant>>('/tenant/list', params)
}

export function getTenantDetail(id: number) {
  return get<Tenant>(`/tenant/${id}`)
}

export function createTenant(data: CreateTenantParams) {
  return post<Tenant>('/tenant', data)
}

export function updateTenant(data: UpdateTenantParams) {
  return put<Tenant>(`/tenant/${data.id}`, data)
}

export function deleteTenant(id: number) {
  return del<void>(`/tenant/${id}`)
}

export function updateTenantStatus(id: number, status: number) {
  return put<void>(`/tenant/${id}/status`, { status })
}

export function updateTenantQuota(id: number, quota: any) {
  return put<void>(`/tenant/${id}/quota`, quota)
}

export function updateTenantConfig(id: number, config: any) {
  return put<void>(`/tenant/${id}/config`, config)
}

export function getTenantOptions() {
  return get<Tenant[]>('/tenant/options')
}

export function switchTenant(tenantId: number) {
  return post<{ token: string }>('/tenant/switch', { tenantId })
}
