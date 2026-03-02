export interface ApprovalFlow {
  id: number
  name: string
  code: string
  description?: string
  flowType: string
  flowTypeName: string
  nodes: ApprovalNode[]
  status: number
  createdAt: string
  updatedAt?: string
}

export interface ApprovalNode {
  id: number
  flowId: number
  name: string
  nodeType: 'start' | 'approval' | 'condition' | 'end'
  approvalType: 'single' | 'multiple' | 'sequential' | 'parallel'
  approvers: Approver[]
  conditions?: Condition[]
  sort: number
  nextNodeIds?: number[]
}

export interface Approver {
  id: number
  type: 'user' | 'role' | 'department' | 'leader'
  targetId: number
  targetName: string
}

export interface Condition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'in' | 'like'
  value: any
}

export interface ApprovalInstance {
  id: number
  flowId: number
  flowName: string
  businessId: number
  businessType: string
  businessNo: string
  title: string
  applicantId: number
  applicantName: string
  currentNodeId: number
  currentNodeName: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  startTime: string
  endTime?: string
  createdAt: string
}

export interface ApprovalTask {
  id: number
  instanceId: number
  nodeId: number
  nodeName: string
  assigneeId: number
  assigneeName: string
  status: 'pending' | 'approved' | 'rejected' | 'transferred'
  comment?: string
  assigneeTime?: string
  completeTime?: string
  createdAt: string
}

export interface ApprovalRecord {
  id: number
  taskId: number
  instanceId: number
  nodeId: number
  nodeName: string
  approverId: number
  approverName: string
  action: 'approve' | 'reject' | 'transfer'
  comment?: string
  assigneeName?: string
  operateTime: string
}

export interface ApprovalForm {
  taskId: number
  action: 'approve' | 'reject' | 'transfer'
  comment?: string
  transferTargetId?: number
  transferTargetName?: string
}

export const FLOW_TYPES = [
  { label: '采购审批', value: 'purchase' },
  { label: '租赁审批', value: 'rental' },
  { label: '维修审批', value: 'maintenance' },
  { label: '报废审批', value: 'retired' }
]

export const NODE_TYPES = [
  { label: '开始', value: 'start' },
  { label: '审批', value: 'approval' },
  { label: '条件', value: 'condition' },
  { label: '结束', value: 'end' }
]

export const APPROVAL_TYPES = [
  { label: '单人审批', value: 'single' },
  { label: '多人审批', value: 'multiple' },
  { label: '顺序审批', value: 'sequential' },
  { label: '并行审批', value: 'parallel' }
]

export const APPROVER_TYPES = [
  { label: '指定用户', value: 'user' },
  { label: '指定角色', value: 'role' },
  { label: '部门负责人', value: 'department' },
  { label: '上级领导', value: 'leader' }
]
