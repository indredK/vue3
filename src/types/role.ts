import type { Permission } from './user'

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: number
  permissions: string[]
  dataScope: number
  departmentIds?: number[]
  sort: number
  createdAt: string
  updatedAt?: string
}

export interface RoleWithPermissions extends Role {
  permissionTree: Permission[]
}

export interface RoleForm {
  id?: number
  name: string
  code: string
  description?: string
  status: number
  permissions: string[]
  dataScope: number
  departmentIds?: number[]
  sort: number
}

export interface DataScope {
  value: number
  label: string
  description: string
}

export const DATA_SCOPE: DataScope[] = [
  { value: 1, label: '全部数据', description: '所有部门的数据' },
  { value: 2, label: '租户数据', description: '当前租户的数据' },
  { value: 3, label: '部门数据', description: '本部门及子部门的数据' },
  { value: 4, label: '本人数据', description: '仅自己的数据' }
]

export interface RolePermissionTree {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: number
  children?: RolePermissionTree[]
  checked?: boolean
  disabled?: boolean
}
