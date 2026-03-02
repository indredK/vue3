/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
}

interface RouteMeta {
  title: string
  icon?: string
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
  hidden?: boolean
  keepAlive?: boolean
}
