<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()

interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  createTime: string
}

const tableData = ref<Role[]>([
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1, createTime: '2024-01-01 10:00:00' },
  { id: 2, name: '运营人员', code: 'operator', description: '负责日常运营管理', status: 1, createTime: '2024-01-02 10:00:00' },
  { id: 3, name: '运维人员', code: 'maintainer', description: '负责设备运维管理', status: 1, createTime: '2024-01-03 10:00:00' },
  { id: 4, name: '财务人员', code: 'finance', description: '负责财务相关操作', status: 1, createTime: '2024-01-04 10:00:00' },
  { id: 5, name: '普通用户', code: 'user', description: '普通用户权限', status: 0, createTime: '2024-01-05 10:00:00' }
])

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 1
})

const handleAdd = () => {
  dialogTitle.value = t('role.addRole')
  Object.assign(formData, { id: 0, name: '', code: '', description: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row: Role) => {
  dialogTitle.value = t('role.editRole')
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row: Role) => {
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success(t('common.success'))
  }).catch(() => {})
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
      createTime: new Date().toLocaleString()
    })
  } else {
    const index = tableData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      Object.assign(tableData.value[index], formData)
    }
  }
  
  dialogVisible.value = false
  ElMessage.success(t('common.success'))
}

const handlePermission = (row: Role) => {
  ElMessage.info(`分配权限: ${row.name}`)
}
</script>

<template>
  <div class="role-management">
    <el-card class="toolbar-card">
      <div class="flex-between">
        <el-button v-permission="{ permission: 'system:role:add' }" type="primary" @click="handleAdd">
          {{ t('role.addRole') }}
        </el-button>
      </div>
    </el-card>
    
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" :label="t('role.name')" width="150" />
        <el-table-column prop="code" :label="t('role.code')" width="150" />
        <el-table-column prop="description" :label="t('role.description')" />
        <el-table-column :label="t('user.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('user.createdAt')" />
        <el-table-column :label="t('common.operation')" width="240" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="{ permission: 'system:role:edit' }" link type="primary" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button v-permission="{ permission: 'system:role:edit' }" link type="success" @click="handlePermission(row)">
              {{ t('role.assignPermission') }}
            </el-button>
            <el-button v-permission="{ permission: 'system:role:delete' }" link type="danger" @click="handleDelete(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item :label="t('role.name')">
          <el-input v-model="formData.name" :placeholder="t('role.name')" />
        </el-form-item>
        <el-form-item :label="t('role.code')">
          <el-input v-model="formData.code" :placeholder="t('role.code')" />
        </el-form-item>
        <el-form-item :label="t('role.description')">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="t('user.status')">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-management {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.toolbar-card {
  margin-bottom: 20px;
}

.table-card {
  background: #fff;
  border-radius: 8px;
}
</style>
