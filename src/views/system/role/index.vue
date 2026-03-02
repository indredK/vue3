<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getRoleListApi, 
  createRoleApi, 
  updateRoleApi, 
  deleteRoleApi, 
  updateRoleStatusApi,
  assignRolePermissionsApi,
  getPermissionTreeApi
} from '@/api/modules/user'
import type { Role, RoleForm, PermissionTree } from '@/types/user'
import type { RoleListParams, RoleListResponse } from '@/api/modules/user'
import { DATA_SCOPE } from '@/types/user'

const { t } = useI18n()

// 表格数据
const tableData = ref<Role[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogTitle = ref('')

// 表单数据
const formData = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
  status: 1,
  permissions: [],
  dataScope: 4,
  departmentIds: [],
  sort: 1
})

// 权限树
const permissionTree = ref<PermissionTree[]>([])
const checkedPermissions = ref<number[]>([])

// 当前操作角色
const currentRole = ref<Role | null>(null)

// 数据范围选项
const dataScopeOptions = DATA_SCOPE

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    // Mock 数据
    const mockResponse: RoleListResponse = {
      list: [
        { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1, permissions: [], dataScope: 1, sort: 1, createdAt: '2024-01-01 10:00:00' },
        { id: 2, name: '运营人员', code: 'operator', description: '负责日常运营管理', status: 1, permissions: [], dataScope: 3, sort: 2, createdAt: '2024-01-02 10:00:00' },
        { id: 3, name: '运维人员', code: 'maintainer', description: '负责设备运维管理', status: 1, permissions: [], dataScope: 3, sort: 3, createdAt: '2024-01-03 10:00:00' },
        { id: 4, name: '财务人员', code: 'finance', description: '负责财务相关操作', status: 1, permissions: [], dataScope: 4, sort: 4, createdAt: '2024-01-04 10:00:00' },
        { id: 5, name: '普通用户', code: 'user', description: '普通用户权限', status: 0, permissions: [], dataScope: 4, sort: 5, createdAt: '2024-01-05 10:00:00' }
      ],
      total: 5,
      page: pagination.page,
      size: pagination.size
    }
    
    tableData.value = mockResponse.list
    pagination.total = mockResponse.total
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 加载权限树
const loadPermissionTree = async () => {
  try {
    // Mock 权限树数据
    const mockTree: PermissionTree[] = [
      {
        id: 1,
        name: '系统管理',
        code: 'system',
        type: 'menu',
        children: [
          {
            id: 10,
            name: '用户管理',
            code: 'system:user',
            type: 'menu',
            children: [
              { id: 101, name: '用户查看', code: 'system:user:list', type: 'button' },
              { id: 102, name: '用户新增', code: 'system:user:add', type: 'button' },
              { id: 103, name: '用户编辑', code: 'system:user:edit', type: 'button' },
              { id: 104, name: '用户删除', code: 'system:user:delete', type: 'button' }
            ]
          },
          {
            id: 20,
            name: '角色管理',
            code: 'system:role',
            type: 'menu',
            children: [
              { id: 201, name: '角色查看', code: 'system:role:list', type: 'button' },
              { id: 202, name: '角色新增', code: 'system:role:add', type: 'button' },
              { id: 203, name: '角色编辑', code: 'system:role:edit', type: 'button' },
              { id: 204, name: '角色删除', code: 'system:role:delete', type: 'button' },
              { id: 205, name: '分配权限', code: 'system:role:permission', type: 'button' }
            ]
          },
          {
            id: 30,
            name: '权限管理',
            code: 'system:permission',
            type: 'menu',
            children: [
              { id: 301, name: '权限查看', code: 'system:permission:list', type: 'button' }
            ]
          }
        ]
      },
      {
        id: 2,
        name: '设备管理',
        code: 'device',
        type: 'menu',
        children: [
          { id: 201, name: '设备查看', code: 'device:list', type: 'button' },
          { id: 202, name: '设备新增', code: 'device:add', type: 'button' },
          { id: 203, name: '设备编辑', code: 'device:edit', type: 'button' },
          { id: 204, name: '设备删除', code: 'device:delete', type: 'button' }
        ]
      },
      {
        id: 3,
        name: '资产管理',
        code: 'asset',
        type: 'menu',
        children: [
          { id: 301, name: '资产查看', code: 'asset:list', type: 'button' },
          { id: 302, name: '资产新增', code: 'asset:add', type: 'button' },
          { id: 303, name: '资产编辑', code: 'asset:edit', type: 'button' },
          { id: 304, name: '资产删除', code: 'asset:delete', type: 'button' }
        ]
      },
      {
        id: 4,
        name: '订单管理',
        code: 'order',
        type: 'menu',
        children: [
          { id: 401, name: '订单查看', code: 'order:list', type: 'button' },
          { id: 402, name: '订单新增', code: 'order:add', type: 'button' },
          { id: 403, name: '订单编辑', code: 'order:edit', type: 'button' },
          { id: 404, name: '订单删除', code: 'order:delete', type: 'button' }
        ]
      }
    ]
    
    permissionTree.value = mockTree
  } catch (error) {
    ElMessage.error('加载权限树失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRoleList()
}

// 重置
const handleReset = () => {
  loadRoleList()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = t('role.addRole')
  Object.assign(formData, { 
    id: 0, 
    name: '', 
    code: '', 
    description: '', 
    status: 1,
    permissions: [],
    dataScope: 4,
    sort: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Role) => {
  dialogTitle.value = t('role.editRole')
  Object.assign(formData, { 
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
    permissions: row.permissions || [],
    dataScope: row.dataScope || 4,
    sort: row.sort
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: Role) => {
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRoleApi(row.id)
      await loadRoleList()
      ElMessage.success(t('common.success'))
    } catch (error) {
      ElMessage.error(t('common.error'))
    }
  }).catch(() => {})
}

// 状态改变
const handleStatusChange = async (row: Role) => {
  const action = row.status === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}该角色吗？`, '提示', {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    
    await updateRoleStatusApi(row.id, row.status)
    ElMessage.success(t('common.success'))
  } catch (error: any) {
    if (error !== 'cancel') {
      row.status = row.status === 1 ? 0 : 1
    }
  }
}

// 分配权限
const handlePermission = async (row: Role) => {
  currentRole.value = row
  await loadPermissionTree()
  
  // 设置已选中的权限
  checkedPermissions.value = row.permissions || []
  permissionDialogVisible.value = true
}

// 获取所有选中的权限 ID（包括子节点）
const getAllCheckedIds = (tree: PermissionTree[], checkedIds: number[]): number[] => {
  const result: number[] = []
  
  const traverse = (nodes: PermissionTree[]) => {
    nodes.forEach(node => {
      if (checkedIds.includes(node.id)) {
        result.push(node.id)
        // 如果父节点被选中，添加所有子节点
        if (node.children) {
          node.children.forEach(child => {
            result.push(child.id)
            if (child.children) {
              traverse(child.children)
            }
          })
        }
      } else if (node.children) {
        traverse(node.children)
      }
    })
  }
  
  traverse(tree)
  return result
}

// 保存角色
const handleSave = async () => {
  if (!formData.name || !formData.code) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (formData.id === 0) {
      await createRoleApi(formData)
    } else {
      await updateRoleApi(formData.id!, formData)
    }
    
    dialogVisible.value = false
    await loadRoleList()
    ElMessage.success(t('common.success'))
  } catch (error) {
    ElMessage.error(t('common.error'))
  }
}

// 保存权限配置
const handleSavePermissions = async () => {
  if (!currentRole.value) return
  
  try {
    // 获取所有选中的权限 ID
    const allCheckedIds = getAllCheckedIds(permissionTree.value, checkedPermissions.value)
    
    await assignRolePermissionsApi(
      currentRole.value.id, 
      allCheckedIds, 
      formData.dataScope,
      formData.departmentIds
    )
    
    permissionDialogVisible.value = false
    await loadRoleList()
    ElMessage.success('权限分配成功')
  } catch (error) {
    ElMessage.error('保存权限失败')
  }
}

// 权限树节点选中变化
const handleCheckChange = (checkedKeys: number[]) => {
  checkedPermissions.value = checkedKeys
}

// 数据范围改变
const handleDataScopeChange = (value: number) => {
  formData.dataScope = value
}

onMounted(() => {
  loadRoleList()
  loadPermissionTree()
})
</script>

<template>
  <div class="role-management">
    <el-card class="search-card">
      <el-form :model="{}" inline>
        <el-form-item label="角色名称">
          <el-input placeholder="请输入角色名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button v-permission="{ permission: 'system:role:add' }" type="primary" @click="handleAdd">
            {{ t('role.addRole') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" :label="t('role.name')" width="150" />
        <el-table-column prop="code" :label="t('role.code')" width="150" />
        <el-table-column prop="description" :label="t('role.description')" />
        <el-table-column :label="'数据范围'" width="120">
          <template #default="{ row }">
            <el-tag size="small">
              {{ DATA_SCOPE.find(ds => ds.value === row.dataScope)?.label || '本人数据' }}
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
        <el-table-column :label="t('common.operation')" width="240" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-permission="{ permission: 'system:role:edit' }" 
              link 
              type="primary" 
              @click="handleEdit(row)"
            >
              {{ t('common.edit') }}
            </el-button>
            <el-button 
              v-permission="{ permission: 'system:role:permission' }" 
              link 
              type="success" 
              @click="handlePermission(row)"
            >
              {{ t('role.assignPermission') }}
            </el-button>
            <el-button 
              v-permission="{ permission: 'system:role:delete' }" 
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
          @size-change="loadRoleList"
          @current-change="handleSearch"
        />
      </div>
    </el-card>
    
    <!-- 角色编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item :label="t('role.name')" required>
          <el-input v-model="formData.name" :placeholder="t('role.name')" />
        </el-form-item>
        <el-form-item :label="t('role.code')" required>
          <el-input v-model="formData.code" :placeholder="t('role.code')" :disabled="formData.id !== 0" />
        </el-form-item>
        <el-form-item :label="t('role.description')">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="数据范围" required>
          <el-select v-model="formData.dataScope" placeholder="请选择数据范围" style="width: 100%">
            <el-option 
              v-for="scope in dataScopeOptions" 
              :key="scope.value" 
              :label="scope.label" 
              :value="scope.value" 
            >
              <div class="flex-between">
                <span>{{ scope.label }}</span>
                <span style="color: #999; font-size: 12px">{{ scope.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="1" :max="999" style="width: 100%" />
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
    
    <!-- 权限配置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="700px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="角色">
          <el-input :value="currentRole?.name" disabled />
        </el-form-item>
        <el-form-item label="数据范围" required>
          <el-select v-model="formData.dataScope" placeholder="请选择数据范围" style="width: 100%">
            <el-option 
              v-for="scope in dataScopeOptions" 
              :key="scope.value" 
              :label="scope.label" 
              :value="scope.value"
            >
              <span>{{ scope.label }} - {{ scope.description }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限配置" required>
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            :props="{ children: 'children', label: 'name' }"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedPermissions"
            @check="handleCheckChange"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSavePermissions">{{ t('common.save') }}</el-button>
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

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
