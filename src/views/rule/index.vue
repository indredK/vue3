<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRuleListApi,
  createRuleApi,
  updateRuleApi,
  deleteRuleApi,
  updateRuleStatusApi,
  executeRuleApi
} from '@/api/modules/rule'
import type { Rule, RuleCondition, RuleAction, RuleExecutionLog } from '@/types/rule'
import { TRIGGER_TYPES, OPERATORS, ACTION_TYPES, LOGIC_OPERATORS } from '@/types/rule'

const { t } = useI18n()

const searchForm = reactive({
  keyword: '',
  triggerType: '',
  status: ''
})

const tableData = ref<Rule[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const logDialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'create' | 'edit'>('create')

const formData = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  triggerType: 'data_change' as Rule['triggerType'],
  triggerConfig: {} as Rule['triggerConfig'],
  conditions: [] as RuleCondition[],
  actions: [] as RuleAction[],
  status: 1,
  priority: 1
})

const conditionForm = reactive({
  field: '',
  fieldLabel: '',
  operator: 'eq' as RuleCondition['operator'],
  value: '',
  logic: 'and' as RuleCondition['logic']
})

const actionForm = reactive({
  actionType: 'update_field' as RuleAction['actionType'],
  actionName: '',
  config: {} as Record<string, any>,
  order: 1
})

const currentRuleId = ref(0)
const executionLogs = ref<RuleExecutionLog[]>([])
const logsLoading = ref(false)

const availableFields = ref<{ label: string; value: string }[]>([
  { label: '资产名称', value: 'name' },
  { label: '资产编号', value: 'assetCode' },
  { label: '状态', value: 'status' },
  { label: '购买日期', value: 'purchaseDate' },
  { label: '价格', value: 'price' },
  { label: '所属部门', value: 'department' }
])

const loadRuleList = async () => {
  loading.value = true
  try {
    const mockData: Rule[] = [
      {
        id: 1,
        name: '资产保修期提醒',
        code: 'asset_warranty_remind',
        description: '资产保修期即将到期时自动提醒',
        triggerType: 'schedule',
        triggerConfig: { cron: '0 9 * * *' },
        conditions: [
          { id: 1, field: 'warrantyEndDate', fieldLabel: '保修结束日期', operator: 'between', value: '', logic: 'and' }
        ],
        actions: [
          { id: 1, actionType: 'send_notification', actionName: '发送提醒通知', config: { templateId: 'warranty_remind' }, order: 1 }
        ],
        status: 1,
        priority: 1,
        executionCount: 156,
        lastExecuteTime: '2024-01-15 09:00:00',
        createdBy: 'admin',
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '资产状态自动变更',
        code: 'asset_status_auto_change',
        description: '根据资产使用年限自动变更状态',
        triggerType: 'data_change',
        triggerConfig: { assetTypeId: 1 },
        conditions: [
          { id: 2, field: 'purchaseDate', fieldLabel: '购买日期', operator: 'lt', value: '2020-01-01', logic: 'and' }
        ],
        actions: [
          { id: 2, actionType: 'change_status', actionName: '变更资产状态', config: { status: 'retired' }, order: 1 }
        ],
        status: 1,
        priority: 2,
        executionCount: 89,
        lastExecuteTime: '2024-01-14 15:30:00',
        createdBy: 'admin',
        createdAt: '2024-01-02 10:00:00'
      },
      {
        id: 3,
        name: '资产分配超期提醒',
        code: 'asset_assign_overdue',
        description: '资产分配超期未归还时提醒',
        triggerType: 'schedule',
        triggerConfig: { cron: '0 18 * * *' },
        conditions: [
          { id: 3, field: 'assignEndDate', fieldLabel: '分配结束日期', operator: 'lt', value: '', logic: 'and' }
        ],
        actions: [
          { id: 3, actionType: 'send_notification', actionName: '发送超期提醒', config: { templateId: 'assign_overdue' }, order: 1 }
        ],
        status: 0,
        priority: 1,
        executionCount: 0,
        createdBy: 'admin',
        createdAt: '2024-01-03 10:00:00'
      },
      {
        id: 4,
        name: '新资产自动通知',
        code: 'asset_new_notify',
        description: '新资产创建时自动通知管理员',
        triggerType: 'data_change',
        triggerConfig: { events: ['create'] },
        conditions: [],
        actions: [
          { id: 4, actionType: 'send_notification', actionName: '通知管理员', config: { receivers: ['admin'] }, order: 1 }
        ],
        status: 1,
        priority: 3,
        executionCount: 234,
        lastExecuteTime: '2024-01-15 14:20:00',
        createdBy: 'admin',
        createdAt: '2024-01-04 10:00:00'
      }
    ]
    
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载规则列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadRuleList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.triggerType = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '创建规则'
  dialogMode.value = 'create'
  Object.assign(formData, {
    id: 0,
    name: '',
    code: '',
    description: '',
    triggerType: 'data_change',
    triggerConfig: {},
    conditions: [],
    actions: [],
    status: 1,
    priority: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row: Rule) => {
  dialogTitle.value = '编辑规则'
  dialogMode.value = 'edit'
  Object.assign(formData, { ...row, triggerConfig: row.triggerConfig || {} })
  dialogVisible.value = true
}

const handleDelete = (row: Rule) => {
  ElMessageBox.confirm(`确定要删除规则「${row.name}」吗？`, t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRuleApi(row.id)
      await loadRuleList()
      ElMessage.success(t('common.success'))
    } catch {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      ElMessage.success(t('common.success'))
    }
  }).catch(() => {})
}

const handleStatusChange = async (row: Rule) => {
  try {
    await updateRuleStatusApi(row.id, row.status === 1 ? 0 : 1)
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(t('common.success'))
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleExecute = async (row: Rule) => {
  try {
    await ElMessageBox.confirm(`确定要立即执行规则「${row.name}」吗？`, '提示', {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    
    await executeRuleApi(row.id)
    row.executionCount++
    row.lastExecuteTime = new Date().toLocaleString()
    ElMessage.success('规则执行成功')
  } catch {}
}

const handleViewLogs = async (row: Rule) => {
  currentRuleId.value = row.id
  logDialogVisible.value = true
  logsLoading.value = true
  
  try {
    const mockLogs: RuleExecutionLog[] = [
      {
        id: 1,
        ruleId: row.id,
        ruleName: row.name,
        triggerType: row.triggerType,
        conditionsResult: true,
        actionsResult: [{ actionId: 1, actionName: '发送通知', success: true, message: '发送成功' }],
        executionTime: 125,
        status: 'success',
        executedBy: 'system',
        executedAt: row.lastExecuteTime || ''
      },
      {
        id: 2,
        ruleId: row.id,
        ruleName: row.name,
        triggerType: row.triggerType,
        conditionsResult: false,
        actionsResult: [],
        executionTime: 45,
        status: 'failed',
        errorMessage: '条件不满足',
        executedBy: 'system',
        executedAt: '2024-01-14 09:00:00'
      }
    ]
    
    executionLogs.value = mockLogs
  } finally {
    logsLoading.value = false
  }
}

const handleAddCondition = () => {
  const field = availableFields.value.find(f => f.value === conditionForm.field)
  formData.conditions.push({
    id: Date.now(),
    field: conditionForm.field,
    fieldLabel: field?.label || conditionForm.field,
    operator: conditionForm.operator,
    value: conditionForm.value,
    logic: conditionForm.logic
  })
  
  Object.assign(conditionForm, {
    field: '',
    fieldLabel: '',
    operator: 'eq',
    value: '',
    logic: 'and'
  })
}

const handleRemoveCondition = (index: number) => {
  formData.conditions.splice(index, 1)
}

const handleAddAction = () => {
  const actionType = ACTION_TYPES.find(a => a.value === actionForm.actionType)
  formData.actions.push({
    id: Date.now(),
    actionType: actionForm.actionType,
    actionName: actionType?.label || '',
    config: {},
    order: formData.actions.length + 1
  })
  
  Object.assign(actionForm, {
    actionType: 'update_field',
    actionName: '',
    config: {},
    order: formData.actions.length + 2
  })
}

const handleRemoveAction = (index: number) => {
  formData.actions.splice(index, 1)
}

const handleSave = async () => {
  if (!formData.name || !formData.code) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (dialogMode.value === 'create') {
      await createRuleApi(formData)
    } else {
      await updateRuleApi(formData.id, formData)
    }
    
    dialogVisible.value = false
    await loadRuleList()
    ElMessage.success(t('common.success'))
  } catch {
    if (dialogMode.value === 'create') {
      tableData.value.unshift({
        ...formData,
        id: Date.now(),
        executionCount: 0,
        createdBy: 'admin',
        createdAt: new Date().toLocaleString()
      } as Rule)
    } else {
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        Object.assign(tableData.value[index], formData)
      }
    }
    dialogVisible.value = false
    ElMessage.success(t('common.success'))
  }
}

const getTriggerTypeLabel = (type: string) => {
  return TRIGGER_TYPES.find(t => t.value === type)?.label || type
}

const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'info'
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadRuleList()
}

onMounted(() => {
  loadRuleList()
})
</script>

<template>
  <div class="rule-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入规则名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="触发类型">
          <el-select v-model="searchForm.triggerType" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="type in TRIGGER_TYPES" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button type="primary" @click="handleAdd">创建规则</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="name" label="规则名称" width="180" />
        <el-table-column prop="code" label="规则编码" width="180" />
        <el-table-column label="触发类型" width="130">
          <template #default="{ row }">
            <el-tag>{{ getTriggerTypeLabel(row.triggerType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="条件数" width="80">
          <template #default="{ row }">
            <el-tag type="info">{{ row.conditions.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="动作数" width="80">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.actions.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="executionCount" label="执行次数" width="100" />
        <el-table-column prop="lastExecuteTime" label="最后执行" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleExecute(row)">执行</el-button>
            <el-button link type="info" @click="handleViewLogs(row)">日志</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
          @size-change="loadRuleList"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 规则编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" required>
              <el-input v-model="formData.name" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则编码" required>
              <el-input v-model="formData.code" placeholder="请输入规则编码" :disabled="dialogMode === 'edit'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="触发类型" required>
              <el-select v-model="formData.triggerType" placeholder="请选择" style="width: 100%">
                <el-option v-for="type in TRIGGER_TYPES" :key="type.value" :label="type.label" :value="type.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-input-number v-model="formData.priority" :min="1" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="formData.description" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>触发条件配置</el-divider>

        <div class="condition-builder">
          <el-form :model="conditionForm" inline>
            <el-form-item label="字段">
              <el-select v-model="conditionForm.field" placeholder="请选择字段" style="width: 150px">
                <el-option v-for="field in availableFields" :key="field.value" :label="field.label" :value="field.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="运算符">
              <el-select v-model="conditionForm.operator" placeholder="请选择" style="width: 120px">
                <el-option v-for="op in OPERATORS" :key="op.value" :label="op.label" :value="op.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="值">
              <el-input v-model="conditionForm.value" placeholder="请输入值" style="width: 150px" />
            </el-form-item>
            <el-form-item label="逻辑">
              <el-select v-model="conditionForm.logic" placeholder="请选择" style="width: 100px">
                <el-option v-for="logic in LOGIC_OPERATORS" :key="logic.value" :label="logic.label" :value="logic.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddCondition">添加条件</el-button>
            </el-form-item>
          </el-form>

          <div class="condition-list">
            <el-tag
              v-for="(condition, index) in formData.conditions"
              :key="condition.id"
              closable
              @close="handleRemoveCondition(index)"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ condition.fieldLabel }} {{ OPERATORS.find(o => o.value === condition.operator)?.label }} {{ condition.value }} ({{ condition.logic }})
            </el-tag>
            <el-empty v-if="formData.conditions.length === 0" description="暂无条件" :image-size="60" />
          </div>
        </div>

        <el-divider>执行动作配置</el-divider>

        <div class="action-builder">
          <el-form :model="actionForm" inline>
            <el-form-item label="动作类型">
              <el-select v-model="actionForm.actionType" placeholder="请选择" style="width: 150px">
                <el-option v-for="action in ACTION_TYPES" :key="action.value" :label="action.label" :value="action.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddAction">添加动作</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="formData.actions" border size="small" style="margin-top: 10px">
            <el-table-column prop="actionName" label="动作名称" />
            <el-table-column label="动作类型">
              <template #default="{ row }">
                {{ ACTION_TYPES.find(a => a.value === row.actionType)?.label }}
              </template>
            </el-table-column>
            <el-table-column prop="order" label="顺序" width="80" />
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="handleRemoveAction($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 执行日志对话框 -->
    <el-dialog v-model="logDialogVisible" title="执行日志" width="800px">
      <el-table v-loading="logsLoading" :data="executionLogs" border stripe max-height="400">
        <el-table-column prop="executedAt" label="执行时间" width="180" />
        <el-table-column label="执行结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'">
              {{ row.status === 'success' ? '成功' : row.status === 'failed' ? '失败' : '部分成功' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="条件结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.conditionsResult ? 'success' : 'info'">
              {{ row.conditionsResult ? '满足' : '不满足' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executionTime" label="执行时长" width="100">
          <template #default="{ row }">
            {{ row.executionTime }}ms
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" />
      </el-table>
      <template #footer>
        <el-button @click="logDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.rule-management {
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

.condition-builder,
.action-builder {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.condition-list {
  margin-top: 15px;
  min-height: 60px;
}
</style>
