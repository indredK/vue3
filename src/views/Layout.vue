<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { 
  Odometer, 
  Fold, 
  Expand, 
  SwitchButton,
  Menu,
  DataAnalysis,
  Setting,
  User,
  Lock,
  Monitor,
  Document,
  Tools,
  Connection,
  ShoppingCart,
  Money,
  Switch
} from '@element-plus/icons-vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = ref('')

const sidebarRoutes = computed(() => {
  const routes = router.getRoutes()
  const layout = routes.find(r => r.name === 'Layout')
  return layout?.children?.filter((r: any) => !r.meta?.hidden) || []
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

const iconMap: Record<string, any> = {
  'el-icon-DataAnalysis': DataAnalysis,
  'el-icon-Setting': Setting,
  'el-icon-User': User,
  'el-icon-Menu': Menu,
  'el-icon-Lock': Lock,
  'el-icon-Monitor': Monitor,
  'el-icon-Battery': Odometer,
  'el-icon-List': Menu,
  'el-icon-Document': Document,
  'el-icon-Tools': Tools,
  'el-icon-Connection': Connection,
  'el-icon-ShoppingCart': ShoppingCart,
  'el-icon-Money': Money
}

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Menu
}
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        <div class="logo">
          <el-icon :size="24" class="logo-icon"><Odometer /></el-icon>
          <span v-show="!isCollapse" class="logo-text">{{ t('layout.title') }}</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="sidebar-menu"
          router
        >
          <template v-for="item in sidebarRoutes" :key="item.path">
            <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path">
              <el-icon><component :is="getIcon(item.meta?.icon as string || 'Menu')" /></el-icon>
              <template #title>{{ t((item.meta?.title as string) || '') }}</template>
            </el-menu-item>
            
            <el-sub-menu v-else :index="item.path">
              <template #title>
                <el-icon><component :is="getIcon(item.meta?.icon as string || 'Menu')" /></el-icon>
                <span>{{ t((item.meta?.title as string) || '') }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.path"
                :index="child.path"
              >
                <el-icon><component :is="getIcon(child.meta?.icon as string || 'Menu')" /></el-icon>
                <template #title>{{ t((child.meta?.title as string) || '') }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-icon" @click="isCollapse = !isCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="switchLanguage">
              <span class="language-switch">
                <el-icon><Switch /></el-icon>
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
                    <el-icon><SwitchButton /></el-icon>
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
  overflow: hidden;
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
}

.logo-icon {
  color: #409eff;
}

.sidebar-menu {
  border-right: none;
  background: #304156;
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
