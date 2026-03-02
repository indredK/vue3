import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/views/Layout.vue'
import { asyncRoutes } from './routes'

export { asyncRoutes }

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

    const routeHasPermission = hasPermission(roles, permissions, tmp.meta)
    const childrenHavePermission = tmp.children ? hasAnyChildPermission(tmp.children, roles, permissions) : false

    if (routeHasPermission || childrenHavePermission) {
      if (tmp.children && tmp.children.length > 0) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions)
        
        if (tmp.children.length > 0) {
          res.push(tmp)
        }
      } else if (!tmp.children || tmp.children.length === 0) {
        res.push(tmp)
      }
    }
  })

  return res
}

function hasAnyChildPermission(children: RouteRecordRaw[], roles: string[], permissions: string[]): boolean {
  for (const child of children) {
    if (hasPermission(roles, permissions, child.meta)) {
      return true
    }
    if (child.children) {
      if (hasAnyChildPermission(child.children, roles, permissions)) {
        return true
      }
    }
  }
  return false
}

function hasPermission(roles: string[], permissions: string[], meta: any): boolean {
  if (!meta) return true

  const { roles: metaRoles, permissions: metaPermissions } = meta

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

  const filteredRoutes = filterAsyncRoutes(asyncRoutes, userRoles, userPermissions)
  console.log('Filtered routes:', filteredRoutes.map((r: any) => ({ path: r.path, hasChildren: !!r.children })))
  
  filteredRoutes.forEach((route: RouteRecordRaw) => {
    router.addRoute('MainLayout', route)
  })
  
  console.log('Added routes to router, current routes:', router.getRoutes().map(r => r.path))
  
  return filteredRoutes
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
