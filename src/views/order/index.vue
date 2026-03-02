<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Order {
  id: string
  user: string
  battery: string
  amount: number
  status: string
  createTime: string
}

const searchForm = reactive({
  id: '',
  status: ''
})

const tableData = ref<Order[]>([
  { id: 'ORD202401150001', user: '张三', battery: 'B-1000ah', amount: 99, status: 'completed', createTime: '2024-01-15 10:30:00' },
  { id: 'ORD202401150002', user: '李四', battery: 'B-2000ah', amount: 199, status: 'processing', createTime: '2024-01-15 10:25:00' },
  { id: 'ORD202401150003', user: '王五', battery: 'B-500ah', amount: 59, status: 'pending', createTime: '2024-01-15 10:20:00' },
  { id: 'ORD202401150004', user: '赵六', battery: 'B-1500ah', amount: 149, status: 'completed', createTime: '2024-01-15 10:15:00' },
  { id: 'ORD202401150005', user: '钱七', battery: 'B-800ah', amount: 79, status: 'cancelled', createTime: '2024-01-15 10:10:00' }
])

const handleSearch = () => {}
const handleReset = () => {}

const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    completed: 'success',
    processing: 'warning',
    pending: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    processing: '处理中',
    pending: '待处理',
    cancelled: '已取消'
  }
  return map[status] || status
}
</script>

<template>
  <div class="order-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.id" placeholder="订单编号" clearable />
        </el-form-item>
        <el-form-item :label="t('user.status')">
          <el-select v-model="searchForm.status" :placeholder="t('user.status')" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="订单编号" width="180" />
        <el-table-column prop="user" :label="t('user.userList')" width="100" />
        <el-table-column prop="battery" :label="t('battery.model')" width="120" />
        <el-table-column :label="t('battery.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column :label="t('common.operation')" width="120" fixed="right">
          <template #default>
            <el-button link type="primary">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.order-management {
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
