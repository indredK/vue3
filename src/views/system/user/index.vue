<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()

interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  role: string
  status: number
  createTime: string
}

const searchForm = reactive({
  username: '',
  status: ''
})

const tableData = ref<User[]>([
  { id: 1, username: 'admin', nickname: '系统管理员', email: 'admin@batterybank.com', phone: '13800138000', role: '超级管理员', status: 1, createTime: '2024-01-01 10:00:00' },
  { id: 2, username: 'zhangsan', nickname: '张三', email: 'zhangsan@example.com', phone: '13800138001', role: '运营人员', status: 1, createTime: '2024-01-02 10:00:00' },
  { id: 3, username: 'lisi', nickname: '李四', email: 'lisi@example.com', phone: '13800138002', role: '运维人员', status: 1, createTime: '2024-01-03 10:00:00' },
  { id: 4, username: 'wangwu', nickname: '王五', email: 'wangwu@example.com', phone: '13800138003', role: '财务人员', status: 0, createTime: '2024-01-04 10:00:00' },
  { id: 5, username: 'zhaoliu', nickname: '赵六', email: 'zhaoliu@example.com', phone: '13800138004', role: '运营人员', status: 1, createTime: '2024-01-05 10:00:00' }
])

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  id: 0,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: '',
  status: 1
})

const roles = ['超级管理员', '运营人员', '运维人员', '财务人员', '普通用户']

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = t('user.addUser')
  Object.assign(formData, { id: 0, username: '', nickname: '', email: '', phone: '', role: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogTitle.value = t('user.editUser')
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success(t('common.success'))
  }).catch(() => {})
}

const handleStatusChange = (row: User) => {
  const action = row.status === 1 ? t('user.disable') : t('user.enable')
  ElMessageBox.confirm(`确定要${action}该用户吗？`, t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(t('common.success'))
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

const handleSave = () => {
  if (!formData.username || !formData.nickname) {
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
</script>

<template>
  <div class="user-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('user.username')">
          <el-input v-model="searchForm.username" :placeholder="t('user.username')" clearable />
        </el-form-item>
        <el-form-item :label="t('user.status')">
          <el-select v-model="searchForm.status" :placeholder="t('user.status')" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button v-permission="{ permission: 'system:user:add' }" type="primary" @click="handleAdd">
            {{ t('user.addUser') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" :label="t('user.username')" width="120" />
        <el-table-column prop="nickname" :label="t('user.nickname')" width="120" />
        <el-table-column prop="email" :label="t('user.email')" width="180" />
        <el-table-column prop="phone" :label="t('user.phone')" width="130" />
        <el-table-column prop="role" :label="t('user.role')" width="120" />
        <el-table-column :label="t('user.status')" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('user.createdAt')" />
        <el-table-column :label="t('common.operation')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="{ permission: 'system:user:edit' }" link type="primary" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button v-permission="{ permission: 'system:user:delete' }" link type="danger" @click="handleDelete(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item :label="t('user.username')">
          <el-input v-model="formData.username" :placeholder="t('user.username')" />
        </el-form-item>
        <el-form-item :label="t('user.nickname')">
          <el-input v-model="formData.nickname" :placeholder="t('user.nickname')" />
        </el-form-item>
        <el-form-item :label="t('user.email')">
          <el-input v-model="formData.email" :placeholder="t('user.email')" />
        </el-form-item>
        <el-form-item :label="t('user.phone')">
          <el-input v-model="formData.phone" :placeholder="t('user.phone')" />
        </el-form-item>
        <el-form-item :label="t('user.role')">
          <el-select v-model="formData.role" :placeholder="t('user.role')">
            <el-option v-for="role in roles" :key="role" :label="role" :value="role" />
          </el-select>
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
.user-management {
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
