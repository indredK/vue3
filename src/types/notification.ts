export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  relatedUrl?: string
  senderId?: number
  senderName?: string
  senderAvatar?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export type NotificationType = 'approval' | 'rule' | 'system' | 'announcement'

export interface NotificationDetail {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  relatedType?: string
  relatedUrl?: string
  senderId?: number
  senderName?: string
  senderAvatar?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  attachments?: NotificationAttachment[]
}

export interface NotificationAttachment {
  id: number
  name: string
  url: string
  size: number
  type: string
}

export interface NotificationPreferences {
  id: number
  userId: number
  emailEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
  approvalNotify: boolean
  ruleNotify: boolean
  systemNotify: boolean
  announcementNotify: boolean
  updatedAt: string
}

export interface NotificationStats {
  totalCount: number
  unreadCount: number
  approvalCount: number
  ruleCount: number
  systemCount: number
  announcementCount: number
}

export const NOTIFICATION_TYPES = [
  { label: '审批通知', value: 'approval', icon: 'el-icon-Check' },
  { label: '规则通知', value: 'rule', icon: 'el-icon-Cpu' },
  { label: '系统通知', value: 'system', icon: 'el-icon-Bell' },
  { label: '系统公告', value: 'announcement', icon: 'el-icon-Megaphone' }
]

export const NOTIFICATION_STATUS = [
  { label: '未读', value: false },
  { label: '已读', value: true }
]
