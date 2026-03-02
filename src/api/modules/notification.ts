import request from '@/utils/request'
import type { Notification, NotificationDetail, NotificationPreferences, NotificationStats } from '@/types/notification'

export interface NotificationListParams {
  page: number
  size: number
  type?: string
  isRead?: boolean
  keyword?: string
}

export interface NotificationListResponse {
  list: Notification[]
  total: number
  page: number
  size: number
}

export function getNotificationListApi(params: NotificationListParams) {
  return request<NotificationListResponse>({
    url: '/notification/list',
    method: 'get',
    params
  })
}

export function getNotificationDetailApi(id: number) {
  return request<NotificationDetail>({
    url: `/notification/${id}`,
    method: 'get'
  })
}

export function markAsReadApi(id: number) {
  return request({
    url: `/notification/${id}/read`,
    method: 'put'
  })
}

export function markAllAsReadApi() {
  return request({
    url: '/notification/read-all',
    method: 'put'
  })
}

export function deleteNotificationApi(id: number) {
  return request({
    url: `/notification/${id}`,
    method: 'delete'
  })
}

export function getNotificationStatsApi() {
  return request<NotificationStats>({
    url: '/notification/stats',
    method: 'get'
  })
}

export function getNotificationPreferencesApi() {
  return request<NotificationPreferences>({
    url: '/notification/preferences',
    method: 'get'
  })
}

export function updateNotificationPreferencesApi(data: Partial<NotificationPreferences>) {
  return request({
    url: '/notification/preferences',
    method: 'put',
    data
  })
}

export function sendNotificationApi(data: {
  userIds: number[]
  type: string
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  relatedUrl?: string
}) {
  return request({
    url: '/notification/send',
    method: 'post',
    data
  })
}
