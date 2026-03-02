<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Battery {
  id: string
  model: string
  capacity: string
  voltage: number
  current: number
  soc: number
  soh: number
  cycleCount: number
  temperature: number
  status: string
}

const searchForm = reactive({
  id: '',
  status: ''
})

const tableData = ref<Battery[]>([
  { id: 'BAT001', model: 'B-1000ah', capacity: '1000Wh', voltage: 48, current: 20, soc: 95, soh: 98, cycleCount: 120, temperature: 25, status: 'available' },
  { id: 'BAT002', model: 'B-2000ah', capacity: '2000Wh', voltage: 48, current: 35, soc: 80, soh: 95, cycleCount: 250, temperature: 28, status: 'renting' },
  { id: 'BAT003', model: 'B-500ah', capacity: '500Wh', voltage: 24, current: 15, soc: 100, soh: 99, cycleCount: 50, temperature: 24, status: 'charging' },
  { id: 'BAT004', model: 'B-1500ah', capacity: '1500Wh', voltage: 48, current: 28, soc: 65, soh: 90, cycleCount: 380, temperature: 32, status: 'renting' },
  { id: 'BAT005', model: 'B-800ah', capacity: '800Wh', voltage: 36, current: 18, soc: 88, soh: 96, cycleCount: 180, temperature: 26, status: 'available' }
])

const handleSearch = () => {}
const handleReset = () => {}

const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    available: 'success',
    renting: 'warning',
    charging: 'primary'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    available: '可用',
    renting: '租赁中',
    charging: '充电中'
  }
  return map[status] || status
}

const getSocColor = (soc: number) => {
  if (soc >= 80) return '#67c23a'
  if (soc >= 50) return '#e6a23c'
  return '#f56c6c'
}
</script>

<template>
  <div class="battery-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('battery.id')">
          <el-input v-model="searchForm.id" :placeholder="t('battery.id')" clearable />
        </el-form-item>
        <el-form-item :label="t('battery.status')">
          <el-select v-model="searchForm.status" :placeholder="t('battery.status')" clearable>
            <el-option label="可用" value="available" />
            <el-option label="租赁中" value="renting" />
            <el-option label="充电中" value="charging" />
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
        <el-table-column prop="id" :label="t('battery.id')" width="120" />
        <el-table-column prop="model" :label="t('battery.model')" width="120" />
        <el-table-column prop="capacity" :label="t('battery.capacity')" width="120" />
        <el-table-column :label="t('battery.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('battery.soc')" width="150">
          <template #default="{ row }">
            <div class="soc-bar">
              <div class="soc-fill" :style="{ width: row.soc + '%', background: getSocColor(row.soc) }"></div>
              <span class="soc-text">{{ row.soc }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('battery.soh')" width="100">
          <template #default="{ row }">
            {{ row.soh }}%
          </template>
        </el-table-column>
        <el-table-column prop="cycleCount" :label="t('battery.cycleCount')" width="100" />
        <el-table-column :label="t('battery.temperature')" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.temperature > 30 ? '#f56c6c' : '#67c23a' }">
              {{ row.temperature }}°C
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="voltage" :label="t('battery.voltage')" width="80">
          <template #default="{ row }">
            {{ row.voltage }}V
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.battery-management {
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

.soc-bar {
  width: 100%;
  height: 20px;
  background: #ebeef5;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.soc-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.soc-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}
</style>
