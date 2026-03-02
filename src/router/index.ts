import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/views/Layout.vue'

const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    redirect: '/login',
    meta: { hidden: true }
  }
]

const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: 'menu.dashboard',
          icon: 'el-icon-DataAnalysis',
          roles: ['admin', 'user']
        }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: {
      title: 'menu.system',
      icon: 'el-icon-Setting',
      roles: ['admin']
    },
    children: [
      {
        path: '/system/user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: 'menu.user',
          icon: 'el-icon-User',
          roles: ['admin'],
          permissions: ['system:user:list']
        }
      },
      {
        path: '/system/role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: 'menu.role',
          icon: 'el-icon-Menu',
          roles: ['admin'],
          permissions: ['system:role:list']
        }
      },
      {
        path: '/system/permission',
        name: 'Permission',
        component: () => import('@/views/system/permission/index.vue'),
        meta: {
          title: 'menu.permission',
          icon: 'el-icon-Lock',
          roles: ['admin'],
          permissions: ['system:permission:list']
        }
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    redirect: '/device/list',
    meta: {
      title: 'menu.device',
      icon: 'el-icon-Monitor',
      roles: ['admin', 'user']
    },
    children: [
      {
        path: '/device/list',
        name: 'DeviceList',
        component: () => import('@/views/device/index.vue'),
        meta: {
          title: 'menu.device',
          icon: 'el-icon-List',
          roles: ['admin', 'user'],
          permissions: ['device:list']
        }
      }
    ]
  },
  {
    path: '/battery',
    component: Layout,
    redirect: '/battery/list',
    meta: {
      title: 'menu.battery',
      icon: 'el-icon-Battery',
      roles: ['admin', 'user']
    },
    children: [
      {
        path: '/battery/list',
        name: 'BatteryList',
        component: () => import('@/views/battery/index.vue'),
        meta: {
          title: 'menu.battery',
          icon: 'el-icon-List',
          roles: ['admin', 'user'],
          permissions: ['battery:list']
        }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    meta: {
      title: 'menu.order',
      icon: 'el-icon-Document',
      roles: ['admin', 'user']
    },
    children: [
      {
        path: '/order/list',
        name: 'OrderList',
        component: () => import('@/views/order/index.vue'),
        meta: {
          title: 'menu.order',
          icon: 'el-icon-List',
          roles: ['admin', 'user'],
          permissions: ['order:list']
        }
      }
    ]
  },
  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/index',
    meta: {
      title: 'menu.settings',
      icon: 'el-icon-Tools',
      roles: ['admin']
    },
    children: [
      {
        path: '/settings/index',
        name: 'SettingsIndex',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: 'menu.settings',
          icon: 'el-icon-Tools',
          roles: ['admin']
        }
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  console.log('[Router Guard] 导航到:', to.path)
  console.log('[Router Guard] Token:', userStore.token ? '存在' : '不存在')
  console.log('[Router Guard] UserInfo:', userStore.userInfo ? '存在' : '不存在')
  console.log('[Router Guard] RoutesLoaded:', userStore.routesLoaded)
  
  // 如果访问登录页
  if (to.path === '/login') {
    if (userStore.token) {
      console.log('[Router Guard] 已登录，跳转到 dashboard')
      next('/dashboard')
    } else {
      console.log('[Router Guard] 未登录，显示登录页')
      next()
    }
    return
  }
  
  // 如果访问根路径且已登录，跳转到 dashboard
  if (to.path === '/' && userStore.token) {
    console.log('[Router Guard] 根路径已登录，跳转到 dashboard')
    next('/dashboard')
    return
  }
  
  // 如果没有 token，跳转到登录页
  if (!userStore.token) {
    console.log('[Router Guard] 无 token，跳转到登录页')
    next('/login')
    return
  }
  
  // 如果有 token 但没有用户信息，获取用户信息并加载路由
  if (!userStore.userInfo) {
    console.log('[Router Guard] 获取用户信息并加载路由')
    try {
      await userStore.getUserInfo()
      await userStore.initRoutes()
      console.log('[Router Guard] 路由加载完成，重新导航')
      // 重新导航到目标路由，确保动态路由已加载
      next({ ...to, replace: true })
    } catch (error) {
      console.error('[Router Guard] 加载失败:', error)
      await userStore.logout()
      next('/login')
    }
    return
  }
  
  // 如果有用户信息但路由未加载（刷新页面的情况）
  if (!userStore.routesLoaded) {
    console.log('[Router Guard] 刷新页面，重新加载路由')
    try {
      await userStore.initRoutes()
      console.log('[Router Guard] 路由重新加载完成')
      // 重新导航到目标路由
      next({ ...to, replace: true })
    } catch (error) {
      console.error('[Router Guard] 重新加载失败:', error)
      await userStore.logout()
      next('/login')
    }
    return
  }
  
  // 正常导航
  console.log('[Router Guard] 正常导航')
  next()
})

export function resetRouter() {
  // Note: router.matcher is deprecated in Vue Router 4
  // Dynamic routes should be managed through addRoute/removeRoute
  // This function is kept for compatibility but doesn't do anything
}

export function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[], permissions: string[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(roles, permissions, tmp.meta)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions)
      }
      res.push(tmp)
    }
  })
  
  return res
}

function hasPermission(roles: string[], permissions: string[], meta: any): boolean {
  if (!meta) return true
  
  const { roles: metaRoles, permissions: metaPermissions } = meta
  
  if (metaRoles && metaRoles.length > 0) {
    return roles.some(role => metaRoles.includes(role))
  }
  
  if (metaPermissions && metaPermissions.length > 0) {
    return permissions.some(permission => metaPermissions.includes(permission))
  }
  
  return true
}

export async function loadAsyncRoutes() {
  const userStore = useUserStore()
  const accessedRoutes = filterAsyncRoutes(asyncRoutes, userStore.userInfo?.roles || [], userStore.userInfo?.permissions || [])
  
  accessedRoutes.forEach(route => {
    router.addRoute(route)
  })
  
  return accessedRoutes
}

export default router
