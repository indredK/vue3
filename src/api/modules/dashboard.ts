import { get, post, del, put } from '@/api/axios'
import type { PageResult, PageParams } from '@/types/common'

export interface Dashboard {
  id: number
  name: string
  description?: string
  layout: Widget[]
  status: number
  createdBy?: number
  createdAt: string
  updatedAt?: string
}

export interface Widget {
  id: string
  type: 'card' | 'line' | 'bar' | 'pie' | 'table'
  title: string
  x: number
  y: number
  w: number
  h: number
  config: WidgetConfig
}

export interface WidgetConfig {
  dataSource?: string
  query?: Record<string, any>
  chartType?: string
  colors?: string[]
  showTitle?: boolean
  refreshInterval?: number
}

export interface DashboardQueryParams extends PageParams {
  keyword?: string
  status?: number
}

export function getDashboardList(params: DashboardQueryParams) {
  return get<PageResult<Dashboard>>('/dashboard/list', params)
}

export function getDashboardDetail(id: number) {
  return get<Dashboard>(`/dashboard/${id}`)
}

export function createDashboard(data: Partial<Dashboard>) {
  return post<Dashboard>('/dashboard', data)
}

export function updateDashboard(data: Partial<Dashboard>) {
  return put<Dashboard>(`/dashboard/${data.id}`, data)
}

export function deleteDashboard(id: number) {
  return del<void>(`/dashboard/${id}`)
}

export function getWidgetData(widgetId: string, config: WidgetConfig) {
  return get<any>(`/dashboard/widget/${widgetId}/data`, config)
}
