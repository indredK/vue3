<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAuditLogListApi,
  getAuditLogDetailApi,
  exportAuditLogsApi,
  getLogStatisticsApi,
  getRetentionPolicyApi,
  updateRetentionPolicyApi,
  cleanOldLogsApi
} from '@/api/modules/auditLog'
import type { AuditLog, AuditLogDetail, LogRetentionPolicy } from '@/types/auditLog'
import { OPERATION_TYPES, MODULE_TYPES, RETENTION_OPTIONS } from '@/types/auditLog'

const { t } = useI18n()

const searchForm = reactive({
  keyword: '',
  username: '',
  module: '',
  operation: '',
  status: ''
})

const dateRange = ref<[string, string] | null>(null)

const tableData = ref<AuditLog[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const detailDialogVisible = ref(false)
const currentLog = ref<AuditLogDetail | null>(null)
const detailLoading = ref(false)

const statistics = ref({
  totalCount: 0,
  todayCount: 0,
  errorCount: 0,
  moduleDistribution: [] as { module: string; count: number }[],
  dailyTrend: [] as { date: string; count: number }[]
})

const policyDialogVisible = ref(false)
const policyForm = reactive<LogRetentionPolicy>({
  id: 0,
  name: '',
  retentionDays: 30,
  archiveEnabled: false,
  archivePath: '',
  autoDelete: false,
  status: 1,
  createdAt: ''
})

const activeTab = ref('list')

const loadAuditLogList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      keyword: searchForm.keyword || undefined,
      username: searchForm.username || undefined,
      module: searchForm.module || undefined,
      operation: searchForm.operation || undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }

    const mockLogs: AuditLog[] = [
      {
        id: 1,
        userId: 1,
        username: 'admin',
        nickname: '管理员',
        module: 'user',
        operation: 'login',
        method: 'POST',
        url: '/api/auth/login',
        ip: '192.168.1.100',
        location: '北京市',
        status: 200,
        duration: 125,
        createdAt: '2024-01-15 09:30:25'
      },
      {
        id: 2,
        userId: 2,
        username: 'operator1',
        nickname: '操作员1',
        module: 'asset',
        operation: 'create',
        method: 'POST',
        url: '/api/asset',
        ip: '192.168.1.101',
        location: '上海市',
        requestParams: { name: '笔记本电脑', category: 'electronics' },
        status: 201,
        duration: 85,
        createdAt: '2024-01-15 10:15:30'
      },
      {
        id: 3,
        userId: 1,
        username: 'admin',
        nickname: '管理员',
        module: 'role',
        operation: 'update',
        method: 'PUT',
        url: '/api/role/1',
        ip: '192.168.1.100',
        location: '北京市',
        requestParams: { name: '超级管理员', permissions: [1, 2, 3] },
        responseResult: { id: 1, name: '超级管理员', permissions: [1, 2, 3, 4] },
        status: 200,
        duration: 45,
        createdAt: '2024-01-15 11:20:10'
      },
      {
        id: 4,
        userId: 3,
        username: 'viewer1',
        nickname: '查看员1',
        module: 'asset',
        operation: 'query',
        method: 'GET',
        url: '/api/asset/list',
        ip: '192.168.1.102',
        location: '广州市',
        status: 200,
        duration: 32,
        createdAt: '2024-01-15 14:05:18'
      },
      {
        id: 5,
        userId: 2,
        username: 'operator1',
        nickname: '操作员1',
        module: 'order',
        operation: 'create',
        method: 'POST',
        url: '/api/order',
        ip: '192.168.1.101',
        location: '上海市',
        requestParams: { orderNo: 'PO20240115001', amount: 5000 },
        status: 201,
        duration: 120,
        createdAt: '2024-01-15 15:30:45'
      },
      {
        id: 6,
        userId: 4,
        username: 'approver1',
        nickname: '审批员1',
        module: 'approval',
        operation: 'approve',
        method: 'POST',
        url: '/api/approval/approve',
        ip: '192.168.1.103',
        location: '深圳市',
        requestParams: { orderId: 5, action: 'approve', comment: '同意采购' },
        status: 200,
        duration: 60,
        createdAt: '2024-01-15 16:10:22'
      },
      {
        id: 7,
        userId: 5,
        username: 'testuser',
        nickname: '测试用户',
        module: 'user',
        operation: 'login',
        method: 'POST',
        url: '/api/auth/login',
        ip: '192.168.1.104',
        location: '杭州市',
        status: 401,
        errorMessage: '用户名或密码错误',
        duration: 35,
        createdAt: '2024-01-15 16:45:08'
      },
      {
        id: 8,
        userId: 1,
        username: 'admin',
        nickname: '管理员',
        module: 'system',
        operation: 'config',
        method: 'PUT',
        url: '/api/system/config',
        ip: '192.168.1.100',
        location: '北京市',
        requestParams: { maxUploadSize: 10485760, sessionTimeout: 3600 },
        status: 200,
        duration: 28,
        createdAt: '2024-01-15 17:20:55'
      }
    ]

    let filteredLogs = mockLogs
    if (searchForm.keyword) {
      filteredLogs = filteredLogs.filter(log =>
        log.username.includes(searchForm.keyword) ||
        log.nickname.includes(searchForm.keyword) ||
        log.url.includes(searchForm.keyword)
      )
    }
    if (searchForm.username) {
      filteredLogs = filteredLogs.filter(log => log.username === searchForm.username)
    }
    if (searchForm.module) {
      filteredLogs = filteredLogs.filter(log => log.module === searchForm.module)
    }
    if (searchForm.operation) {
      filteredLogs = filteredLogs.filter(log => log.operation === searchForm.operation)
    }
    if (searchForm.status !== '') {
      const statusCode = searchForm.status === 'success' ? 200 : searchForm.status === 'error' ? 401 : Number(searchForm.status)
      filteredLogs = filteredLogs.filter(log => log.status === statusCode || (searchForm.status === 'success' && log.status >= 200 && log.status < 300) || (searchForm.status === 'error' && log.status >= 400))
    }

    tableData.value = filteredLogs
    pagination.total = filteredLogs.length
  } catch (error) {
    console.error('Failed to load audit logs:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadAuditLogList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.username = ''
  searchForm.module = ''
  searchForm.operation = ''
  searchForm.status = ''
  dateRange.value = null
  pagination.page = 1
  loadAuditLogList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadAuditLogList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  loadAuditLogList()
}

const handleViewDetail = async (row: AuditLog) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const mockDetail: AuditLogDetail = {
      id: row.id,
      userId: row.userId,
      username: row.username,
      nickname: row.nickname,
      module: row.module,
      operation: row.operation,
      method: row.method,
      url: row.url,
      ip: row.ip,
      location: row.location,
      requestParams: row.requestParams,
      oldValue: row.operation === 'update' ? { name: '旧名称', status: 'pending' } : undefined,
      newValue: row.operation === 'update' ? { name: '新名称', status: 'approved' } : undefined,
      changes: row.operation === 'update' ? [
        { field: 'name', fieldLabel: '名称', oldValue: '旧名称', newValue: '新名称' },
        { field: 'status', fieldLabel: '状态', oldValue: 'pending', newValue: 'approved' }
      ] : undefined,
      status: row.status,
      errorMessage: row.errorMessage,
      duration: row.duration,
      createdAt: row.createdAt
    }
    currentLog.value = mockDetail
  } catch (error) {
    console.error('Failed to load log detail:', error)
  } finally {
    detailLoading.value = false
  }
}

const handleExport = async (format: 'csv' | 'excel') => {
  try {
    await ElMessageBox.confirm(
      `确定要导出审计日志为 ${format === 'csv' ? 'CSV' : 'Excel'} 格式吗?`,
      '导出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    ElMessage.success(`正在导出 ${format === 'csv' ? 'CSV' : 'Excel'} 文件...`)
  } catch {
    console.log('Export cancelled')
  }
}

const loadStatistics = async () => {
  try {
    statistics.value = {
      totalCount: 1256,
      todayCount: 89,
      errorCount: 12,
      moduleDistribution: [
        { module: '用户管理', count: 320 },
        { module: '资产管理', count: 456 },
        { module: '订单管理', count: 280 },
        { module: '审批管理', count: 150 },
        { module: '系统配置', count: 50 }
      ],
      dailyTrend: [
        { date: '2024-01-09', count: 65 },
        { date: '2024-01-10', count: 78 },
        { date: '2024-01-11', count: 82 },
        { date: '2024-01-12', count: 71 },
        { date: '2024-01-13', count: 58 },
        { date: '2024-01-14', count: 45 },
        { date: '2024-01-15', count: 89 }
      ]
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

const loadRetentionPolicy = async () => {
  try {
    Object.assign(policyForm, {
      id: 1,
      name: '默认策略',
      retentionDays: 30,
      archiveEnabled: true,
      archivePath: '/var/log/archive',
      autoDelete: true,
      status: 1,
      createdAt: '2024-01-01 00:00:00'
    })
  } catch (error) {
    console.error('Failed to load retention policy:', error)
  }
}

const handleSavePolicy = async () => {
  try {
    ElMessage.success('策略保存成功')
    policyDialogVisible.value = false
  } catch (error) {
    console.error('Failed to save policy:', error)
  }
}

const handleCleanLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理过期日志吗?此操作不可恢复。',
      '清理确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('日志清理完成')
    loadAuditLogList()
  } catch {
    console.log('Clean cancelled')
  }
}

const getMethodTagType = (method: string) => {
  const typeMap: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return typeMap[method] || 'info'
}

const getStatusTagType = (status: number) => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'danger'
  return 'info'
}

const getOperationLabel = (operation: string) => {
  return OPERATION_TYPES.find(o => o.value === operation)?.label || operation
}

const getModuleLabel = (module: string) => {
  return MODULE_TYPES.find(m => m.value === module)?.label || module
}

onMounted(() => {
  loadAuditLogList()
  loadStatistics()
  loadRetentionPolicy()
})
</script>

<template>
  <div class="audit-log-container">
    <el-tabs v-model="activeTab" class="audit-tabs">
      <el-tab-pane label="日志列表" name="list">
        <el-card class="search-card">
          <el-form :model="searchForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="关键词">
                  <el-input
                    v-model="searchForm.keyword"
                    placeholder="用户名/URL/操作"
                    clearable
                    @keyup.enter="handleSearch"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="用户名">
                  <el-input
                    v-model="searchForm.username"
                    placeholder="请输入用户名"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="模块">
                  <el-select v-model="searchForm.module" placeholder="请选择模块" clearable>
                    <el-option
                      v-for="item in MODULE_TYPES"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="操作类型">
                  <el-select v-model="searchForm.operation" placeholder="请选择操作" clearable>
                    <el-option
                      v-for="item in OPERATION_TYPES"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="操作结果">
                  <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                    <el-option label="成功" value="success" />
                    <el-option label="失败" value="error" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="操作时间">
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="handleReset">重置</el-button>
                  <el-button type="success" @click="handleExport('excel')">导出Excel</el-button>
                  <el-button type="info" @click="handleExport('csv')">导出CSV</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <el-card class="table-card">
          <el-table
            v-loading="loading"
            :data="tableData"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="nickname" label="昵称" width="100" />
            <el-table-column prop="module" label="模块" width="100">
              <template #default="{ row }">
                {{ getModuleLabel(row.module) }}
              </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作" width="100">
              <template #default="{ row }">
                {{ getOperationLabel(row.operation) }}
              </template>
            </el-table-column>
            <el-table-column prop="method" label="请求方法" width="100">
              <template #default="{ row }">
                <el-tag :type="getMethodTagType(row.method)" size="small">
                  {{ row.method }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="url" label="请求地址" min-width="180" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP地址" width="130" />
            <el-table-column prop="location" label="位置" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="耗时(ms)" width="90" />
            <el-table-column prop="createdAt" label="操作时间" width="170" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleViewDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="日志统计" name="statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalCount }}</div>
                <div class="stat-label">总日志数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ statistics.todayCount }}</div>
                <div class="stat-label">今日日志</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value" style="color: #f56c6c">{{ statistics.errorCount }}</div>
                <div class="stat-label">错误日志</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ Math.round(statistics.errorCount / statistics.totalCount * 100) }}%</div>
                <div class="stat-label">错误率</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>模块分布</span>
                </div>
              </template>
              <el-table :data="statistics.moduleDistribution" style="width: 100%">
                <el-table-column prop="module" label="模块" />
                <el-table-column prop="count" label="操作次数" />
                <el-table-column label="占比">
                  <template #default="{ row }">
                    <el-progress :percentage="Math.round(row.count / statistics.totalCount * 100)" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>每日趋势</span>
                </div>
              </template>
              <el-table :data="statistics.dailyTrend" style="width: 100%">
                <el-table-column prop="date" label="日期" />
                <el-table-column prop="count" label="操作次数" />
                <el-table-column label="趋势">
                  <template #default="{ row, $index }">
                    <el-progress
                      :percentage="Math.round(row.count / 100 * 100)"
                      :stroke-width="8"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="日志策略" name="policy">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>日志保留策略</span>
              <el-button type="primary" @click="handleSavePolicy">保存策略</el-button>
            </div>
          </template>
          <el-form :model="policyForm" label-width="140px">
            <el-form-item label="策略名称">
              <el-input v-model="policyForm.name" style="width: 300px" />
            </el-form-item>
            <el-form-item label="保留天数">
              <el-select v-model="policyForm.retentionDays" style="width: 300px">
                <el-option
                  v-for="item in RETENTION_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="自动清理">
              <el-switch v-model="policyForm.autoDelete" />
            </el-form-item>
            <el-form-item label="启用归档">
              <el-switch v-model="policyForm.archiveEnabled" />
            </el-form-item>
            <el-form-item v-if="policyForm.archiveEnabled" label="归档路径">
              <el-input v-model="policyForm.archivePath" style="width: 400px" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="handleCleanLogs">立即清理过期日志</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="700px"
    >
      <div v-loading="detailLoading">
        <el-descriptions v-if="currentLog" :column="2" border>
          <el-descriptions-item label="用户名">{{ currentLog.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ currentLog.nickname }}</el-descriptions-item>
          <el-descriptions-item label="模块">{{ getModuleLabel(currentLog.module) }}</el-descriptions-item>
          <el-descriptions-item label="操作">{{ getOperationLabel(currentLog.operation) }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">
            <el-tag :type="getMethodTagType(currentLog.method)" size="small">
              {{ currentLog.method }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="HTTP状态">
            <el-tag :type="getStatusTagType(currentLog.status)" size="small">
              {{ currentLog.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="请求地址" :span="2">{{ currentLog.url }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentLog.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ currentLog.duration }}ms</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ currentLog.createdAt }}</el-descriptions-item>
          <el-descriptions-item v-if="currentLog.errorMessage" label="错误信息" :span="2">
            <span style="color: #f56c6c">{{ currentLog.errorMessage }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentLog?.requestParams" style="margin-top: 20px">
          <h4>请求参数</h4>
          <el-input
            v-model="currentLog.requestParams"
            type="textarea"
            :rows="4"
            readonly
          />
        </div>

        <div v-if="currentLog?.responseResult" style="margin-top: 20px">
          <h4>响应结果</h4>
          <el-input
            v-model="currentLog.responseResult"
            type="textarea"
            :rows="4"
            readonly
          />
        </div>

        <div v-if="currentLog?.changes?.length" style="margin-top: 20px">
          <h4>变更记录</h4>
          <el-table :data="currentLog.changes" border>
            <el-table-column prop="fieldLabel" label="字段" />
            <el-table-column prop="oldValue" label="旧值">
              <template #default="{ row }">
                <span style="color: #f56c6c">{{ row.oldValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="newValue" label="新值">
              <template #default="{ row }">
                <span style="color: #67c23a">{{ row.newValue }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.audit-log-container {
  padding: 20px;
}

.audit-tabs {
  background: #fff;
  border-radius: 4px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
