import { get, post, del, put } from '@/api/axios'
import type { PageResult, PageParams } from '@/types/common'

export interface ApprovalFlow {
  id: number
  name: string
  code: string
  description?: string
  type: string
  nodes: ApprovalNode[]
  status: number
  createdAt: string
  updatedAt?: string
}

export interface ApprovalNode {
  id: number
  flowId: number
  name: string
  type: 'start' | 'approver' | 'condition' | 'end'
  nodeType: 'serial' | 'parallel'
  approvers: Approver[]
  conditions?: ApprovalCondition[]
  sort: number
}

export interface Approver {
  id: number
  type: 'user' | 'role' | 'department'
  value: number
  name: string
}

export interface ApprovalCondition {
  field: string
  operator: string
  value: any
}

export interface ApprovalTask {
  id: number
  flowId: number
  flowName: string
  instanceId: number
  businessId: number
  businessType: string
  nodeId: number
  nodeName: string
  status: number
  assigneeId?: number
  assigneeName?: string
  createdAt: string
  completedAt?: string
}

export interface ApprovalRecord {
  id: number
  taskId: number
  nodeId: number
  nodeName: string
  approverId: number
  approverName: string
  action: 'approve' | 'reject' | 'transfer'
  comment?: string
  status: number
  createdAt: string
}

export interface ApprovalParams {
  action: 'approve' | 'reject' | 'transfer'
  comment?: string
  transferToId?: number
}

export function getFlowList(params?: PageParams) {
  return get<PageResult<ApprovalFlow>>('/approval/flow/list', params)
}

export function getFlowDetail(id: number) {
  return get<ApprovalFlow>(`/approval/flow/${id}`)
}

export function createFlow(data: Partial<ApprovalFlow>) {
  return post<ApprovalFlow>('/approval/flow', data)
}

export function updateFlow(data: Partial<ApprovalFlow>) {
  return put<ApprovalFlow>(`/approval/flow/${data.id}`, data)
}

export function deleteFlow(id: number) {
  return del<void>(`/approval/flow/${id}`)
}

export function getTaskList(params?: { status?: number; type?: string }) {
  return get<PageResult<ApprovalTask>>('/approval/task/list', params)
}

export function getPendingTasks() {
  return get<ApprovalTask[]>('/approval/task/pending')
}

export function getTaskDetail(id: number) {
  return get<ApprovalTask>(`/approval/task/${id}`)
}

export function approveTask(taskId: number, params: ApprovalParams) {
  return post<void>(`/approval/task/${taskId}/approve`, params)
}

export function getApprovalRecords(businessId: number, businessType: string) {
  return get<ApprovalRecord[]>(`/approval/record/${businessType}/${businessId}`)
}

export function submitForApproval(businessId: number, businessType: string, flowId: number) {
  return post<void>('/approval/submit', { businessId, businessType, flowId })
}
