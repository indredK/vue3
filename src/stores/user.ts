import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { loadAsyncRoutes } from '@/router'

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  status: number
  roles: string[]
  permissions: string[]
  departmentId?: number
  departmentName?: string
  createdAt: string
  updatedAt?: string
  lastLogin?: string
}

export interface Tenant {
  id: number
  name: string
  code: string
  status: number
  quota: {
    maxUsers: number
    maxAssets: number
    maxOrders: number
  }
  config: {
    themeColor: string
    logo: string
    enabledModules: string[]
  }
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = shallowRef<User | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const routesLoaded = ref(false)
  const currentTenant = ref<Tenant | null>(null)

  const mockUserData: User = {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    email: 'admin@universalasset.com',
    phone: '13800138000',
    status: 1,
    roles: ['admin'],
    permissions: [
      'system:user:list',
      'system:user:add',
      'system:user:edit',
      'system:user:delete',
      'system:role:list',
      'system:role:add',
      'system:role:edit',
      'system:role:delete',
      'system:role:permission',
      'system:permission:list',
      'system:tenant:list',
      'system:tenant:add',
      'system:tenant:edit',
      'system:tenant:delete',
      'system:tenant:quota',
      'system:tenant:config',
      'device:list',
      'device:add',
      'device:edit',
      'device:delete',
      'asset:list',
      'asset:add',
      'asset:edit',
      'asset:delete',
      'order:list',
      'order:add',
      'order:edit',
      'order:delete',
      'asset:type:list',
      'asset:type:add',
      'asset:type:edit',
      'asset:type:delete',
      'approval:list',
      'approval:flow:list',
      'approval:flow:add',
      'approval:flow:edit',
      'approval:flow:delete',
      'approval:task:list',
      'approval:task:approve',
      'approval:task:reject',
      'approval:task:transfer',
      'rule:list',
      'rule:add',
      'rule:edit',
      'rule:delete',
      'rule:execute'
    ],
    createdAt: '2024-01-01 00:00:00'
  }

  const mockTenant: Tenant = {
    id: 1,
    name: '默认租户',
    code: 'default',
    status: 1,
    quota: {
      maxUsers: 100,
      maxAssets: 1000,
      maxOrders: 5000
    },
    config: {
      themeColor: '#409eff',
      logo: '',
      enabledModules: ['device', 'asset', 'order']
    }
  }

  async function login(username: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          token.value = 'mock-token-' + Date.now()
          localStorage.setItem('token', token.value)
          resolve()
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  async function getUserInfo() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        userInfo.value = mockUserData
        permissions.value = mockUserData.permissions
        roles.value = mockUserData.roles
        currentTenant.value = mockTenant
        localStorage.setItem('tenantId', String(mockTenant.id))
        resolve()
      }, 300)
    })
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    roles.value = []
    routesLoaded.value = false
    currentTenant.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('tenantId')
    router.push('/login')
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  async function initRoutes() {
    if (!routesLoaded.value) {
      await loadAsyncRoutes()
      routesLoaded.value = true
    }
  }

  function setTenant(tenant: Tenant) {
    currentTenant.value = tenant
    localStorage.setItem('tenantId', String(tenant.id))
  }

  return {
    token,
    userInfo,
    permissions,
    roles,
    routesLoaded,
    currentTenant,
    login,
    getUserInfo,
    logout,
    hasPermission,
    hasRole,
    initRoutes,
    setTenant
  }
})
