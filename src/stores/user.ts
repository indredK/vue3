import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { loadAsyncRoutes } from '@/router'

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = shallowRef<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const routesLoaded = ref(false)  // 添加路由加载标记
  
  const mockUserData: UserInfo = {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    email: 'admin@batterybank.com',
    phone: '13800138000',
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
      'system:permission:list',
      'device:list',
      'battery:list',
      'order:list'
    ]
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
        resolve()
      }, 300)
    })
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    roles.value = []
    routesLoaded.value = false  // 重置路由加载标记
    localStorage.removeItem('token')
    router.push('/login')
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  async function initRoutes() {
    console.log('[User Store] initRoutes 被调用')
    console.log('[User Store] routesLoaded:', routesLoaded.value)
    if (!routesLoaded.value) {
      console.log('[User Store] 开始加载路由')
      await loadAsyncRoutes()
      routesLoaded.value = true
      console.log('[User Store] 路由加载完成')
    } else {
      console.log('[User Store] 路由已加载，跳过')
    }
  }

  return {
    token,
    userInfo,
    permissions,
    roles,
    routesLoaded,
    login,
    getUserInfo,
    logout,
    hasPermission,
    hasRole,
    initRoutes
  }
})
