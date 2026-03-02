<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore, type ThemeColor } from '@/stores/theme'
import { filterAsyncRoutes, asyncRoutes } from '@/router'
import * as elementIcons from '@element-plus/icons-vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

const isCollapse = ref(false)
const activeMenu = ref('')
const messageDropdownVisible = ref(false)
const openedMenus = ref<string[]>([])

const allRoutesList = computed(() => {
  const userRoles = userStore.userInfo?.roles || ['admin']
  const userPermissions = userStore.userInfo?.permissions || []
  
  const filteredRoutes = filterAsyncRoutes(asyncRoutes, userRoles, userPermissions)
  console.log('Menu routes after permission filter:', filteredRoutes.map((r: any) => ({ 
    path: r.path, 
    hasChildren: !!r.children, 
    childrenCount: r.children?.length,
    meta: r.meta
  })))
  
  return filteredRoutes
})

const isSubMenu = (item: any) => {
  return item.children && item.children.length > 0
}

const getMenuPath = (parent: any, child: any): string => {
  if (child.path.startsWith('/')) {
    return child.path
  }
  if (parent.path.startsWith('/')) {
    return `${parent.path}/${child.path}`
  }
  return `/${parent.path}/${child.path}`
}

const handleMenuSelect = (key: string) => {
  const parentPath = '/' + key.split('/')[1]
  if (parentPath && parentPath !== '/') {
    const currentIndex = openedMenus.value.indexOf(parentPath)
    if (currentIndex === -1) {
      openedMenus.value = [parentPath]
    } else {
      openedMenus.value = [parentPath]
    }
  }
}

const handleMenuClose = (index: string) => {
  const i = openedMenus.value.indexOf(index)
  if (i !== -1) {
    openedMenus.value.splice(i, 1)
  }
}

const recentNotifications = computed(() => {
  return notificationStore.notifications.slice(0, 5)
})

const switchLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

const handleThemeChange = (command: string) => {
  if (command === 'light' || command === 'dark') {
    themeStore.setMode(command)
  } else {
    themeStore.setPrimaryColor(command as ThemeColor)
  }
}

const handleLogout = async () => {
  await userStore.logout()
}

const handleMessageClick = () => {
  router.push('/notification')
}

const handleMessageDetail = (notification: any) => {
  messageDropdownVisible.value = false
  if (notification.relatedUrl) {
    router.push(notification.relatedUrl)
  }
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    approval: '#409eff',
    rule: '#67c23a',
    system: '#e6a23c',
    announcement: '#909399'
  }
  return colorMap[type] || '#909399'
}

const formatTime = (time: string) => {
  const now = new Date()
  const date = new Date(time)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time.substring(0, 10)
}

onMounted(async () => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  
  if (!userStore.userInfo) {
    await userStore.getUserInfo()
    await userStore.initRoutes()
  }
  
  activeMenu.value = route.path

  await notificationStore.fetchNotifications()
  notificationStore.startPolling(30000)
})

onUnmounted(() => {
  notificationStore.stopPolling()
})

watch(() => route.path, (path) => {
  activeMenu.value = path
  
  const pathParts = path.split('/').filter(Boolean)
  if (pathParts.length > 1) {
    const parentPath = '/' + pathParts[0]
    if (!openedMenus.value.includes(parentPath)) {
      openedMenus.value = [parentPath]
    }
  } else {
    openedMenus.value = []
  }
})

const getIcon = (iconName?: unknown) => {
  const name = (typeof iconName === 'string' ? iconName : '') || 'Menu'
  return (elementIcons as any)[name.replace('el-icon-', '')] || elementIcons.Menu
}
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
        <div class="logo">
          <el-icon :size="24" class="logo-icon"><component :is="getIcon('el-icon-DataAnalysis')" /></el-icon>
          <span v-show="!isCollapse" class="logo-text">{{ t('layout.title') }}</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :default-openeds="openedMenus"
          :collapse="isCollapse"
          :collapse-transition="false"
          :unique-opened="true"
          class="sidebar-menu"
          router
          @select="handleMenuSelect"
          @close="handleMenuClose"
        >
          <template v-for="item in allRoutesList" :key="String(item.path)">
            <el-menu-item v-if="!isSubMenu(item)" :index="String(item.path)">
              <el-icon><component :is="getIcon(item.meta?.icon)" /></el-icon>
              <template #title>{{ t(item.meta?.title as string) }}</template>
            </el-menu-item>
            
            <el-sub-menu v-else :index="String(item.path)">
              <template #title>
                <el-icon><component :is="getIcon(item.meta?.icon)" /></el-icon>
                <span>{{ t(item.meta?.title as string) }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="String(child.path)"
                :index="getMenuPath(item, child)"
              >
                <el-icon><component :is="getIcon(child.meta?.icon)" /></el-icon>
                <template #title>{{ t(child.meta?.title as string) }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-icon" @click="isCollapse = !isCollapse">
              <component :is="getIcon(isCollapse ? 'el-icon-Expand' : 'el-icon-Fold')" />
            </el-icon>
          </div>
          
          <div class="header-right">
            <el-popover
              v-model:visible="messageDropdownVisible"
              placement="bottom-end"
              :width="360"
              trigger="click"
            >
              <template #reference>
                <div class="message-icon-wrapper">
                  <el-badge :value="notificationStore.unreadCount" :hidden="notificationStore.unreadCount === 0" :max="99">
                    <el-icon :size="20"><component :is="getIcon('el-icon-Bell')" /></el-icon>
                  </el-badge>
                </div>
              </template>
              <div class="message-dropdown">
                <div class="message-dropdown-header">
                  <span class="message-dropdown-title">消息通知</span>
                  <el-button type="primary" link size="small" @click="handleMessageClick">
                    查看全部
                  </el-button>
                </div>
                <div class="message-list">
                  <div
                    v-for="notification in recentNotifications"
                    :key="notification.id"
                    class="message-item"
                    :class="{ 'unread': !notification.isRead }"
                    @click="handleMessageDetail(notification)"
                  >
                    <div class="message-item-icon" :style="{ backgroundColor: getTypeColor(notification.type) }">
                      <el-icon>
                        <component :is="getIcon(notification.type === 'approval' ? 'el-icon-Check' : notification.type === 'rule' ? 'el-icon-Cpu' : notification.type === 'system' ? 'el-icon-Bell' : 'el-icon-Megaphone')" />
                      </el-icon>
                    </div>
                    <div class="message-item-content">
                      <div class="message-item-title">{{ notification.title }}</div>
                      <div class="message-item-time">{{ formatTime(notification.createdAt) }}</div>
                    </div>
                    <div v-if="!notification.isRead" class="message-item-dot" />
                  </div>
                  <div v-if="recentNotifications.length === 0" class="message-empty">
                    暂无消息
                  </div>
                </div>
              </div>
            </el-popover>
            
            <el-dropdown @command="handleThemeChange">
              <span class="language-switch">
                <el-icon><component :is="getIcon('el-icon-Brush')" /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>
                    <span style="font-weight: bold">主题模式</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="light" :disabled="themeStore.mode === 'light'">
                    <el-icon><component :is="getIcon('el-icon-Sunny')" /></el-icon>
                    浅色模式
                  </el-dropdown-item>
                  <el-dropdown-item command="dark" :disabled="themeStore.mode === 'dark'">
                    <el-icon><component :is="getIcon('el-icon-Moon')" /></el-icon>
                    深色模式
                  </el-dropdown-item>
                  <el-dropdown-item divided disabled>
                    <span style="font-weight: bold">主题颜色</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="default">
                    <span class="color-dot" style="background: #409eff"></span>
                    蓝色
                  </el-dropdown-item>
                  <el-dropdown-item command="blue">
                    <span class="color-dot" style="background: #1890ff"></span>
                    藏青
                  </el-dropdown-item>
                  <el-dropdown-item command="green">
                    <span class="color-dot" style="background: #52c41a"></span>
                    绿色
                  </el-dropdown-item>
                  <el-dropdown-item command="purple">
                    <span class="color-dot" style="background: #722ed1"></span>
                    紫色
                  </el-dropdown-item>
                  <el-dropdown-item command="red">
                    <span class="color-dot" style="background: #f5222d"></span>
                    红色
                  </el-dropdown-item>
                  <el-dropdown-item command="orange">
                    <span class="color-dot" style="background: #fa8c16"></span>
                    橙色
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <el-dropdown trigger="click" @command="switchLanguage">
              <span class="language-switch">
                <el-icon><component :is="getIcon('el-icon-Language')" /></el-icon>
                <span>{{ locale === 'zh-CN' ? '中文' : 'EN' }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-CN" :disabled="locale === 'zh-CN'">
                    中文
                  </el-dropdown-item>
                  <el-dropdown-item command="en-US" :disabled="locale === 'en-US'">
                    English
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <el-dropdown @command="handleLogout">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
                <span class="username">{{ userStore.userInfo?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><component :is="getIcon('el-icon-SwitchButton')" /></el-icon>
                    {{ t('layout.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #2b3a4a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.logo-icon {
  color: #409eff;
}

.sidebar-menu {
  border-right: none;
  background: #304156;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #4a5a6a;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: #263445;
}

:deep(.el-menu-item.is-active) {
  background: #409eff !important;
  color: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.message-icon-wrapper {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-icon-wrapper:hover {
  background: #f5f7fa;
}

.language-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.language-switch:hover {
  background: #f5f7fa;
}

.color-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
}

.message-dropdown {
  margin: -12px;
}

.message-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.message-dropdown-title {
  font-size: 14px;
  font-weight: bold;
}

.message-list {
  max-height: 360px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.message-item:hover {
  background: #f5f7fa;
}

.message-item.unread {
  background: #ecf5ff;
}

.message-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.message-item-content {
  flex: 1;
  min-width: 0;
}

.message-item-title {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.message-item-dot {
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-empty {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
