<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Permission {
  id: number
  name: string
  code: string
  type: string
  description: string
}

const tableData = ref<Permission[]>([
  { id: 1, name: '用户查看', code: 'system:user:list', type: 'button', description: '查看用户列表' },
  { id: 2, name: '用户新增', code: 'system:user:add', type: 'button', description: '新增用户' },
  { id: 3, name: '用户编辑', code: 'system:user:edit', type: 'button', description: '编辑用户' },
  { id: 4, name: '用户删除', code: 'system:user:delete', type: 'button', description: '删除用户' },
  { id: 5, name: '角色查看', code: 'system:role:list', type: 'button', description: '查看角色列表' },
  { id: 6, name: '角色新增', code: 'system:role:add', type: 'button', description: '新增角色' },
  { id: 7, name: '角色编辑', code: 'system:role:edit', type: 'button', description: '编辑角色' },
  { id: 8, name: '角色删除', code: 'system:role:delete', type: 'button', description: '删除角色' },
  { id: 9, name: '设备查看', code: 'device:list', type: 'button', description: '查看设备列表' },
  { id: 10, name: '资产查看', code: 'asset:list', type: 'button', description: '查看资产列表' },
  { id: 11, name: '订单查看', code: 'order:list', type: 'button', description: '查看订单列表' }
])

const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    menu: 'success',
    button: 'warning',
    api: 'danger'
  }
  return map[type] || 'info'
}
</script>

<template>
  <div class="permission-management">
    <el-card class="table-card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" :label="t('permission.name')" width="150" />
        <el-table-column prop="code" :label="t('permission.code')" width="200" />
        <el-table-column :label="t('permission.type')" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ row.type === 'menu' ? '菜单' : row.type === 'button' ? '按钮' : '接口' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.permission-management {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.table-card {
  background: #fff;
  border-radius: 8px;
}
</style>
