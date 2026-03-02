import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/views/Layout.vue'

const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    name: 'MainLayout',
    redirect: '/dashboard',
    children: [],
    meta: { hidden: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  }
]

const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: 'menu.dashboard',
      icon: 'el-icon-DataAnalysis',
      roles: ['admin', 'user']
    }
  },
  {
    path: '/device',
    name: 'Device',
    component: () => import('@/views/device/index.vue'),
    meta: {
      title: 'menu.device',
      icon: 'el-icon-Monitor',
      roles: ['admin', 'user'],
      permissions: ['device:list']
    }
  },
  {
    path: '/asset-type',
    name: 'AssetType',
    component: () => import('@/views/asset-type/index.vue'),
    meta: {
      title: '资产类型管理',
      icon: 'el-icon-Grid',
      roles: ['admin'],
      permissions: ['asset:type:list']
    }
  },
  {
    path: '/asset',
    name: 'Asset',
    component: () => import('@/views/asset/index.vue'),
    meta: {
      title: 'menu.asset',
      icon: 'el-icon-Box',
      roles: ['admin', 'user'],
      permissions: ['asset:list']
    }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/order/index.vue'),
    meta: {
      title: 'menu.order',
      icon: 'el-icon-Document',
      roles: ['admin', 'user'],
      permissions: ['order:list']
    }
  },
  {
    path: '/approval',
    meta: {
      title: '审批管理',
      icon: 'el-icon-Check',
      roles: ['admin', 'user'],
      permissions: ['approval:list']
    },
    children: [
      {
        path: 'flow',
        name: 'ApprovalFlow',
        component: () => import('@/views/approval/flow.vue'),
        meta: {
          title: '审批流程配置',
          roles: ['admin'],
          permissions: ['approval:flow:list']
        }
      },
      {
        path: 'task',
        name: 'ApprovalTask',
        component: () => import('@/views/approval/task.vue'),
        meta: {
          title: '审批任务',
          roles: ['admin', 'user'],
          permissions: ['approval:task:list']
        }
      }
    ]
  },
  {
    path: '/rule',
    name: 'Rule',
    component: () => import('@/views/rule/index.vue'),
    meta: {
      title: '规则引擎',
      icon: 'el-icon-Cpu',
      roles: ['admin'],
      permissions: ['rule:list']
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: {
      title: 'menu.settings',
      icon: 'el-icon-Tools',
      roles: ['admin']
    }
  },
  {
    path: '/system',
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
      },
      {
        path: '/system/tenant',
        name: 'Tenant',
        component: () => import('@/views/system/tenant/index.vue'),
        meta: {
          title: 'menu.tenant',
          icon: 'el-icon-OfficeBuilding',
          roles: ['admin'],
          permissions: ['system:tenant:list']
        }
      },
      {
        path: '/system/audit-log',
        name: 'AuditLog',
        component: () => import('@/views/audit-log/index.vue'),
        meta: {
          title: '审计日志',
          icon: 'el-icon-Document',
          roles: ['admin'],
          permissions: ['system:audit:list']
        }
      },
      {
        path: '/notification',
        name: 'Notification',
        component: () => import('@/views/notification/index.vue'),
        meta: {
          title: '消息中心',
          icon: 'el-icon-Bell',
          roles: ['admin', 'user'],
          permissions: ['notification:list']
        }
      },
      {
        path: '/system-config',
        name: 'SystemConfig',
        component: () => import('@/views/system-config/index.vue'),
        meta: {
          title: '系统配置',
          icon: 'el-icon-Tools',
          roles: ['admin'],
          permissions: ['system:config:list']
        }
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory('/vue3-admin-platform/'),
  routes: constantRoutes
})

export function resetRouter() {
  router.options.routes = constantRoutes
}

export function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[], permissions: string[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []

  routes.forEach(route => {
    const tmp = { ...route }

    if (hasPermission(roles, permissions, tmp.meta)) {
      if (tmp.children && tmp.children.length > 0) {
        // 递归过滤子路由
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions)
        
        // 如果过滤后还有子路由，保留父路由
        if (tmp.children.length > 0) {
          res.push(tmp)
        }
      } else if (!tmp.children || tmp.children.length === 0) {
        // 没有子路由的路由直接添加
        res.push(tmp)
      }
    }
  })

  return res
}

function hasPermission(roles: string[], permissions: string[], meta: any): boolean {
  if (!meta) return true

  const { roles: metaRoles, permissions: metaPermissions } = meta

  // 如果用户是 admin 角色，直接返回 true
  if (roles.includes('admin')) {
    return true
  }

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
  
  const userRoles = userStore.userInfo?.roles || ['admin']
  const userPermissions = userStore.userInfo?.permissions || []
  
  console.log('Loading routes with:', { userRoles, userPermissions })
  
  const accessedRoutes = filterAsyncRoutes(
    asyncRoutes,
    userRoles,
    userPermissions
  )

  console.log('Filtered routes:', accessedRoutes)
  
  accessedRoutes.forEach(route => {
    router.addRoute('MainLayout', route)
  })

  return accessedRoutes
}

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  if (to.path === '/login') {
    next()
    return
  }

  if (!userStore.token) {
    next('/login')
    return
  }

  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
      await userStore.initRoutes()
      next({ ...to, replace: true })
      return
    } catch (error) {
      userStore.logout()
      next('/login')
      return
    }
  }

  next()
})

export default router
