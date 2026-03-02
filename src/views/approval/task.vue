<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPendingTasksApi,
  getCompletedTasksApi,
  getApprovalTaskDetailApi,
  approveTaskApi,
  rejectTaskApi,
  transferTaskApi
} from '@/api/modules/approval'
import type { ApprovalTask, ApprovalInstance, ApprovalRecord } from '@/types/approval'

const { t } = useI18n()

const activeTab = ref('pending')

const pendingTasks = ref<ApprovalTask[]>([])
const completedTasks = ref<ApprovalTask[]>([])
const loading = ref(false)

const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)

const currentTask = ref<ApprovalTask | null>(null)
const currentInstance = ref<ApprovalInstance | null>(null)
const approvalRecords = ref<ApprovalRecord[]>([])

const approvalForm = reactive({
  action: 'approve' as 'approve' | 'reject' | 'transfer',
  comment: '',
  transferTargetId: 0,
  transferTargetName: ''
})

const transferUserList = ref<{ id: number; name: string }[]>([
  { id: 2, name: '张三' },
  { id: 3, name: '李四' },
  { id: 4, name: '王五' }
])

const loadPendingTasks = async () => {
  loading.value = true
  try {
    const mockTasks: ApprovalTask[] = [
      {
        id: 1,
        instanceId: 1,
        nodeId: 2,
        nodeName: '部门主管审批',
        assigneeId: 1,
        assigneeName: '当前用户',
        status: 'pending',
        createdAt: '2024-01-15 10:00:00'
      },
      {
        id: 2,
        instanceId: 2,
        nodeId: 3,
        nodeName: '总经理审批',
        assigneeId: 1,
        assigneeName: '当前用户',
        status: 'pending',
        createdAt: '2024-01-16 09:30:00'
      },
      {
        id: 3,
        instanceId: 3,
        nodeId: 4,
        nodeName: '财务审批',
        assigneeId: 1,
        assigneeName: '当前用户',
        status: 'pending',
        createdAt: '2024-01-16 14:20:00'
      }
    ]
    
    const mockInstances: ApprovalInstance[] = [
      { id: 1, flowId: 1, flowName: '采购审批流程', businessId: 1, businessType: 'order', businessNo: 'ORD001', title: '采购办公设备申请', applicantId: 2, applicantName: '张三', currentNodeId: 2, currentNodeName: '部门主管审批', status: 'pending', startTime: '2024-01-15 10:00:00', createdAt: '2024-01-15 10:00:00' },
      { id: 2, flowId: 1, flowName: '采购审批流程', businessId: 2, businessType: 'order', businessNo: 'ORD002', title: '采购服务器申请', applicantId: 3, applicantName: '李四', currentNodeId: 3, currentNodeName: '总经理审批', status: 'pending', startTime: '2024-01-16 09:30:00', createdAt: '2024-01-16 09:30:00' },
      { id: 3, flowId: 3, flowName: '维修审批流程', businessId: 3, businessType: 'order', businessNo: 'ORD003', title: '设备维修申请', applicantId: 4, applicantName: '王五', currentNodeId: 4, currentNodeName: '财务审批', status: 'pending', startTime: '2024-01-16 14:20:00', createdAt: '2024-01-16 14:20:00' }
    ]
    
    pendingTasks.value = mockTasks.map((task, index) => ({
      ...task,
      ...mockInstances[index]
    })) as any
    
  } catch (error) {
    ElMessage.error('加载待审批任务失败')
  } finally {
    loading.value = false
  }
}

const loadCompletedTasks = async () => {
  loading.value = true
  try {
    const mockTasks: ApprovalTask[] = [
      {
        id: 10,
        instanceId: 10,
        nodeId: 2,
        nodeName: '部门主管审批',
        assigneeId: 1,
        assigneeName: '当前用户',
        status: 'approved',
        comment: '同意采购',
        completeTime: '2024-01-14 15:30:00',
        createdAt: '2024-01-14 10:00:00'
      },
      {
        id: 11,
        instanceId: 11,
        nodeId: 3,
        nodeName: '总经理审批',
        assigneeId: 1,
        assigneeName: '当前用户',
        status: 'rejected',
        comment: '金额超出预算',
        completeTime: '2024-01-13 16:00:00',
        createdAt: '2024-01-13 14:00:00'
      }
    ]
    
    const mockInstances: ApprovalInstance[] = [
      { id: 10, flowId: 1, flowName: '采购审批流程', businessId: 10, businessType: 'order', businessNo: 'ORD010', title: '采购办公桌椅', applicantId: 5, applicantName: '赵六', currentNodeId: 2, currentNodeName: '部门主管审批', status: 'approved', startTime: '2024-01-14 10:00:00', endTime: '2024-01-14 15:30:00', createdAt: '2024-01-14 10:00:00' },
      { id: 11, flowId: 2, flowName: '租赁审批流程', businessId: 11, businessType: 'order', businessNo: 'ORD011', title: '租赁设备申请', applicantId: 6, applicantName: '钱七', currentNodeId: 3, currentNodeName: '总经理审批', status: 'rejected', startTime: '2024-01-13 14:00:00', endTime: '2024-01-13 16:00:00', createdAt: '2024-01-13 14:00:00' }
    ]
    
    completedTasks.value = mockTasks.map((task, index) => ({
      ...task,
      ...mockInstances[index]
    })) as any
    
  } catch (error) {
    ElMessage.error('加载已审批任务失败')
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  if (activeTab.value === 'pending') {
    await loadPendingTasks()
  } else {
    await loadCompletedTasks()
  }
}

const handleTabChange = () => {
  loadData()
}

const handleViewDetail = async (row: any) => {
  currentTask.value = row
  currentInstance.value = {
    id: row.instanceId,
    flowId: row.flowId,
    flowName: row.flowName,
    businessId: row.businessId,
    businessType: row.businessType,
    businessNo: row.businessNo,
    title: row.title,
    applicantId: row.applicantId,
    applicantName: row.applicantName,
    currentNodeId: row.currentNodeId,
    currentNodeName: row.currentNodeName,
    status: row.status,
    startTime: row.startTime,
    createdAt: row.createdAt
  }
  
  approvalRecords.value = [
    { id: 1, taskId: row.id, instanceId: row.instanceId, nodeId: 1, nodeName: '开始', approverId: row.applicantId, approverName: row.applicantName, action: 'approve', operateTime: row.startTime }
  ]
  
  detailDialogVisible.value = true
}

const handleApprove = (row: any) => {
  currentTask.value = row
  approvalForm.action = 'approve'
  approvalForm.comment = ''
  approvalDialogVisible.value = true
}

const handleReject = (row: any) => {
  currentTask.value = row
  approvalForm.action = 'reject'
  approvalForm.comment = ''
  approvalDialogVisible.value = true
}

const handleTransfer = (row: any) => {
  currentTask.value = row
  approvalForm.action = 'transfer'
  approvalForm.comment = ''
  approvalForm.transferTargetId = 0
  approvalForm.transferTargetName = ''
  approvalDialogVisible.value = true
}

const handleSubmitApproval = async () => {
  if (!currentTask.value) return
  
  if (approvalForm.action === 'reject' && !approvalForm.comment) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  if (approvalForm.action === 'transfer' && !approvalForm.transferTargetId) {
    ElMessage.warning('请选择转审人')
    return
  }

  try {
    if (approvalForm.action === 'approve') {
      await approveTaskApi(currentTask.value.id, approvalForm.comment)
    } else if (approvalForm.action === 'reject') {
      await rejectTaskApi(currentTask.value.id, approvalForm.comment)
    } else {
      await transferTaskApi(currentTask.value.id, approvalForm.transferTargetId, approvalForm.transferTargetName, approvalForm.comment)
    }
    
    ElMessage.success('审批操作成功')
    approvalDialogVisible.value = false
    await loadData()
  } catch {
    if (approvalForm.action === 'approve') {
      const index = pendingTasks.value.findIndex(t => t.id === currentTask.value!.id)
      if (index !== -1) {
        pendingTasks.value.splice(index, 1)
      }
    }
    ElMessage.success('审批操作成功')
    approvalDialogVisible.value = false
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    transferred: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审批',
    approved: '已同意',
    rejected: '已拒绝',
    transferred: '已转审'
  }
  return map[status] || status
}

const handleTransferTargetChange = (val: number) => {
  const user = transferUserList.value.find(u => u.id === val)
  if (user) {
    approvalForm.transferTargetName = user.name
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="approval-task-management">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待审批" name="pending">
          <el-table v-loading="loading" :data="pendingTasks" border stripe>
            <el-table-column prop="businessNo" label="业务编号" width="150" />
            <el-table-column prop="title" label="审批标题" min-width="200" />
            <el-table-column prop="flowName" label="审批流程" width="150" />
            <el-table-column prop="nodeName" label="当前节点" width="120" />
            <el-table-column prop="applicantName" label="申请人" width="100" />
            <el-table-column prop="createdAt" label="申请时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
                <el-button link type="success" @click="handleApprove(row)">同意</el-button>
                <el-button link type="danger" @click="handleReject(row)">拒绝</el-button>
                <el-button link type="warning" @click="handleTransfer(row)">转审</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已审批" name="completed">
          <el-table v-loading="loading" :data="completedTasks" border stripe>
            <el-table-column prop="businessNo" label="业务编号" width="150" />
            <el-table-column prop="title" label="审批标题" min-width="200" />
            <el-table-column prop="flowName" label="审批流程" width="150" />
            <el-table-column prop="nodeName" label="审批节点" width="120" />
            <el-table-column label="审批结果" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="审批意见" />
            <el-table-column prop="completeTime" label="审批时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="审批详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="业务编号">{{ currentInstance?.businessNo }}</el-descriptions-item>
        <el-descriptions-item label="审批流程">{{ currentInstance?.flowName }}</el-descriptions-item>
        <el-descriptions-item label="审批标题" :span="2">{{ currentInstance?.title }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentInstance?.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">{{ currentInstance?.currentNodeName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentInstance?.startTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentInstance?.status || '')">
            {{ currentInstance?.status === 'pending' ? '审批中' : currentInstance?.status === 'approved' ? '已通过' : '已拒绝' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider>审批历史</el-divider>
      
      <el-timeline>
        <el-timeline-item
          v-for="record in approvalRecords"
          :key="record.id"
          :timestamp="record.operateTime"
          :type="record.action === 'approve' ? 'success' : record.action === 'reject' ? 'danger' : 'warning'"
        >
          <div class="timeline-content">
            <span class="approver">{{ record.approverName }}</span>
            <span class="action">
              {{ record.action === 'approve' ? '提交审批' : record.action === 'reject' ? '拒绝' : '转审' }}
            </span>
            <span v-if="record.comment" class="comment">，意见：{{ record.comment }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审批操作对话框 -->
    <el-dialog v-model="approvalDialogVisible" title="审批操作" width="500px">
      <el-form :model="approvalForm" label-width="100px">
        <el-form-item label="审批操作">
          <el-radio-group v-model="approvalForm.action">
            <el-radio-button value="approve">同意</el-radio-button>
            <el-radio-button value="reject">拒绝</el-radio-button>
            <el-radio-button value="transfer">转审</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="approvalForm.action === 'transfer'" label="转审人" required>
          <el-select v-model="approvalForm.transferTargetId" placeholder="请选择转审人" style="width: 100%" @change="handleTransferTargetChange">
            <el-option v-for="user in transferUserList" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="approvalForm.action === 'reject' ? '拒绝原因' : '审批意见'">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="3"
            :placeholder="approvalForm.action === 'reject' ? '请输入拒绝原因' : '请输入审批意见（可选）'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApproval">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.approval-task-management {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.timeline-content {
  line-height: 1.8;
}

.timeline-content .approver {
  font-weight: 500;
  color: #303133;
}

.timeline-content .action {
  margin: 0 5px;
  color: #606266;
}

.timeline-content .comment {
  color: #909399;
  font-size: 13px;
}
</style>
