import { RouteRecordRaw } from 'vue-router'

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '数据看板',
      icon: 'el-icon-DataAnalysis',
      roles: ['admin', 'user']
    }
  },
  {
    path: '/device',
    name: 'Device',
    component: () => import('@/views/device/index.vue'),
    meta: {
      title: '设备管理',
      icon: 'el-icon-Monitor',
      roles: ['admin', 'user'],
      permissions: ['device:list']
    }
  },
  {
    path: '/asset',
    meta: {
      title: '资产管理',
      icon: 'el-icon-Box',
      roles: ['admin', 'user']
    },
    children: [
      {
        path: 'type',
        name: 'AssetType',
        component: () => import('@/views/asset-type/index.vue'),
        meta: {
          title: '资产类型',
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
          title: '资产列表',
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
      title: '订单管理',
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
      roles: ['admin', 'user']
    },
    children: [
      {
        path: 'flow',
        name: 'ApprovalFlow',
        component: () => import('@/views/approval/flow.vue'),
        meta: {
          title: '审批流程',
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
          title: '待办任务',
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
      title: '规则引擎',
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
      title: '消息中心',
      icon: 'el-icon-Bell',
      roles: ['admin', 'user'],
      permissions: ['notification:list']
    }
  },
  {
    path: '/system',
    meta: {
      title: '系统管理',
      icon: 'el-icon-Setting',
      roles: ['admin']
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
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
          title: '角色管理',
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
          title: '权限管理',
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
          title: '租户管理',
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
      title: '运维中心',
      icon: 'el-icon-Tools',
      roles: ['admin']
    },
    children: [
      {
        path: 'audit-log',
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
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system-config/index.vue'),
        meta: {
          title: '系统配置',
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
          title: 'API管理',
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
      title: '个人设置',
      icon: 'el-icon-UserFilled',
      roles: ['admin', 'user']
    }
  }
]
