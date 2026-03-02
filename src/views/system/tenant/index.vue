<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Tenant, TenantQuota, TenantConfig } from '@/types/tenant'

const { t } = useI18n()

const searchForm = reactive({
  keyword: '',
  status: ''
})

const tableData = ref<Tenant[]>([
  {
    id: 1,
    name: '默认租户',
    code: 'default',
    status: 1,
    quota: {
      maxUsers: 100,
      maxAssets: 1000,
      maxOrders: 5000,
      usedUsers: 5,
      usedAssets: 120,
      usedOrders: 350
    },
    config: {
      themeColor: '#409eff',
      logo: '',
      enabledModules: ['device', 'asset', 'order']
    },
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '测试租户',
    code: 'test',
    status: 1,
    quota: {
      maxUsers: 50,
      maxAssets: 500,
      maxOrders: 2000,
      usedUsers: 3,
      usedAssets: 45,
      usedOrders: 120
    },
    config: {
      themeColor: '#67c23a',
      logo: '',
      enabledModules: ['device', 'asset']
    },
    createdAt: '2024-01-15 10:00:00'
  },
  {
    id: 3,
    name: '演示租户',
    code: 'demo',
    status: 0,
    quota: {
      maxUsers: 20,
      maxAssets: 200,
      maxOrders: 1000,
      usedUsers: 0,
      usedAssets: 0,
      usedOrders: 0
    },
    config: {
      themeColor: '#e6a23c',
      logo: '',
      enabledModules: ['device']
    },
    createdAt: '2024-02-01 10:00:00'
  }
])

const loading = ref(false)
const dialogVisible = ref(false)
const quotaDialogVisible = ref(false)
const configDialogVisible = ref(false)
const dialogTitle = ref('')
const currentTenant = ref<Tenant | null>(null)

const formData = reactive({
  id: 0,
  name: '',
  code: '',
  status: 1,
  quota: {
    maxUsers: 100,
    maxAssets: 1000,
    maxOrders: 5000
  } as TenantQuota,
  config: {
    themeColor: '#409eff',
    logo: '',
    enabledModules: ['device', 'asset', 'order']
  } as TenantConfig
})

const quotaForm = reactive({
  maxUsers: 100,
  maxAssets: 1000,
  maxOrders: 5000
})

const configForm = reactive({
  themeColor: '#409eff',
  logo: '',
  enabledModules: ['device', 'asset', 'order']
})

const modules = [
  { label: '设备管理', value: 'device' },
  { label: '资产管理', value: 'asset' },
  { label: '订单管理', value: 'order' },
  { label: '数据统计', value: 'statistics' }
]

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增租户'
  Object.assign(formData, {
    id: 0,
    name: '',
    code: '',
    status: 1,
    quota: { maxUsers: 100, maxAssets: 1000, maxOrders: 5000 },
    config: { themeColor: '#409eff', logo: '', enabledModules: ['device', 'asset', 'order'] }
  })
  dialogVisible.value = true
}

const handleEdit = (row: Tenant) => {
  dialogTitle.value = '编辑租户'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row: Tenant) => {
  ElMessageBox.confirm('确定要删除该租户吗？删除后将无法恢复！', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStatusChange = (row: Tenant) => {
  const action = row.status === 1 ? '停用' : '启用'
  ElMessageBox.confirm(`确定要${action}该租户吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('操作成功')
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

const handleSave = () => {
  if (!formData.name || !formData.code) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (formData.id === 0) {
    tableData.value.unshift({
      ...formData,
      id: Date.now(),
      createdAt: new Date().toLocaleString()
    })
  } else {
    const index = tableData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      Object.assign(tableData.value[index], formData)
    }
  }
  
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleQuota = (row: Tenant) => {
  currentTenant.value = row
  Object.assign(quotaForm, row.quota)
  quotaDialogVisible.value = true
}

const handleSaveQuota = () => {
  if (currentTenant.value) {
    Object.assign(currentTenant.value.quota, quotaForm)
    quotaDialogVisible.value = false
    ElMessage.success('配额设置成功')
  }
}

const handleConfig = (row: Tenant) => {
  currentTenant.value = row
  Object.assign(configForm, row.config)
  configDialogVisible.value = true
}

const handleSaveConfig = () => {
  if (currentTenant.value) {
    Object.assign(currentTenant.value.config, configForm)
    configDialogVisible.value = false
    ElMessage.success('配置保存成功')
  }
}

const getQuotaPercent = (used: number, max: number) => {
  return Math.round((used / max) * 100)
}

const getStatusTagType = (status: number) => {
  return status === 1 ? 'success' : 'info'
}

const getStatusText = (status: number) => {
  return status === 1 ? '启用' : '停用'
}
</script>

<template>
  <div class="tenant-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="租户名称">
          <el-input v-model="searchForm.keyword" placeholder="租户名称/编码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-permission="{ permission: 'system:tenant:add' }" type="primary" @click="handleAdd">
            新增租户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="租户名称" width="150" />
        <el-table-column prop="code" label="租户编码" width="120" />
        <el-table-column label="用户配额" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="getQuotaPercent(row.quota.usedUsers || 0, row.quota.maxUsers)"
              :format="() => `${row.quota.usedUsers || 0}/${row.quota.maxUsers}`"
            />
          </template>
        </el-table-column>
        <el-table-column label="资产配额" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="getQuotaPercent(row.quota.usedAssets || 0, row.quota.maxAssets)"
              :format="() => `${row.quota.usedAssets || 0}/${row.quota.maxAssets}`"
            />
          </template>
        </el-table-column>
        <el-table-column label="订单配额" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="getQuotaPercent(row.quota.usedOrders || 0, row.quota.maxOrders)"
              :format="() => `${row.quota.usedOrders || 0}/${row.quota.maxOrders}`"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="{ permission: 'system:tenant:edit' }" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="{ permission: 'system:tenant:quota' }" link type="warning" @click="handleQuota(row)">
              配额
            </el-button>
            <el-button v-permission="{ permission: 'system:tenant:config' }" link type="success" @click="handleConfig(row)">
              配置
            </el-button>
            <el-button v-permission="{ permission: 'system:tenant:delete' }" link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="租户名称">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码">
          <el-input v-model="formData.code" placeholder="请输入租户编码（英文）" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-divider>默认配额</el-divider>
        <el-form-item label="用户数量">
          <el-input-number v-model="formData.quota.maxUsers" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="资产数量">
          <el-input-number v-model="formData.quota.maxAssets" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="订单数量">
          <el-input-number v-model="formData.quota.maxOrders" :min="1" :max="1000000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="quotaDialogVisible" title="配额设置" width="500px">
      <el-form :model="quotaForm" label-width="100px">
        <el-form-item label="用户数量">
          <el-input-number v-model="quotaForm.maxUsers" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="资产数量">
          <el-input-number v-model="quotaForm.maxAssets" :min="1" :max="100000" />
        </el-form-item>
        <el-form-item label="订单数量">
          <el-input-number v-model="quotaForm.maxOrders" :min="1" :max="1000000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quotaDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveQuota">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="configDialogVisible" title="租户配置" width="500px">
      <el-form :model="configForm" label-width="100px">
        <el-form-item label="主题颜色">
          <el-color-picker v-model="configForm.themeColor" />
        </el-form-item>
        <el-form-item label="启用模块">
          <el-checkbox-group v-model="configForm.enabledModules">
            <el-checkbox v-for="mod in modules" :key="mod.value" :label="mod.value">
              {{ mod.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tenant-management {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  background: #fff;
  border-radius: 8px;
}
</style>