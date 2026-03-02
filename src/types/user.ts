export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  status: number
  roleIds: number[]
  roles?: string[]
  permissions?: string[]
  departmentId?: number
  departmentName?: string
  createdAt: string
  updatedAt?: string
  lastLogin?: string
}

export interface UserForm {
  id?: number
  username: string
  password?: string
  nickname: string
  avatar?: string
  email: string
  phone: string
  status: number
  roleIds: number[]
  departmentId?: number
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: number
  permissions: string[]
  dataScope?: number
  departmentIds?: number[]
  sort: number
  createdAt: string
  updatedAt?: string
}

export interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: number
  path?: string
  icon?: string
  component?: string
  sort: number
  status: number
  createdAt: string
  updatedAt?: string
  children?: Permission[]
}

export interface PermissionTree {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: number
  children?: PermissionTree[]
  checked?: boolean
  disabled?: boolean
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
