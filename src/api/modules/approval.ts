import request from '@/utils/request'
import type { ApprovalFlow, ApprovalNode, ApprovalInstance, ApprovalTask, ApprovalRecord, ApprovalForm } from '@/types/approval'

export interface ApprovalFlowListParams {
  page: number
  size: number
  keyword?: string
  flowType?: string
  status?: number
}

export interface ApprovalFlowListResponse {
  list: ApprovalFlow[]
  total: number
  page: number
  size: number
}

export function getApprovalFlowListApi(params: ApprovalFlowListParams) {
  return request<ApprovalFlowListResponse>({
    url: '/approval/flow/list',
    method: 'get',
    params
  })
}

export function getApprovalFlowDetailApi(id: number) {
  return request<ApprovalFlow>({
    url: `/approval/flow/${id}`,
    method: 'get'
  })
}

export function createApprovalFlowApi(data: Partial<ApprovalFlow>) {
  return request<ApprovalFlow>({
    url: '/approval/flow',
    method: 'post',
    data
  })
}

export function updateApprovalFlowApi(id: number, data: Partial<ApprovalFlow>) {
  return request<ApprovalFlow>({
    url: `/approval/flow/${id}`,
    method: 'put',
    data
  })
}

export function deleteApprovalFlowApi(id: number) {
  return request({
    url: `/approval/flow/${id}`,
    method: 'delete'
  })
}

export interface ApprovalTaskListParams {
  page: number
  size: number
  status?: string
}

export interface ApprovalTaskListResponse {
  pendingList: ApprovalTask[]
  completedList: ApprovalTask[]
  total: number
}

export function getApprovalTaskListApi(params: ApprovalTaskListParams) {
  return request<ApprovalTaskListResponse>({
    url: '/approval/task/list',
    method: 'get',
    params
  })
}

export function getPendingTasksApi() {
  return request<ApprovalTask[]>({
    url: '/approval/task/pending',
    method: 'get'
  })
}

export function getCompletedTasksApi() {
  return request<ApprovalTask[]>({
    url: '/approval/task/completed',
    method: 'get'
  })
}

export function getApprovalTaskDetailApi(taskId: number) {
  return request<{ task: ApprovalTask; instance: ApprovalInstance; records: ApprovalRecord[] }>({
    url: `/approval/task/${taskId}/detail`,
    method: 'get'
  })
}

export function submitApprovalApi(data: ApprovalForm) {
  return request({
    url: '/approval/task/submit',
    method: 'post',
    data
  })
}

export function approveTaskApi(taskId: number, comment?: string) {
  return request({
    url: `/approval/task/${taskId}/approve`,
    method: 'post',
    data: { comment }
  })
}

export function rejectTaskApi(taskId: number, comment: string) {
  return request({
    url: `/approval/task/${taskId}/reject`,
    method: 'post',
    data: { comment }
  })
}

export function transferTaskApi(taskId: number, targetUserId: number, targetUserName: string, comment?: string) {
  return request({
    url: `/approval/task/${taskId}/transfer`,
    method: 'post',
    data: { targetUserId, targetUserName, comment }
  })
}

export function getApprovalRecordsApi(instanceId: number) {
  return request<ApprovalRecord[]>({
    url: `/approval/instance/${instanceId}/records`,
    method: 'get'
  })
}

export function startApprovalProcessApi(flowId: number, businessId: number, businessType: string, title: string) {
  return request<ApprovalInstance>({
    url: '/approval/instance/start',
    method: 'post',
    data: { flowId, businessId, businessType, title }
  })
}

export function cancelApprovalInstanceApi(instanceId: number) {
  return request({
    url: `/approval/instance/${instanceId}/cancel`,
    method: 'post'
  })
}
