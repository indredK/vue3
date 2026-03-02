<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import * as elementIcons from '@element-plus/icons-vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = ref('')

const sidebarRoutes = computed(() => {
  const routes = router.getRoutes()
  console.log('All routes:', routes.map(r => ({ path: r.path, hasChildren: !!r.children?.length })))
  
  // 筛选出应该显示的顶级菜单路由
  const menuRoutes = routes.filter((r: any) => {
    // 排除登录页和根路由
    if (r.path === '/login' || r.path === '/') return false
    // 排除被标记为隐藏的
    if (r.meta?.hidden) return false
    return true
  })
  
  console.log('Menu routes:', menuRoutes.map(r => ({ path: r.path, hasChildren: !!r.children?.length })))
  
  // 直接使用路由中已经定义好的 children
  const groupedRoutes = menuRoutes.map((route: any) => {
    // 如果有 children，直接返回
    if (route.children && route.children.length > 0) {
      return route
    }
    
    // 如果没有 children，检查是否有其他路由以其为父路径
    const parts = route.path.split('/').filter(Boolean)
    if (parts.length === 1) {
      // 顶级路径，查找所有以该路径开头的子路由
      const children = menuRoutes.filter((r: any) => {
        const rParts = r.path.split('/').filter(Boolean)
        return rParts.length > 1 && rParts[0] === parts[0]
      })
      
      if (children.length > 0) {
        return {
          ...route,
          children: children
        }
      }
    }
    
    return route
  })
  
  console.log('Grouped routes:', groupedRoutes.map(r => ({ path: r.path, hasChildren: !!r.children?.length })))
  
  return groupedRoutes
})

const switchLanguage = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const handleLogout = async () => {
  await userStore.logout()
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
})

watch(() => route.path, (path) => {
  activeMenu.value = path
})

const getIcon = (iconName?: unknown) => {
  const name = (typeof iconName === 'string' ? iconName : '') || 'Menu'
  return (elementIcons as any)[name.replace('el-icon-', '')] || elementIcons.Menu
}

const getTitle = (title?: unknown): string => {
  return typeof title === 'string' ? title : ''
}
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        <div class="logo">
          <el-icon :size="24" class="logo-icon"><element-icon-DataAnalysis /></el-icon>
          <span v-show="!isCollapse" class="logo-text">{{ t('layout.title') }}</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="sidebar-menu"
          router
        >
          <template v-for="item in sidebarRoutes" :key="String(item.path)">
            <el-menu-item v-if="!item.children || item.children.length === 0" :index="String(item.path)">
              <el-icon><component :is="getIcon(item.meta?.icon)" /></el-icon>
              <template #title>{{ t(getTitle(item.meta?.title)) }}</template>
            </el-menu-item>
            
            <el-sub-menu v-else :index="String(item.path)">
              <template #title>
                <el-icon><component :is="getIcon(item.meta?.icon)" /></el-icon>
                <span>{{ t(getTitle(item.meta?.title)) }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="String(child.path)"
                :index="String(child.path)"
              >
                <el-icon><component :is="getIcon(child.meta?.icon)" /></el-icon>
                <template #title>{{ t(getTitle(child.meta?.title)) }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-icon" @click="isCollapse = !isCollapse">
              <element-icon-Fold v-if="!isCollapse" />
              <element-icon-Expand v-else />
            </el-icon>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="switchLanguage">
              <span class="language-switch">
                <el-icon><element-icon-Language /></el-icon>
                <span>{{ locale === 'zh-CN' ? '中文' : 'EN' }}</span>
              </span>
            </el-dropdown>
            
            <el-dropdown @command="handleLogout">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
                <span class="username">{{ userStore.userInfo?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><element-icon-SwitchButton /></el-icon>
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

.main-content {
  background: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
