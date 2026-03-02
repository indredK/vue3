<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { 
  Monitor, 
  Connection, 
  Odometer, 
  ShoppingCart, 
  Document, 
  Money 
} from '@element-plus/icons-vue'

const { t } = useI18n()
const userStore = useUserStore()

const stats = ref([
  { title: 'dashboard.totalDevices', value: '12,856', icon: Monitor, color: '#409eff', trend: '+12%' },
  { title: 'dashboard.onlineDevices', value: '11,234', icon: Connection, color: '#67c23a', trend: '+8%' },
  { title: 'dashboard.totalBatteries', value: '45,678', icon: Odometer, color: '#e6a23c', trend: '+5%' },
  { title: 'dashboard.rentingBatteries', value: '23,456', icon: ShoppingCart, color: '#f56c6c', trend: '+15%' },
  { title: 'dashboard.todayOrders', value: '1,234', icon: Document, color: '#909399', trend: '+20%' },
  { title: 'dashboard.revenue', value: '¥56,789', icon: Money, color: '#c71585', trend: '+18%' }
])

const deviceTrend = ref([
  { date: '周一', online: 8200, offline: 200 },
  { date: '周二', online: 8500, offline: 180 },
  { date: '周三', online:8900, offline: 150 },
  { date: '周四', online: 9200, offline: 120 },
  { date: '周五', online: 9600, offline: 100 },
  { date: '周六', online: 10500, offline: 80 },
  { date: '周日', online: 11234, offline: 90 }
])

const recentOrders = ref([
  { id: 'ORD001', user: '张三', battery: 'B-1000ah', amount: '¥99.00', status: 'completed', time: '2024-01-15 10:30' },
  { id: 'ORD002', user: '李四', battery: 'B-2000ah', amount: '¥199.00', status: 'processing', time: '2024-01-15 10:25' },
  { id: 'ORD003', user: '王五', battery: 'B-500ah', amount: '¥59.00', status: 'pending', time: '2024-01-15 10:20' },
  { id: 'ORD004', user: '赵六', battery: 'B-1500ah', amount: '¥149.00', status: 'completed', time: '2024-01-15 10:15' },
  { id: 'ORD005', user: '钱七', battery: 'B-800ah', amount: '¥79.00', status: 'completed', time: '2024-01-15 10:10' }
])

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    completed: 'success',
    processing: 'warning',
    pending: 'info'
  }
  return map[status] || 'info'
}
</script>

<template>
  <div class="dashboard">
    <div class="welcome-section">
      <h2>欢迎回来，{{ userStore.userInfo?.nickname }}</h2>
      <p>这是您今天的运营数据概览</p>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="8" :lg="4" v-for="stat in stats" :key="stat.title">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">{{ t(stat.title) }}</p>
            <h3 class="stat-value">{{ stat.value }}</h3>
            <span class="stat-trend" :class="stat.trend.startsWith('+') ? 'positive' : 'negative'">
              {{ stat.trend }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="card-base">
          <h3>{{ t('dashboard.deviceTrend') }}</h3>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div
                v-for="item in deviceTrend"
                :key="item.date"
                class="bar-item"
              >
                <div class="bar-container">
                  <div class="bar online" :style="{ height: (item.online / 12000 * 100) + '%' }"></div>
                  <div class="bar offline" :style="{ height: (item.offline / 12000 * 100) + '%' }"></div>
                </div>
                <span class="bar-label">{{ item.date }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="dot online"></span>在线</span>
              <span class="legend-item"><span class="dot offline"></span>离线</span>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <div class="card-base">
          <h3>电池状态分布</h3>
          <div class="pie-chart-placeholder">
            <div class="pie-circle">
              <div class="pie-segment available"></div>
              <div class="pie-segment renting"></div>
              <div class="pie-segment charging"></div>
            </div>
            <div class="pie-legend">
              <div class="legend-row">
                <span class="dot available"></span>
                <span>可用 ({{ Math.round(45678 * 0.4) }})</span>
              </div>
              <div class="legend-row">
                <span class="dot renting"></span>
                <span>租赁中 ({{ Math.round(45678 * 0.5) }})</span>
              </div>
              <div class="legend-row">
                <span class="dot charging"></span>
                <span>充电中 ({{ Math.round(45678 * 0.1) }})</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="card-base">
          <h3>最新订单</h3>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="id" label="订单编号" width="120" />
            <el-table-column prop="user" label="用户" width="100" />
            <el-table-column prop="battery" label="电池型号" width="120" />
            <el-table-column prop="amount" label="金额" width="100" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status === 'completed' ? '已完成' : row.status === 'processing' ? '处理中' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-section {
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

.card-base h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
}

.chart-placeholder {
  height: 280px;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-container {
  width: 40px;
  height: 180px;
  display: flex;
  gap: 4px;
  align-items: flex-end;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.bar.online {
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
}

.bar.offline {
  background: linear-gradient(180deg, #909399 0%, #a6a9ad 100%);
}

.bar-label {
  font-size: 12px;
  color: #909399;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.online { background: #409eff; }
.dot.offline { background: #909399; }
.dot.available { background: #67c23a; }
.dot.renting { background: #e6a23c; }
.dot.charging { background: #409eff; }

.pie-chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.pie-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #67c23a 0deg 144deg,
    #e6a23c 144deg 324deg,
    #409eff 324deg 360deg
  );
  position: relative;
  margin-bottom: 20px;
}

.pie-circle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 50%;
}

.pie-legend {
  width: 100%;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
}
</style>
