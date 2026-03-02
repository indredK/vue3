<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { SystemConfig, ConfigGroup, ConfigType } from '@/types/systemConfig'
import { CONFIG_GROUPS, DEFAULT_CONFIGS } from '@/types/systemConfig'

const { t } = useI18n()

const activeGroup = ref<ConfigGroup>('security')
const configList = ref<SystemConfig[]>([])
const loading = ref(false)
const editDialogVisible = ref(false)
const currentConfig = ref<SystemConfig | null>(null)
const editForm = reactive({
  configValue: ''
})
const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importResult = ref<{ success: boolean; imported: number; skipped: number; errors: { key: string; message: string }[] } | null>(null)

const groupStats = computed(() => {
  return CONFIG_GROUPS.map(group => ({
    ...group,
    configCount: configList.value.filter(c => c.group === group.value).length
  }))
})

const currentGroupConfigs = computed(() => {
  return configList.value
    .filter(c => c.group === activeGroup.value)
    .sort((a, b) => a.sort - b.sort)
})

const loadConfigs = async () => {
  loading.value = true
  try {
    configList.value = DEFAULT_CONFIGS.map(c => ({ ...c }))
  } catch (error) {
    console.error('Failed to load configs:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (config: SystemConfig) => {
  currentConfig.value = config
  editForm.configValue = config.configValue
  editDialogVisible.value = true
}

const handleSave = async () => {
  if (!currentConfig.value) return

  const config = currentConfig.value
  if (config.configType === 'number') {
    const numValue = Number(editForm.configValue)
    if (isNaN(numValue)) {
      ElMessage.error('请输入有效的数字')
      return
    }
    if (config.configKey.includes('minLength') || config.configKey.includes('retry') || config.configKey.includes('Duration') || config.configKey.includes('size') || config.configKey.includes('Life') || config.configKey.includes('threshold') || config.configKey.includes('ttl')) {
      if (numValue < 0) {
        ElMessage.error('数值不能为负数')
        return
      }
    }
  }

  const target = configList.value.find(c => c.id === config.id)
  if (target) {
    target.configValue = editForm.configValue
    target.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  ElMessage.success('配置保存成功')
  if (config.needRestart) {
    ElMessage.warning('此配置需要重启系统后生效')
  }
  editDialogVisible.value = false
}

const handleReset = async (config: SystemConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置 "${config.configName}" 到默认值吗?`,
      '重置确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const target = configList.value.find(c => c.id === config.id)
    if (target) {
      target.configValue = target.defaultValue || ''
      target.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    ElMessage.success('配置已重置')
    if (config.needRestart) {
      ElMessage.warning('此配置需要重启系统后生效')
    }
  } catch {
    console.log('Cancelled')
  }
}

const handleExport = async () => {
  try {
    const exportData = configList.value.map(c => ({
      key: c.configKey,
      value: c.configValue,
      name: c.configName,
      group: c.group
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system-config-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('配置导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

const handleImportClick = () => {
  importResult.value = null
  importFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  importFile.value = file.raw
  return false
}

const handleImport = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的配置文件')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfigs = JSON.parse(e.target?.result as string)
        if (!Array.isArray(importedConfigs)) {
          ElMessage.error('配置文件格式错误')
          return
        }

        const errors: { key: string; message: string }[] = []
        let imported = 0
        let skipped = 0

        importedConfigs.forEach((item: any) => {
          if (!item.key) {
            errors.push({ key: item.key || 'unknown', message: '配置键不能为空' })
            skipped++
            return
          }

          const target = configList.value.find(c => c.configKey === item.key)
          if (!target) {
            errors.push({ key: item.key, message: '配置键不存在' })
            skipped++
            return
          }

          target.configValue = item.value
          target.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
          imported++
        })

        importResult.value = {
          success: errors.length === 0,
          imported,
          skipped,
          errors
        }

        if (imported > 0) {
          ElMessage.success(`成功导入 ${imported} 项配置`)
        }
      } catch (error) {
        ElMessage.error('配置文件解析失败')
      }
    }
    reader.readAsText(importFile.value)
  } catch (error) {
    console.error('Import failed:', error)
    ElMessage.error('导入失败')
  }
}

const getTypeLabel = (type: ConfigType) => {
  const labels: Record<ConfigType, string> = {
    text: '文本',
    number: '数字',
    boolean: '开关',
    select: '选择',
    textarea: '多行文本',
    json: 'JSON'
  }
  return labels[type] || type
}

const formatValue = (config: SystemConfig) => {
  if (config.configType === 'boolean') {
    return config.configValue === 'true' ? '是' : '否'
  }
  if (config.configType === 'number') {
    const num = Number(config.configValue)
    if (config.configKey.includes('timeout') || config.configKey.includes('Duration') || config.configKey.includes('ttl')) {
      return `${num} 秒`
    }
    if (config.configKey.includes('size')) {
      if (num >= 1048576) {
        return `${(num / 1048576).toFixed(1)} MB`
      }
      return `${(num / 1024).toFixed(1)} KB`
    }
    if (config.configKey.includes('Life')) {
      return `${num} 月`
    }
    return num.toString()
  }
  return config.configValue
}

onMounted(() => {
  loadConfigs()
})
</script>

<template>
  <div class="config-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="group-card">
          <template #header>
            <div class="card-header">
              <span>配置分组</span>
            </div>
          </template>
          <div class="group-list">
            <div
              v-for="group in groupStats"
              :key="group.value"
              class="group-item"
              :class="{ active: activeGroup === group.value }"
              @click="activeGroup = group.value"
            >
              <el-icon><Lock v-if="group.value === 'security'" /><Cpu v-else-if="group.value === 'performance'" /><Set v-else-if="group.value === 'business'" /><Setting v-else /></el-icon>
              <div class="group-info">
                <div class="group-name">{{ group.label }}</div>
                <div class="group-desc">{{ group.description }}</div>
              </div>
              <el-badge :value="group.configCount" :max="99" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>{{ CONFIG_GROUPS.find(g => g.value === activeGroup)?.label }}列表</span>
              <div class="header-actions">
                <el-button type="primary" @click="handleImportClick">导入</el-button>
                <el-button type="success" @click="handleExport">导出</el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="loading" :data="currentGroupConfigs" stripe>
            <el-table-column prop="configName" label="配置名称" min-width="180">
              <template #default="{ row }">
                <div class="config-name">
                  <span>{{ row.configName }}</span>
                  <el-tag v-if="row.needRestart" type="warning" size="small">需重启</el-tag>
                </div>
                <div class="config-desc">{{ row.configDesc }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="configKey" label="配置键" min-width="200" />
            <el-table-column prop="configValue" label="配置值" min-width="150">
              <template #default="{ row }">
                <span class="config-value">{{ formatValue(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configType" label="类型" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ getTypeLabel(row.configType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" link @click="handleReset(row)">重置</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑配置"
      width="500px"
    >
      <div v-if="currentConfig">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="配置名称">{{ currentConfig.configName }}</el-descriptions-item>
          <el-descriptions-item label="配置键">{{ currentConfig.configKey }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ getTypeLabel(currentConfig.configType) }}</el-descriptions-item>
          <el-descriptions-item label="默认值">{{ currentConfig.defaultValue }}</el-descriptions-item>
        </el-descriptions>

        <el-form style="margin-top: 20px">
          <el-form-item label="配置值">
            <template v-if="currentConfig.configType === 'boolean'">
              <el-switch v-model="editForm.configValue" active-value="true" inactive-value="false" />
            </template>
            <template v-else-if="currentConfig.configType === 'select'">
              <el-select v-model="editForm.configValue" style="width: 100%">
                <el-option
                  v-for="option in currentConfig.options"
                  :key="String(option.value)"
                  :label="option.label"
                  :value="String(option.value)"
                />
              </el-select>
            </template>
            <template v-else-if="currentConfig.configType === 'textarea'">
              <el-input v-model="editForm.configValue" type="textarea" :rows="4" />
            </template>
            <template v-else-if="currentConfig.configType === 'number'">
              <el-input-number v-model="editForm.configValue" :min="0" style="width: 100%" />
            </template>
            <template v-else>
              <el-input v-model="editForm.configValue" />
            </template>
          </el-form-item>
        </el-form>

        <el-alert
          v-if="currentConfig.needRestart"
          title="此配置需要重启系统后生效"
          type="warning"
          :closable="false"
          style="margin-top: 10px"
        />
      </div>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="importDialogVisible"
      title="导入配置"
      width="500px"
    >
      <el-upload
        class="config-upload"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".json"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传 JSON 格式的配置文件
          </div>
        </template>
      </el-upload>

      <div v-if="importResult" style="margin-top: 20px">
        <el-alert
          :title="importResult.success ? '导入成功' : '导入完成'"
          :type="importResult.success ? 'success' : 'warning'"
          :closable="false"
        >
          <template #default>
            <div>成功导入: {{ importResult.imported }} 项</div>
            <div>跳过: {{ importResult.skipped }} 项</div>
            <div v-if="importResult.errors.length > 0" style="margin-top: 10px">
              <div v-for="error in importResult.errors" :key="error.key" style="color: #f56c6c">
                {{ error.key }}: {{ error.message }}
              </div>
            </div>
          </template>
        </el-alert>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleImport">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.config-container {
  padding: 20px;
}

.group-card {
  height: calc(100vh - 140px);
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.group-item:hover {
  background: #f5f7fa;
}

.group-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.group-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.config-card {
  min-height: calc(100vh - 140px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.config-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.config-value {
  font-family: monospace;
  color: #606266;
}

.config-upload {
  text-align: center;
}

.el-upload__tip {
  margin-top: 10px;
  color: #909399;
}
</style>
