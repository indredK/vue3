import { get, post, del, put } from '@/api/axios'
import type { Role, Permission } from '@/types/user'
import type { PageParams, PageResult } from '@/types/common'

export interface RoleQueryParams extends PageParams {
  keyword?: string
  status?: number
}

export interface PermissionQueryParams {
  type?: string
  status?: number
}

export function getRoleList(params: RoleQueryParams) {
  return get<PageResult<Role>>('/system/role/list', params)
}

export function getRoleDetail(id: number) {
  return get<Role>(`/system/role/${id}`)
}

export function createRole(data: Partial<Role>) {
  return post<Role>('/system/role', data)
}

export function updateRole(id: number, data: Partial<Role>) {
  return put<Role>(`/system/role/${id}`, data)
}

export function deleteRole(id: number) {
  return del<void>(`/system/role/${id}`)
}

export function updateRoleStatus(id: number, status: number) {
  return put<void>(`/system/role/${id}/status`, { status })
}

export function assignRolePermissions(id: number, permissionCodes: string[]) {
  return put<void>(`/system/role/${id}/permissions`, { permissionCodes })
}

export function getRolePermissions(id: number) {
  return get<string[]>(`/system/role/${id}/permissions`)
}

export function getPermissionList(params?: PermissionQueryParams) {
  return get<PageResult<Permission>>('/system/permission/list', params)
}

export function getPermissionTree() {
  return get<Permission[]>('/system/permission/tree')
}

export function getAllPermissions() {
  return get<string[]>('/system/permission/all')
}
