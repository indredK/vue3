<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { getDashboardStatisticsApi } from '@/api/modules/dashboard'
import type { DashboardStatistics, Widget } from '@/types/dashboard'
import { WIDGET_TYPES } from '@/types/dashboard'

const { t } = useI18n()
const userStore = useUserStore()

const loading = ref(false)
const editMode = ref(false)
const widgetDialogVisible = ref(false)
const selectedWidget = ref<Widget | null>(null)

const statistics = ref<DashboardStatistics>({
  totalAssets: 1256,
  totalOrders: 456,
  totalUsers: 89,
  pendingApprovals: 12,
  assetTrend: [
    { date: '2024-01-09', count: 1150 },
    { date: '2024-01-10', count: 1170 },
    { date: '2024-01-11', count: 1180 },
    { date: '2024-01-12', count: 1195 },
    { date: '2024-01-13', count: 1210 },
    { date: '2024-01-14', count: 1230 },
    { date: '2024-01-15', count: 1256 }
  ],
  orderTrend: [
    { date: '2024-01-09', count: 420 },
    { date: '2024-01-10', count: 435 },
    { date: '2024-01-11', count: 428 },
    { date: '2024-01-12', count: 445 },
    { date: '2024-01-13', count: 450 },
    { date: '2024-01-14', count: 452 },
    { date: '2024-01-15', count: 456 }
  ],
  assetDistribution: [
    { name: '可用', value: 502 },
    { name: '使用中', value: 628 },
    { name: '维护中', value: 89 },
    { name: '已报废', value: 37 }
  ],
  orderStatusDistribution: [
    { name: '待处理', count: 45 },
    { name: '处理中', count: 123 },
    { name: '已完成', count: 256 },
    { name: '已取消', count: 32 }
  ]
})

const widgets = ref<Widget[]>([
  {
    id: 1,
    type: 'statistic',
    title: '资产总数',
    config: {},
    dataSource: { type: 'api', apiPath: '/api/assets/count' }
  }
])

const stats = computed(() => [
  { title: '资产总数', value: statistics.value.totalAssets, icon: 'Box', color: '#409eff', trend: '+5.2%', trendUp: true },
  { title: '订单总数', value: statistics.value.totalOrders, icon: 'Document', color: '#67c23a', trend: '+3.1%', trendUp: true },
  { title: '用户总数', value: statistics.value.totalUsers, icon: 'User', color: '#e6a23c', trend: '+2.8%', trendUp: true },
  { title: '待审批', value: statistics.value.pendingApprovals, icon: 'Clock', color: '#f56c6c', trend: '-1.2%', trendUp: false }
])

const chartColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']

const refreshInterval = ref(30000)
let timer: ReturnType<typeof setInterval> | null = null

const loadStatistics = async () => {
  loading.value = true
  try {
    const data = await getDashboardStatisticsApi()
    statistics.value = data
  } catch {
    // 使用默认数据
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadStatistics()
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
}

const handleAddWidget = (type: string) => {
  const widgetType = WIDGET_TYPES.find(w => w.value === type)
  selectedWidget.value = {
    id: Date.now(),
    type: type as any,
    title: widgetType?.label || '新图表',
    config: { refreshInterval: 30000 },
    dataSource: { type: 'api' }
  }
  widgetDialogVisible.value = true
}

const handleDeleteWidget = (widgetId: number) => {
  widgets.value = widgets.value.filter(w => w.id !== widgetId)
}

const handleExportPDF = () => {
  ElMessage.info('导出 PDF 功能需要后端支持')
}

const handleExportImage = () => {
  ElMessage.info('导出图片功能需要 html2canvas 库支持')
}

const handleSaveDashboard = () => {
  ElMessage.success('仪表板布局已保存')
  editMode.value = false
}

onMounted(() => {
  loadStatistics()
  timer = setInterval(() => {
    loadStatistics()
  }, refreshInterval.value)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    completed: 'success',
    processing: 'warning',
    pending: 'info'
  }
  return map[status] || 'info'
}

const recentOrders = ref([
  { id: 'ORD001', user: '张三', asset: 'A-1000', amount: '¥99.00', status: 'completed', time: '2024-01-15 10:30' },
  { id: 'ORD002', user: '李四', asset: 'A-2000', amount: '¥199.00', status: 'processing', time: '2024-01-15 10:25' },
  { id: 'ORD003', user: '王五', asset: 'A-500', amount: '¥59.00', status: 'pending', time: '2024-01-15 10:20' },
  { id: 'ORD004', user: '赵六', asset: 'A-1500', amount: '¥149.00', status: 'completed', time: '2024-01-15 10:15' },
  { id: 'ORD005', user: '钱七', asset: 'A-800', amount: '¥79.00', status: 'completed', time: '2024-01-15 10:10' }
])

const maxTrendValue = computed(() => {
  return Math.max(...statistics.value.assetTrend.map(t => t.count))
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="welcome-section">
        <h2>欢迎回来，{{ userStore.userInfo?.nickname }}</h2>
        <p>这是您今天的运营数据概览</p>
      </div>
      <div class="dashboard-actions">
        <el-button @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-dropdown>
          <el-button>
            <el-icon><Download /></el-icon>
            导出<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleExportPDF">导出 PDF</el-dropdown-item>
              <el-dropdown-item @click="handleExportImage">导出图片</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-if="!editMode" type="primary" @click="toggleEditMode">
          <el-icon><Edit /></el-icon>
          编辑仪表板
        </el-button>
        <el-button v-else type="success" @click="handleSaveDashboard">
          <el-icon><Check /></el-icon>
          保存布局
        </el-button>
      </div>
    </div>

    <div v-if="editMode" class="widget-toolbar">
      <span>添加组件：</span>
      <el-button v-for="widget in WIDGET_TYPES" :key="widget.value" size="small" @click="handleAddWidget(widget.value)">
        <el-icon><component :is="widget.icon" /></el-icon>
        {{ widget.label }}
      </el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">{{ stat.title }}</p>
            <h3 class="stat-value">{{ stat.value.toLocaleString() }}</h3>
            <span class="stat-trend" :class="stat.trendUp ? 'positive' : 'negative'">
              {{ stat.trend }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="card-base">
          <div class="card-header">
            <h3>资产趋势</h3>
            <el-radio-group v-model="trendType" size="small">
              <el-radio-button label="week">近7天</el-radio-button>
              <el-radio-button label="month">近30天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="bar-chart">
            <div class="bar-items">
              <div
                v-for="item in statistics.assetTrend"
                :key="item.date"
                class="bar-wrapper"
              >
                <div class="bar-value">{{ item.count }}</div>
                <div class="bar-track">
                  <div 
                    class="bar-fill" 
                    :style="{ height: (item.count / maxTrendValue * 100) + '%' }"
                  ></div>
                </div>
                <div class="bar-label">{{ item.date.slice(5) }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <div class="card-base">
          <h3>资产状态分布</h3>
          <div class="pie-chart">
            <div class="pie-visual">
              <svg viewBox="0 0 100 100">
                <circle
                  v-for="(item, index) in statistics.assetDistribution"
                  :key="item.name"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  :stroke="chartColors[index % chartColors.length]"
                  stroke-width="20"
                  :stroke-dasharray="`${item.value / statistics.totalAssets * 251.2} ${251.2}`"
                  :stroke-dashoffset="-statistics.assetDistribution.slice(0, index).reduce((sum, i) => sum + i.value / statistics.totalAssets * 251.2, 0)"
                />
              </svg>
              <div class="pie-center">
                <span class="pie-total">{{ statistics.totalAssets }}</span>
                <span class="pie-label">总数</span>
              </div>
            </div>
            <div class="pie-legend">
              <div 
                v-for="(item, index) in statistics.assetDistribution" 
                :key="item.name"
                class="legend-item"
              >
                <span class="legend-dot" :style="{ background: chartColors[index % chartColors.length] }"></span>
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="card-base">
          <h3>订单状态分布</h3>
          <div class="order-status-chart">
            <div 
              v-for="(item, index) in statistics.orderStatusDistribution" 
              :key="item.name"
              class="status-item"
            >
              <div class="status-info">
                <span class="status-name">{{ item.name }}</span>
                <span class="status-count">{{ item.count }}</span>
              </div>
              <div class="status-bar">
                <div 
                  class="status-fill"
                  :style="{ 
                    width: (item.count / Math.max(...statistics.orderStatusDistribution.map(i => i.count)) * 100) + '%',
                    background: chartColors[index % chartColors.length]
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="card-base">
          <h3>最新订单</h3>
          <el-table :data="recentOrders" style="width: 100%" max-height="250">
            <el-table-column prop="id" label="订单编号" width="130" />
            <el-table-column prop="user" label="用户" width="80" />
            <el-table-column prop="asset" label="资产" width="80" />
            <el-table-column prop="amount" label="金额" width="90" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status === 'completed' ? '已完成' : row.status === 'processing' ? '处理中' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      trendType: 'week'
    }
  }
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.welcome-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.welcome-section p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: 10px;
}

.widget-toolbar {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.widget-toolbar span {
  font-weight: 500;
  color: #606266;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px;
}

.stat-trend {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-trend.positive {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.stat-trend.negative {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.chart-row {
  margin-bottom: 20px;
}

.card-base {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-base h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.card-header h3 {
  margin: 0;
}

.bar-chart {
  height: 250px;
  padding: 10px 0;
}

.bar-items {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-value {
  font-size: 12px;
  color: #606266;
}

.bar-track {
  width: 30px;
  height: 180px;
  background: #f0f2f5;
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 4px;
  transition: height 0.5s ease;
  min-height: 4px;
}

.bar-label {
  font-size: 12px;
  color: #909399;
}

.pie-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pie-visual {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 20px;
}

.pie-visual svg {
  transform: rotate(-90deg);
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-total {
  display: block;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.pie-label {
  font-size: 12px;
  color: #909399;
}

.pie-legend {
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-name {
  flex: 1;
  color: #606266;
}

.legend-value {
  font-weight: 500;
  color: #303133;
}

.order-status-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-info {
  display: flex;
  justify-content: space-between;
}

.status-name {
  color: #606266;
}

.status-count {
  font-weight: 500;
  color: #303133;
}

.status-bar {
  height: 8px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>
