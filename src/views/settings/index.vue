<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const settingsForm = reactive({
  siteName: '电池银行资产监控平台',
  siteDesc: 'Battery Bank Asset Management Platform',
  language: localStorage.getItem('locale') || 'zh-CN',
  theme: 'light',
  compactMode: false,
  showTagsView: true,
  showSidebarLogo: true,
  fixedHeader: true
})

const handleSave = () => {
  localStorage.setItem('locale', settingsForm.language)
  locale.value = settingsForm.language
  ElMessage.success(t('common.success'))
}

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]
</script>

<template>
  <div class="settings-page">
    <el-card>
      <h3 class="settings-title">系统设置</h3>
      
      <el-form :model="settingsForm" label-width="140px" class="settings-form">
        <el-form-item label="站点名称">
          <el-input v-model="settingsForm.siteName" />
        </el-form-item>
        
        <el-form-item label="站点描述">
          <el-input v-model="settingsForm.siteDesc" />
        </el-form-item>
        
        <el-form-item label="语言">
          <el-select v-model="settingsForm.language">
            <el-option
              v-for="item in languageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="主题">
          <el-radio-group v-model="settingsForm.theme">
            <el-radio label="light">浅色</el-radio>
            <el-radio label="dark">深色</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="紧凑模式">
          <el-switch v-model="settingsForm.compactMode" />
        </el-form-item>
        
        <el-form-item label="显示标签页">
          <el-switch v-model="settingsForm.showTagsView" />
        </el-form-item>
        
        <el-form-item label="显示侧边栏Logo">
          <el-switch v-model="settingsForm.showSidebarLogo" />
        </el-form-item>
        
        <el-form-item label="固定头部">
          <el-switch v-model="settingsForm.fixedHeader" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="info-card">
      <h3 class="settings-title">系统信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
        <el-descriptions-item label="构建时间">2024-01-15</el-descriptions-item>
        <el-descriptions-item label="Vue 版本">3.4.x</el-descriptions-item>
        <el-descriptions-item label="Element Plus">2.6.x</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped>
.settings-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.settings-form {
  max-width: 600px;
}

.info-card {
  margin-top: 20px;
}
</style>
