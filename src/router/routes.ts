import { RouteRecordRaw } from 'vue-router'

export const asyncRoutes: RouteRecordRaw[] = [
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
    path: '/asset',
    meta: {
      title: 'menu.asset',
      icon: 'el-icon-Box',
      roles: ['admin', 'user']
    },
    children: [
      {
        path: 'type',
        name: 'AssetType',
        component: () => import('@/views/asset-type/index.vue'),
        meta: {
          title: 'menu.assetType',
          icon: 'el-icon-Grid',
          roles: ['admin'],
          permissions: ['asset:type:list']
        }
      },
      {
        path: 'list',
        name: 'Asset',
        component: () => import('@/views/asset/index.vue'),
        meta: {
          title: 'menu.assetList',
          icon: 'el-icon-List',
          roles: ['admin', 'user'],
          permissions: ['asset:list']
        }
      }
    ]
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
      title: 'menu.approval',
      icon: 'el-icon-Check',
      roles: ['admin', 'user']
    },
    children: [
      {
        path: 'flow',
        name: 'ApprovalFlow',
        component: () => import('@/views/approval/flow.vue'),
        meta: {
          title: 'menu.approvalFlow',
          icon: 'el-icon-Share',
          roles: ['admin'],
          permissions: ['approval:flow:list']
        }
      },
      {
        path: 'task',
        name: 'ApprovalTask',
        component: () => import('@/views/approval/task.vue'),
        meta: {
          title: 'menu.approvalTask',
          icon: 'el-icon-Tickets',
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
      title: 'menu.rule',
      icon: 'el-icon-Cpu',
      roles: ['admin'],
      permissions: ['rule:list']
    }
  },
  {
    path: '/notification',
    name: 'Notification',
    component: () => import('@/views/notification/index.vue'),
    meta: {
      title: 'menu.notification',
      icon: 'el-icon-Bell',
      roles: ['admin', 'user'],
      permissions: ['notification:list']
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
        path: 'user',
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
        path: 'role',
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
        path: 'permission',
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
        path: 'tenant',
        name: 'Tenant',
        component: () => import('@/views/system/tenant/index.vue'),
        meta: {
          title: 'menu.tenant',
          icon: 'el-icon-OfficeBuilding',
          roles: ['admin'],
          permissions: ['system:tenant:list']
        }
      }
    ]
  },
  {
    path: '/operation',
    meta: {
      title: 'menu.operation',
      icon: 'el-icon-Tools',
      roles: ['admin']
    },
    children: [
      {
        path: 'audit-log',
        name: 'AuditLog',
        component: () => import('@/views/audit-log/index.vue'),
        meta: {
          title: 'menu.auditLog',
          icon: 'el-icon-Document',
          roles: ['admin'],
          permissions: ['system:audit:list']
        }
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system-config/index.vue'),
        meta: {
          title: 'menu.systemConfig',
          icon: 'el-icon-Set',
          roles: ['admin'],
          permissions: ['system:config:list']
        }
      },
      {
        path: 'api',
        name: 'Api',
        component: () => import('@/views/api/index.vue'),
        meta: {
          title: 'menu.api',
          icon: 'el-icon-Connection',
          roles: ['admin'],
          permissions: ['system:api:list']
        }
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: {
      title: 'menu.settings',
      icon: 'el-icon-UserFilled',
      roles: ['admin', 'user']
    }
  }
]
