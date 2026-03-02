import request from '@/utils/request'
import type { User, UserForm, LoginParams, LoginResult } from '@/types/user'
import type { Role, RoleForm, Permission, PermissionTree } from '@/types/user'

export interface UserListParams {
  page: number
  size: number
  username?: string
  status?: number
  departmentId?: number
}

export interface UserListResponse {
  list: User[]
  total: number
  page: number
  size: number
}

// 用户管理 API
export function getUserListApi(params: UserListParams) {
  return request<UserListResponse>({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

export function getUserDetailApi(id: number) {
  return request<User>({
    url: `/system/user/${id}`,
    method: 'get'
  })
}

export function createUserApi(data: UserForm) {
  return request<User>({
    url: '/system/user',
    method: 'post',
    data
  })
}

export function updateUserApi(id: number, data: UserForm) {
  return request<User>({
    url: `/system/user/${id}`,
    method: 'put',
    data
  })
}

export function deleteUserApi(id: number) {
  return request({
    url: `/system/user/${id}`,
    method: 'delete'
  })
}

export function updateUserStatusApi(id: number, status: number) {
  return request({
    url: `/system/user/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function assignUserRolesApi(userId: number, roleIds: number[]) {
  return request({
    url: `/system/user/${userId}/roles`,
    method: 'put',
    data: { roleIds }
  })
}

// 角色管理 API
export interface RoleListParams {
  page: number
  size: number
  name?: string
  status?: number
}

export interface RoleListResponse {
  list: Role[]
  total: number
  page: number
  size: number
}

export function getRoleListApi(params: RoleListParams) {
  return request<RoleListResponse>({
    url: '/system/role/list',
    method: 'get',
    params
  })
}

export function getRoleDetailApi(id: number) {
  return request<Role>({
    url: `/system/role/${id}`,
    method: 'get'
  })
}

export function createRoleApi(data: RoleForm) {
  return request<Role>({
    url: '/system/role',
    method: 'post',
    data
  })
}

export function updateRoleApi(id: number, data: RoleForm) {
  return request<Role>({
    url: `/system/role/${id}`,
    method: 'put',
    data
  })
}

export function deleteRoleApi(id: number) {
  return request({
    url: `/system/role/${id}`,
    method: 'delete'
  })
}

export function updateRoleStatusApi(id: number, status: number) {
  return request({
    url: `/system/role/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function getPermissionTreeApi() {
  return request<PermissionTree[]>({
    url: '/system/permission/tree',
    method: 'get'
  })
}

export function assignRolePermissionsApi(roleId: number, permissionIds: number[], dataScope: number, departmentIds?: number[]) {
  return request({
    url: `/system/role/${roleId}/permissions`,
    method: 'put',
    data: { permissionIds, dataScope, departmentIds }
  })
}

// 权限管理 API
export function getAllPermissionsApi() {
  return request<Permission[]>({
    url: '/system/permission/all',
    method: 'get'
  })
}

export function getPermissionTreeByRoleApi(roleId: number) {
  return request<PermissionTree[]>({
    url: `/system/role/${roleId}/permissions/tree`,
    method: 'get'
  })
}
