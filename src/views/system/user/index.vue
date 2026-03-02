<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserListApi, createUserApi, updateUserApi, deleteUserApi, updateUserStatusApi, assignUserRolesApi, getRoleListApi } from '@/api/modules/user'
import type { User, UserForm, Role } from '@/types/user'
import type { UserListParams, UserListResponse } from '@/api/modules/user'

const { t } = useI18n()

// 搜索表单
const searchForm = reactive({
  username: '',
  status: ''
})

// 表格数据
const tableData = ref<User[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const roleDialogVisible = ref(false)
const dialogTitle = ref('')

// 表单数据
const formData = reactive<UserForm>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1,
  roleIds: []
})

// 角色列表
const roleList = ref<Role[]>([])

// 当前操作用户
const currentUser = ref<User | null>(null)

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params: UserListParams = {
      page: pagination.page,
      size: pagination.size,
      username: searchForm.username || undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }
    
    // Mock 数据（实际应该调用 API）
    const mockResponse: UserListResponse = {
      list: [
        { 
          id: 1, 
          username: 'admin', 
          nickname: '系统管理员', 
          email: 'admin@universalasset.com', 
          phone: '13800138000', 
          status: 1, 
          roleIds: [1],
          roles: ['超级管理员'],
          createdAt: '2024-01-01 10:00:00' 
        },
        { 
          id: 2, 
          username: 'zhangsan', 
          nickname: '张三', 
          email: 'zhangsan@example.com', 
          phone: '13800138001', 
          status: 1, 
          roleIds: [2],
          roles: ['运营人员'],
          createdAt: '2024-01-02 10:00:00' 
        },
        { 
          id: 3, 
          username: 'lisi', 
          nickname: '李四', 
          email: 'lisi@example.com', 
          phone: '13800138002', 
          status: 1, 
          roleIds: [3],
          roles: ['运维人员'],
          createdAt: '2024-01-03 10:00:00' 
        },
        { 
          id: 4, 
          username: 'wangwu', 
          nickname: '王五', 
          email: 'wangwu@example.com', 
          phone: '13800138003', 
          status: 0, 
          roleIds: [4],
          roles: ['财务人员'],
          createdAt: '2024-01-04 10:00:00' 
        },
        { 
          id: 5, 
          username: 'zhaoliu', 
          nickname: '赵六', 
          email: 'zhaoliu@example.com', 
          phone: '13800138004', 
          status: 1, 
          roleIds: [2],
          roles: ['运营人员'],
          createdAt: '2024-01-05 10:00:00' 
        }
      ],
      total: 5,
      page: pagination.page,
      size: pagination.size
    }
    
    tableData.value = mockResponse.list
    pagination.total = mockResponse.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 加载角色列表
const loadRoleList = async () => {
  try {
    const mockRoles: Role[] = [
      { id: 1, name: '超级管理员', code: 'admin', status: 1, permissions: [], sort: 1, createdAt: '2024-01-01' },
      { id: 2, name: '运营人员', code: 'operator', status: 1, permissions: [], sort: 2, createdAt: '2024-01-02' },
      { id: 3, name: '运维人员', code: 'maintainer', status: 1, permissions: [], sort: 3, createdAt: '2024-01-03' },
      { id: 4, name: '财务人员', code: 'finance', status: 1, permissions: [], sort: 4, createdAt: '2024-01-04' },
      { id: 5, name: '普通用户', code: 'user', status: 0, permissions: [], sort: 5, createdAt: '2024-01-05' }
    ]
    roleList.value = mockRoles
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = t('user.addUser')
  Object.assign(formData, { 
    id: 0, 
    username: '', 
    password: '',
    nickname: '', 
    email: '', 
    phone: '', 
    status: 1,
    roleIds: [] 
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: User) => {
  dialogTitle.value = t('user.editUser')
  Object.assign(formData, { 
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    status: row.status,
    roleIds: row.roleIds || []
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: User) => {
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUserApi(row.id)
      await loadUserList()
      ElMessage.success(t('common.success'))
    } catch (error) {
      ElMessage.error(t('common.error'))
    }
  }).catch(() => {})
}

// 状态改变
const handleStatusChange = async (row: User) => {
  const action = row.status === 1 ? t('user.disable') : t('user.enable')
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, t('common.warning'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    
    await updateUserStatusApi(row.id, row.status)
    ElMessage.success(t('common.success'))
  } catch (error: any) {
    if (error !== 'cancel') {
      row.status = row.status === 1 ? 0 : 1
    }
  }
}

// 分配角色
const handleAssignRole = (row: User) => {
  currentUser.value = row
  Object.assign(formData, { roleIds: row.roleIds || [] })
  roleDialogVisible.value = true
}

// 保存
const handleSave = async () => {
  if (!formData.username || !formData.nickname) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (formData.id === 0) {
      if (!formData.password) {
        ElMessage.warning('请输入密码')
        return
      }
      await createUserApi(formData)
    } else {
      await updateUserApi(formData.id!, formData)
    }
    
    dialogVisible.value = false
    await loadUserList()
    ElMessage.success(t('common.success'))
  } catch (error) {
    ElMessage.error(t('common.error'))
  }
}

// 保存角色分配
const handleSaveRoles = async () => {
  if (!currentUser.value) return
  
  try {
    await assignUserRolesApi(currentUser.value.id, formData.roleIds || [])
    roleDialogVisible.value = false
    await loadUserList()
    ElMessage.success(t('common.success'))
  } catch (error) {
    ElMessage.error(t('common.error'))
  }
}

// 分页改变
const handlePageChange = (page: number) => {
  pagination.page = page
  loadUserList()
}

onMounted(() => {
  loadUserList()
  loadRoleList()
})
</script>

<template>
  <div class="user-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('user.username')">
          <el-input 
            v-model="searchForm.username" 
            :placeholder="t('user.username')" 
            clearable 
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="t('user.status')">
          <el-select 
            v-model="searchForm.status" 
            :placeholder="t('user.status')" 
            clearable
            style="width: 120px"
          >
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
        <el-table-column :label="t('user.role')" width="150">
          <template #default="{ row }">
            <el-tag v-for="(role, index) in row.roles" :key="index" size="small" style="margin-right: 4px">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column prop="createdAt" :label="t('user.createdAt')" width="180" />
        <el-table-column :label="t('common.operation')" width="220" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-permission="{ permission: 'system:user:edit' }" 
              link 
              type="primary" 
              @click="handleEdit(row)"
            >
              {{ t('common.edit') }}
            </el-button>
            <el-button 
              v-permission="{ permission: 'system:user:edit' }" 
              link 
              type="success" 
              @click="handleAssignRole(row)"
            >
              {{ t('user.assignRole') }}
            </el-button>
            <el-button 
              v-permission="{ permission: 'system:user:delete' }" 
              link 
              type="danger" 
              @click="handleDelete(row)"
            >
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUserList"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <!-- 用户编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item :label="t('user.username')" required>
          <el-input 
            v-model="formData.username" 
            :placeholder="t('user.username')" 
            :disabled="formData.id !== 0"
          />
        </el-form-item>
        <el-form-item v-if="!formData.id" :label="'密码'" required>
          <el-input 
            v-model="formData.password" 
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('user.nickname')" required>
          <el-input v-model="formData.nickname" :placeholder="t('user.nickname')" />
        </el-form-item>
        <el-form-item :label="t('user.email')" required>
          <el-input v-model="formData.email" :placeholder="t('user.email')" />
        </el-form-item>
        <el-form-item :label="t('user.phone')">
          <el-input v-model="formData.phone" :placeholder="t('user.phone')" />
        </el-form-item>
        <el-form-item :label="t('user.role')">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option 
              v-for="role in roleList" 
              :key="role.id" 
              :label="role.name" 
              :value="role.id" 
            />
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
    
    <!-- 角色分配对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="用户">
          <el-input :value="currentUser?.username" disabled />
        </el-form-item>
        <el-form-item :label="t('user.role')" required>
          <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option 
              v-for="role in roleList" 
              :key="role.id" 
              :label="role.name" 
              :value="role.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveRoles">{{ t('common.save') }}</el-button>
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
