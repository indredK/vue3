import { get, put, del } from '@/api/axios'
import type { PageResult, PageParams } from '@/types/common'

export interface Notification {
  id: number
  type: 'approval' | 'rule' | 'system' | 'announcement'
  title: string
  content: string
  senderId?: number
  senderName?: string
  receiverId: number
  isRead: boolean
  readAt?: string
  extraData?: Record<string, any>
  createdAt: string
}

export interface NotificationQueryParams extends PageParams {
  type?: string
  isRead?: boolean
}

export interface NotificationPreference {
  id: number
  userId: number
  types: {
    approval: { enabled: boolean; methods: string[] }
    rule: { enabled: boolean; methods: string[] }
    system: { enabled: boolean; methods: string[] }
    announcement: { enabled: boolean; methods: string[] }
  }
}

export function getNotificationList(params: NotificationQueryParams) {
  return get<PageResult<Notification>>('/notification/list', params)
}

export function getNotificationDetail(id: number) {
  return get<Notification>(`/notification/${id}`)
}

export function getUnreadCount() {
  return get<{ count: number }>('/notification/unread/count')
}

export function markAsRead(id: number) {
  return put<void>(`/notification/${id}/read`)
}

export function markAllAsRead() {
  return put<void>('/notification/read/all')
}

export function deleteNotification(id: number) {
  return del<void>(`/notification/${id}`)
}

export function getNotificationPreference() {
  return get<NotificationPreference>('/notification/preference')
}

export function updateNotificationPreference(preference: Partial<NotificationPreference>) {
  return put<NotificationPreference>('/notification/preference', preference)
}
