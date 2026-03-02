import request from '@/utils/request'
import type { Dashboard, Widget, DashboardStatistics } from '@/types/dashboard'

export interface DashboardListParams {
  page: number
  size: number
}

export interface DashboardListResponse {
  list: Dashboard[]
  total: number
  page: number
  size: number
}

export function getDashboardListApi(params: DashboardListParams) {
  return request<DashboardListResponse>({
    url: '/dashboard/list',
    method: 'get',
    params
  })
}

export function getDashboardDetailApi(id: number) {
  return request<Dashboard>({
    url: `/dashboard/${id}`,
    method: 'get'
  })
}

export function createDashboardApi(data: Partial<Dashboard>) {
  return request<Dashboard>({
    url: '/dashboard',
    method: 'post',
    data
  })
}

export function updateDashboardApi(id: number, data: Partial<Dashboard>) {
  return request<Dashboard>({
    url: `/dashboard/${id}`,
    method: 'put',
    data
  })
}

export function deleteDashboardApi(id: number) {
  return request({
    url: `/dashboard/${id}`,
    method: 'delete'
  })
}

export function getDashboardStatisticsApi(params?: { startDate?: string; endDate?: string }) {
  return request<DashboardStatistics>({
    url: '/dashboard/statistics',
    method: 'get',
    params
  })
}

export function addWidgetApi(dashboardId: number, widget: Widget) {
  return request({
    url: `/dashboard/${dashboardId}/widget`,
    method: 'post',
    data: widget
  })
}

export function updateWidgetApi(dashboardId: number, widgetId: number, widget: Widget) {
  return request({
    url: `/dashboard/${dashboardId}/widget/${widgetId}`,
    method: 'put',
    data: widget
  })
}

export function deleteWidgetApi(dashboardId: number, widgetId: number) {
  return request({
    url: `/dashboard/${dashboardId}/widget/${widgetId}`,
    method: 'delete'
  })
}

export function exportDashboardApi(dashboardId: number, format: 'pdf' | 'png') {
  return request({
    url: `/dashboard/${dashboardId}/export`,
    method: 'get',
    params: { format },
    responseType: 'blob'
  })
}
