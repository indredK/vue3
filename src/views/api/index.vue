<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ApiKey, ApiEndpoint, ApiCallLog, HttpMethod } from '@/types/api'
import { DEFAULT_API_ENDPOINTS } from '@/types/api'

const { t } = useI18n()

const activeTab = ref('endpoints')
const endpoints = ref<ApiEndpoint[]>([])
const apiKeys = ref<ApiKey[]>([])
const callLogs = ref<ApiCallLog[]>([])
const loading = ref(false)

const searchForm = reactive({
  keyword: '',
  method: '' as HttpMethod | '',
  tag: ''
})

const keySearchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const keyDialogVisible = ref(false)
const keyForm = reactive({
  name: '',
  description: '',
  permissions: [] as string[],
  expiresAt: ''
})

const testDialogVisible = ref(false)
const testForm = reactive({
  method: 'GET' as HttpMethod,
  path: '',
  headers: 'Authorization: Bearer xxx',
  body: ''
})
const testResult = ref('')
const testLoading = ref(false)

const stats = ref({
  totalCalls: 0,
  successCalls: 0,
  errorCalls: 0,
  avgResponseTime: 0
})

const filteredEndpoints = computed(() => {
  let result = endpoints.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(e =>
      e.path.toLowerCase().includes(keyword) ||
      e.summary.toLowerCase().includes(keyword)
    )
  }
  if (searchForm.method) {
    result = result.filter(e => e.method === searchForm.method)
  }
  if (searchForm.tag) {
    result = result.filter(e => e.tags.includes(searchForm.tag))
  }

  return result
})

const tags = computed(() => {
  const tagSet = new Set<string>()
  endpoints.value.forEach(e => e.tags.forEach(t => tagSet.add(t)))
  return Array.from(tagSet)
})

const loadEndpoints = async () => {
  endpoints.value = DEFAULT_API_ENDPOINTS
}

const loadApiKeys = async () => {
  const mockKeys: ApiKey[] = [
    {
      id: 1,
      name: '开发环境Key',
      key: 'sk_dev_xxxxxxxxxxxxx',
      userId: 1,
      username: 'admin',
      description: '用于开发测试',
      permissions: ['asset:read', 'asset:write', 'order:read'],
      expiresAt: '2025-12-31 23:59:59',
      callCount: 1256,
      status: 'active',
      createdAt: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      name: '生产环境Key',
      key: 'sk_prod_xxxxxxxxxxxxx',
      userId: 1,
      username: 'admin',
      description: '用于生产环境',
      permissions: ['asset:read', 'order:read', 'approval:read'],
      expiresAt: '2024-12-31 23:59:59',
      lastUsedAt: '2024-01-15 14:30:00',
      callCount: 5680,
      status: 'active',
      createdAt: '2024-01-01 10:00:00'
    },
    {
      id: 3,
      name: '测试Key',
      key: 'sk_test_xxxxxxxxxxxxx',
      userId: 1,
      username: 'admin',
      description: '用于集成测试',
      permissions: ['*'],
      callCount: 0,
      status: 'revoked',
      createdAt: '2023-06-01 10:00:00'
    }
  ]
  apiKeys.value = mockKeys
}

const loadCallLogs = async () => {
  const mockLogs: ApiCallLog[] = [
    {
      id: 1,
      apiKeyId: 1,
      apiKeyName: '开发环境Key',
      endpoint: 'GET /api/asset',
      method: 'GET',
      path: '/api/asset?page=1&size=10',
      queryParams: { page: 1, size: 10 },
      responseStatus: 200,
      responseBody: { code: 200, data: [] },
      responseTime: 125,
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-15 14:30:25'
    },
    {
      id: 2,
      apiKeyId: 2,
      apiKeyName: '生产环境Key',
      endpoint: 'POST /api/asset',
      method: 'POST',
      path: '/api/asset',
      requestBody: { name: '新资产', category: 'electronics' },
      responseStatus: 201,
      responseBody: { code: 201, data: { id: 100 } },
      responseTime: 256,
      ip: '192.168.1.101',
      createdAt: '2024-01-15 14:25:10'
    },
    {
      id: 3,
      apiKeyId: 1,
      apiKeyName: '开发环境Key',
      endpoint: 'GET /api/user',
      method: 'GET',
      path: '/api/user',
      responseStatus: 401,
      responseBody: { code: 401, message: 'Unauthorized' },
      responseTime: 45,
      ip: '192.168.1.102',
      createdAt: '2024-01-15 14:20:00'
    },
    {
      id: 4,
      apiKeyId: 2,
      apiKeyName: '生产环境Key',
      endpoint: 'PUT /api/order/1',
      method: 'PUT',
      path: '/api/order/1',
      requestBody: { status: 'approved' },
      responseStatus: 200,
      responseTime: 180,
      ip: '192.168.1.103',
      createdAt: '2024-01-15 14:15:30'
    }
  ]
  callLogs.value = mockLogs
  stats.value = {
    totalCalls: 7940,
    successCalls: 7650,
    errorCalls: 290,
    avgResponseTime: 156
  }
}

const handleCreateKey = async () => {
  if (!keyForm.name) {
    ElMessage.warning('请输入Key名称')
    return
  }

  const newKey: ApiKey = {
    id: Date.now(),
    name: keyForm.name,
    key: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    userId: 1,
    username: 'admin',
    description: keyForm.description,
    permissions: keyForm.permissions,
    expiresAt: keyForm.expiresAt || undefined,
    callCount: 0,
    status: 'active',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  apiKeys.value.unshift(newKey)
  ElMessage.success('API Key 创建成功')
  keyDialogVisible.value = false
  keyForm.name = ''
  keyForm.description = ''
  keyForm.permissions = []
  keyForm.expiresAt = ''
}

const handleRevokeKey = async (key: ApiKey) => {
  try {
    await ElMessageBox.confirm(`确定要撤销 "${key.name}" 吗?`, '撤销确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const target = apiKeys.value.find(k => k.id === key.id)
    if (target) {
      target.status = 'revoked'
    }
    ElMessage.success('API Key 已撤销')
  } catch {
    console.log('Cancelled')
  }
}

const handleDeleteKey = async (key: ApiKey) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${key.name}" 吗?`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = apiKeys.value.findIndex(k => k.id === key.id)
    if (index > -1) {
      apiKeys.value.splice(index, 1)
    }
    ElMessage.success('API Key 已删除')
  } catch {
    console.log('Cancelled')
  }
}

const handleCopyKey = (key: string) => {
  navigator.clipboard.writeText(key)
  ElMessage.success('已复制到剪贴板')
}

const handleTestApi = (endpoint: ApiEndpoint) => {
  testForm.method = endpoint.method
  testForm.path = endpoint.path
  testForm.body = endpoint.requestBody?.example ? JSON.stringify(endpoint.requestBody.example, null, 2) : ''
  testResult.value = ''
  testDialogVisible.value = true
}

const handleExecuteTest = async () => {
  testLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    testResult.value = JSON.stringify({
      code: 200,
      message: 'success',
      data: { result: '模拟响应数据' }
    }, null, 2)
  } finally {
    testLoading.value = false
  }
}

const getMethodTagType = (method: HttpMethod) => {
  const typeMap: Record<HttpMethod, string> = {
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
  if (status >= 400) return 'danger'
  return 'warning'
}

onMounted(() => {
  loadEndpoints()
  loadApiKeys()
  loadCallLogs()
})
</script>

<template>
  <div class="api-container">
    <el-tabs v-model="activeTab" class="api-tabs">
      <el-tab-pane label="API文档" name="endpoints">
        <el-card class="search-card">
          <el-form :model="searchForm">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input
                  v-model="searchForm.keyword"
                  placeholder="搜索接口路径或描述"
                  clearable
                />
              </el-col>
              <el-col :span="4">
                <el-select v-model="searchForm.method" placeholder="请求方法" clearable>
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select v-model="searchForm.tag" placeholder="接口分类" clearable>
                  <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag" />
                </el-select>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <div class="endpoint-list">
          <el-card v-for="endpoint in filteredEndpoints" :key="endpoint.id" class="endpoint-card">
            <div class="endpoint-header">
              <div class="endpoint-method">
                <el-tag :type="getMethodTagType(endpoint.method)" effect="dark">
                  {{ endpoint.method }}
                </el-tag>
              </div>
              <div class="endpoint-path">{{ endpoint.path }}</div>
              <div class="endpoint-summary">{{ endpoint.summary }}</div>
              <div class="endpoint-actions">
                <el-tag v-if="endpoint.security" type="success" size="small">需认证</el-tag>
                <el-tag v-if="endpoint.deprecated" type="danger" size="small">已废弃</el-tag>
                <el-button type="primary" size="small" @click="handleTestApi(endpoint)">测试</el-button>
              </div>
            </div>
            <div class="endpoint-desc">{{ endpoint.description }}</div>
            <el-collapse>
              <el-collapse-item title="查看详情" name="detail">
                <div v-if="endpoint.parameters.length" class="endpoint-section">
                  <h4>请求参数</h4>
                  <el-table :data="endpoint.parameters" size="small">
                    <el-table-column prop="name" label="参数名" />
                    <el-table-column prop="in" label="位置" width="80" />
                    <el-table-column prop="type" label="类型" width="80" />
                    <el-table-column prop="required" label="必填" width="60">
                      <template #default="{ row }">
                        {{ row.required ? '是' : '否' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" />
                  </el-table>
                </div>
                <div v-if="endpoint.requestBody" class="endpoint-section">
                  <h4>请求体</h4>
                  <pre class="code-block">{{ JSON.stringify(endpoint.requestBody.example, null, 2) }}</pre>
                </div>
                <div v-if="endpoint.responses.length" class="endpoint-section">
                  <h4>响应</h4>
                  <el-table :data="endpoint.responses" size="small">
                    <el-table-column prop="statusCode" label="状态码" width="100">
                      <template #default="{ row }">
                        <el-tag :type="getStatusTagType(row.statusCode)" size="small">
                          {{ row.statusCode }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" />
                  </el-table>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="API密钥管理" name="keys">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>API密钥列表</span>
              <el-button type="primary" @click="keyDialogVisible = true">创建密钥</el-button>
            </div>
          </template>

          <el-table :data="apiKeys" stripe>
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="key" label="密钥" min-width="200">
              <template #default="{ row }">
                <div class="key-cell">
                  <span class="key-value">{{ row.key.substring(0, 8) }}...{{ row.key.substring(row.key.length - 4) }}</span>
                  <el-button type="primary" link @click="handleCopyKey(row.key)">复制</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="所属用户" width="120" />
            <el-table-column prop="permissions" label="权限" min-width="150">
              <template #default="{ row }">
                <el-tag v-for="perm in row.permissions.slice(0, 2)" :key="perm" size="small" style="margin-right: 4px">
                  {{ perm }}
                </el-tag>
                <span v-if="row.permissions.length > 2">+{{ row.permissions.length - 2 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="callCount" label="调用次数" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : row.status === 'expired' ? 'warning' : 'danger'" size="small">
                  {{ row.status === 'active' ? '正常' : row.status === 'expired' ? '已过期' : '已撤销' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="170" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status === 'active'" type="warning" link @click="handleRevokeKey(row)">撤销</el-button>
                <el-button type="danger" link @click="handleDeleteKey(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="调用日志" name="logs">
        <el-row :gutter="20" style="margin-bottom: 20px">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-value">{{ stats.totalCalls }}</div>
              <div class="stat-label">总调用次数</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-value" style="color: #67c23a">{{ stats.successCalls }}</div>
              <div class="stat-label">成功次数</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-value" style="color: #f56c6c">{{ stats.errorCalls }}</div>
              <div class="stat-label">失败次数</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-value">{{ stats.avgResponseTime }}ms</div>
              <div class="stat-label">平均响应时间</div>
            </el-card>
          </el-col>
        </el-row>

        <el-card>
          <el-table :data="callLogs" stripe>
            <el-table-column prop="apiKeyName" label="API密钥" width="150" />
            <el-table-column prop="endpoint" label="接口" min-width="200" />
            <el-table-column prop="method" label="方法" width="80">
              <template #default="{ row }">
                <el-tag :type="getMethodTagType(row.method)" size="small">{{ row.method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="responseStatus" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.responseStatus)" size="small">{{ row.responseStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="responseTime" label="耗时" width="80">
              <template #default="{ row }">
                {{ row.responseTime }}ms
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP地址" width="130" />
            <el-table-column prop="createdAt" label="调用时间" width="170" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="keyDialogVisible" title="创建API密钥" width="500px">
      <el-form :model="keyForm" label-width="100px">
        <el-form-item label="密钥名称" required>
          <el-input v-model="keyForm.name" placeholder="请输入密钥名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="keyForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="keyForm.permissions">
            <el-checkbox label="asset:read">资产读取</el-checkbox>
            <el-checkbox label="asset:write">资产写入</el-checkbox>
            <el-checkbox label="order:read">订单读取</el-checkbox>
            <el-checkbox label="order:write">订单写入</el-checkbox>
            <el-checkbox label="approval:read">审批读取</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="keyForm.expiresAt"
            type="datetime"
            placeholder="选择过期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="keyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateKey">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="testDialogVisible" title="API测试" width="700px">
      <el-form :model="testForm" label-width="80px">
        <el-form-item label="请求方法">
          <el-select v-model="testForm.method">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求路径">
          <el-input v-model="testForm.path" placeholder="/api/xxx" />
        </el-form-item>
        <el-form-item label="请求头">
          <el-input v-model="testForm.headers" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="testForm.method !== 'GET'" label="请求体">
          <el-input v-model="testForm.body" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭</el-button>
        <el-button type="primary" :loading="testLoading" @click="handleExecuteTest">发送请求</el-button>
      </template>
      <div v-if="testResult" class="test-result">
        <h4>响应结果</h4>
        <pre>{{ testResult }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.api-container {
  padding: 20px;
}

.api-tabs {
  background: #fff;
  border-radius: 4px;
}

.search-card {
  margin-bottom: 20px;
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.endpoint-card {
  margin-bottom: 0;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.endpoint-path {
  font-family: monospace;
  font-weight: 500;
  color: #303133;
}

.endpoint-summary {
  flex: 1;
  color: #606266;
}

.endpoint-actions {
  display: flex;
  gap: 8px;
}

.endpoint-desc {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.endpoint-section {
  margin-top: 16px;
}

.endpoint-section h4 {
  margin-bottom: 8px;
  color: #303133;
}

.code-block {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.key-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key-value {
  font-family: monospace;
  color: #606266;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.test-result {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.test-result h4 {
  margin-bottom: 8px;
}

.test-result pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  max-height: 300px;
  overflow: auto;
}
</style>
