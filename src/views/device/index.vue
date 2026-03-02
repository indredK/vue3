<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Device {
  id: string
  name: string
  type: string
  status: number
  location: string
  online: number
  lastUpdate: string
}

const searchForm = reactive({
  name: '',
  status: ''
})

const tableData = ref<Device[]>([
  { id: 'DEV001', name: '换电站-A01', type: '换电站', status: 1, location: '北京市朝阳区', online: 1, lastUpdate: '2024-01-15 10:30:00' },
  { id: 'DEV002', name: '换电站-A02', type: '换电站', status: 1, location: '北京市海淀区', online: 1, lastUpdate: '2024-01-15 10:29:00' },
  { id: 'DEV003', name: '充电桩-B01', type: '充电桩', status: 1, location: '上海市浦东新区', online: 1, lastUpdate: '2024-01-15 10:28:00' },
  { id: 'DEV004', name: '充电桩-B02', type: '充电桩', status: 0, location: '上海市静安区', online: 0, lastUpdate: '2024-01-15 09:15:00' },
  { id: 'DEV005', name: '智能柜-C01', type: '智能柜', status: 1, location: '广州市天河区', online: 1, lastUpdate: '2024-01-15 10:27:00' }
])

const handleSearch = () => {}
const handleReset = () => {}

const getStatusTag = (status: number) => {
  return status === 1 ? 'success' : 'info'
}

const getOnlineTag = (online: number) => {
  return online === 1 ? { type: 'success', text: '在线' } : { type: 'danger', text: '离线' }
}
</script>

<template>
  <div class="device-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('device.name')">
          <el-input v-model="searchForm.name" :placeholder="t('device.name')" clearable />
        </el-form-item>
        <el-form-item :label="t('device.status')">
          <el-select v-model="searchForm.status" :placeholder="t('device.status')" clearable>
            <el-option label="正常" value="1" />
            <el-option label="异常" value="0" />
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
        <el-table-column prop="id" :label="t('device.id')" width="120" />
        <el-table-column prop="name" :label="t('device.name')" width="150" />
        <el-table-column prop="type" :label="t('device.type')" width="120" />
        <el-table-column :label="t('device.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ row.status === 1 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" :label="t('device.location')" />
        <el-table-column label="在线状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getOnlineTag(row.online).type">
              {{ getOnlineTag(row.online).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新" width="180" />
        <el-table-column :label="t('common.operation')" width="120" fixed="right">
          <template #default>
            <el-button link type="primary">{{ t('device.monitor') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.device-management {
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
