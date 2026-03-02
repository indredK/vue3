<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getApprovalFlowListApi,
  createApprovalFlowApi,
  updateApprovalFlowApi,
  deleteApprovalFlowApi
} from '@/api/modules/approval'
import type { ApprovalFlow, ApprovalNode, Approver } from '@/types/approval'
import { FLOW_TYPES, NODE_TYPES, APPROVAL_TYPES, APPROVER_TYPES } from '@/types/approval'

const { t } = useI18n()

const searchForm = reactive({
  keyword: '',
  flowType: '',
  status: ''
})

const tableData = ref<ApprovalFlow[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'create' | 'edit'>('create')

const formData = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  flowType: 'purchase',
  status: 1,
  nodes: [] as ApprovalNode[]
})

const currentNode = ref<ApprovalNode | null>(null)
const nodeDialogVisible = ref(false)
const nodeForm = reactive({
  name: '',
  nodeType: 'approval' as ApprovalNode['nodeType'],
  approvalType: 'single' as ApprovalNode['approvalType'],
  approvers: [] as Approver[],
  sort: 1
})

const loadFlowList = async () => {
  loading.value = true
  try {
    const mockData: ApprovalFlow[] = [
      {
        id: 1,
        name: '采购审批流程',
        code: 'purchase_approval',
        description: '采购订单审批流程',
        flowType: 'purchase',
        flowTypeName: '采购审批',
        nodes: [
          { id: 1, flowId: 1, name: '开始', nodeType: 'start', approvalType: 'single', approvers: [], sort: 1 },
          { id: 2, flowId: 1, name: '部门主管审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 1, type: 'role', targetId: 2, targetName: '部门主管' }], sort: 2 },
          { id: 3, flowId: 1, name: '总经理审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 2, type: 'role', targetId: 1, targetName: '总经理' }], sort: 3 },
          { id: 4, flowId: 1, name: '结束', nodeType: 'end', approvalType: 'single', approvers: [], sort: 4 }
        ],
        status: 1,
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '租赁审批流程',
        code: 'rental_approval',
        description: '租赁订单审批流程',
        flowType: 'rental',
        flowTypeName: '租赁审批',
        nodes: [
          { id: 5, flowId: 2, name: '开始', nodeType: 'start', approvalType: 'single', approvers: [], sort: 1 },
          { id: 6, flowId: 2, name: '业务主管审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 3, type: 'role', targetId: 3, targetName: '业务主管' }], sort: 2 },
          { id: 7, flowId: 2, name: '结束', nodeType: 'end', approvalType: 'single', approvers: [], sort: 3 }
        ],
        status: 1,
        createdAt: '2024-01-02 10:00:00'
      },
      {
        id: 3,
        name: '维修审批流程',
        code: 'maintenance_approval',
        description: '维修工单审批流程',
        flowType: 'maintenance',
        flowTypeName: '维修审批',
        nodes: [
          { id: 8, flowId: 3, name: '开始', nodeType: 'start', approvalType: 'single', approvers: [], sort: 1 },
          { id: 9, flowId: 3, name: '维修主管审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 4, type: 'role', targetId: 4, targetName: '维修主管' }], sort: 2 },
          { id: 10, flowId: 3, name: '结束', nodeType: 'end', approvalType: 'single', approvers: [], sort: 3 }
        ],
        status: 1,
        createdAt: '2024-01-03 10:00:00'
      },
      {
        id: 4,
        name: '报废审批流程',
        code: 'retired_approval',
        description: '资产报废审批流程',
        flowType: 'retired',
        flowTypeName: '报废审批',
        nodes: [
          { id: 11, flowId: 4, name: '开始', nodeType: 'start', approvalType: 'single', approvers: [], sort: 1 },
          { id: 12, flowId: 4, name: '部门主管审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 5, type: 'role', targetId: 2, targetName: '部门主管' }], sort: 2 },
          { id: 13, flowId: 4, name: '财务审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 6, type: 'role', targetId: 5, targetName: '财务主管' }], sort: 3 },
          { id: 14, flowId: 4, name: '总经理审批', nodeType: 'approval', approvalType: 'single', approvers: [{ id: 7, type: 'role', targetId: 1, targetName: '总经理' }], sort: 4 },
          { id: 15, flowId: 4, name: '结束', nodeType: 'end', approvalType: 'single', approvers: [], sort: 5 }
        ],
        status: 0,
        createdAt: '2024-01-04 10:00:00'
      }
    ]
    
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载审批流程列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadFlowList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.flowType = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '创建审批流程'
  dialogMode.value = 'create'
  Object.assign(formData, {
    id: 0,
    name: '',
    code: '',
    description: '',
    flowType: 'purchase',
    status: 1,
    nodes: [
      { id: 0, flowId: 0, name: '开始', nodeType: 'start', approvalType: 'single', approvers: [], sort: 1 },
      { id: 0, flowId: 0, name: '结束', nodeType: 'end', approvalType: 'single', approvers: [], sort: 2 }
    ]
  })
  dialogVisible.value = true
}

const handleEdit = (row: ApprovalFlow) => {
  dialogTitle.value = '编辑审批流程'
  dialogMode.value = 'edit'
  Object.assign(formData, { ...row, nodes: [...row.nodes] })
  dialogVisible.value = true
}

const handleDelete = (row: ApprovalFlow) => {
  ElMessageBox.confirm(`确定要删除审批流程「${row.name}」吗？`, t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteApprovalFlowApi(row.id)
      await loadFlowList()
      ElMessage.success(t('common.success'))
    } catch {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      ElMessage.success(t('common.success'))
    }
  }).catch(() => {})
}

const handleAddNode = () => {
  const newNode: ApprovalNode = {
    id: Date.now(),
    flowId: formData.id,
    name: '',
    nodeType: 'approval',
    approvalType: 'single',
    approvers: [],
    sort: formData.nodes.length + 1
  }
  formData.nodes.splice(formData.nodes.length - 1, 0, newNode)
  updateNodeSort()
}

const handleDeleteNode = (index: number) => {
  const node = formData.nodes[index]
  if (node.nodeType === 'start' || node.nodeType === 'end') {
    ElMessage.warning('不能删除开始和结束节点')
    return
  }
  formData.nodes.splice(index, 1)
  updateNodeSort()
}

const updateNodeSort = () => {
  formData.nodes.forEach((node, index) => {
    node.sort = index + 1
  })
}

const handleEditNode = (node: ApprovalNode) => {
  currentNode.value = node
  Object.assign(nodeForm, {
    name: node.name,
    nodeType: node.nodeType,
    approvalType: node.approvalType,
    approvers: [...node.approvers],
    sort: node.sort
  })
  nodeDialogVisible.value = true
}

const handleSaveNode = () => {
  if (!currentNode.value) return
  
  if (currentNode.value.nodeType === 'approval' && nodeForm.approvers.length === 0) {
    ElMessage.warning('请配置审批人')
    return
  }
  
  currentNode.value.name = nodeForm.name
  currentNode.value.nodeType = nodeForm.nodeType
  currentNode.value.approvalType = nodeForm.approvalType
  currentNode.value.approvers = [...nodeForm.approvers]
  currentNode.value.sort = nodeForm.sort
  
  nodeDialogVisible.value = false
}

const handleAddApprover = () => {
  nodeForm.approvers.push({
    id: Date.now(),
    type: 'user',
    targetId: 0,
    targetName: ''
  })
}

const handleRemoveApprover = (index: number) => {
  nodeForm.approvers.splice(index, 1)
}

const handleSave = async () => {
  if (!formData.name || !formData.code) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (dialogMode.value === 'create') {
      await createApprovalFlowApi(formData)
    } else {
      await updateApprovalFlowApi(formData.id, formData)
    }
    
    dialogVisible.value = false
    await loadFlowList()
    ElMessage.success(t('common.success'))
  } catch {
    if (dialogMode.value === 'create') {
      tableData.value.unshift({
        ...formData,
        id: Date.now(),
        flowTypeName: FLOW_TYPES.find(f => f.value === formData.flowType)?.label || '',
        createdAt: new Date().toLocaleString()
      } as ApprovalFlow)
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

const getNodeTypeLabel = (type: string) => {
  return NODE_TYPES.find(n => n.value === type)?.label || type
}

const getApprovalTypeLabel = (type: string) => {
  return APPROVAL_TYPES.find(a => a.value === type)?.label || type
}

const getApproverTypeLabel = (type: string) => {
  return APPROVER_TYPES.find(a => a.value === type)?.label || type
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadFlowList()
}

onMounted(() => {
  loadFlowList()
})
</script>

<template>
  <div class="approval-flow-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="流程名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入流程名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="流程类型">
          <el-select v-model="searchForm.flowType" placeholder="请选择" clearable style="width: 130px">
            <el-option v-for="type in FLOW_TYPES" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button type="primary" @click="handleAdd">创建审批流程</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="name" label="流程名称" width="180" />
        <el-table-column prop="code" label="流程编码" width="180" />
        <el-table-column prop="flowTypeName" label="流程类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.flowTypeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审批节点" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="node in row.nodes" :key="node.id" size="small" style="margin-right: 4px">
              {{ node.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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
          @size-change="loadFlowList"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 审批流程编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="流程名称" required>
              <el-input v-model="formData.name" placeholder="请输入流程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流程编码" required>
              <el-input v-model="formData.code" placeholder="请输入流程编码" :disabled="dialogMode === 'edit'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流程类型" required>
              <el-select v-model="formData.flowType" placeholder="请选择" style="width: 100%">
                <el-option v-for="type in FLOW_TYPES" :key="type.value" :label="type.label" :value="type.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="formData.description" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>审批节点配置</el-divider>

        <div class="node-list">
          <el-button type="primary" size="small" @click="handleAddNode" style="margin-bottom: 10px">添加节点</el-button>
          <div v-for="(node, index) in formData.nodes" :key="node.id" class="node-item">
            <div class="node-header">
              <el-tag :type="node.nodeType === 'start' ? 'success' : node.nodeType === 'end' ? 'danger' : 'warning'">
                {{ getNodeTypeLabel(node.nodeType) }}
              </el-tag>
              <span class="node-name">{{ node.name || '未命名节点' }}</span>
              <el-button v-if="node.nodeType === 'approval'" link type="primary" size="small" @click="handleEditNode(node)">配置</el-button>
              <el-button v-if="node.nodeType === 'approval'" link type="danger" size="small" @click="handleDeleteNode(index)">删除</el-button>
            </div>
            <div v-if="node.nodeType === 'approval'" class="node-info">
              <span>审批类型：{{ getApprovalTypeLabel(node.approvalType) }}</span>
              <span v-if="node.approvers.length > 0">
                审批人：
                <el-tag v-for="approver in node.approvers" :key="approver.id" size="small">
                  {{ getApproverTypeLabel(approver.type) }}-{{ approver.targetName }}
                </el-tag>
              </span>
            </div>
            <div v-if="index < formData.nodes.length - 1" class="node-arrow">↓</div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 节点配置对话框 -->
    <el-dialog v-model="nodeDialogVisible" title="节点配置" width="600px">
      <el-form :model="nodeForm" label-width="100px">
        <el-form-item label="节点名称" required>
          <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select v-model="nodeForm.nodeType" placeholder="请选择" style="width: 100%">
            <el-option v-for="type in NODE_TYPES" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="nodeForm.nodeType === 'approval'" label="审批类型">
          <el-select v-model="nodeForm.approvalType" placeholder="请选择" style="width: 100%">
            <el-option v-for="type in APPROVAL_TYPES" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="nodeForm.nodeType === 'approval'" label="审批人配置">
          <div class="approver-list">
            <div v-for="(approver, index) in nodeForm.approvers" :key="index" class="approver-item">
              <el-select v-model="approver.type" placeholder="类型" style="width: 120px">
                <el-option v-for="type in APPROVER_TYPES" :key="type.value" :label="type.label" :value="type.value" />
              </el-select>
              <el-input v-model="approver.targetName" placeholder="名称" style="width: 150px" />
              <el-button type="danger" size="small" @click="handleRemoveApprover(index)">删除</el-button>
            </div>
            <el-button type="primary" size="small" @click="handleAddApprover">添加审批人</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nodeDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveNode">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.approval-flow-management {
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

.node-list {
  max-height: 400px;
  overflow-y: auto;
}

.node-item {
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 10px;
  background: #f5f7fa;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-name {
  flex: 1;
  font-weight: 500;
}

.node-info {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.node-arrow {
  text-align: center;
  font-size: 20px;
  color: #409eff;
  margin: 5px 0;
}

.approver-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.approver-item {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
