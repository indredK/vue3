import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification, NotificationPreferences, NotificationStats } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const stats = ref<NotificationStats>({
    totalCount: 0,
    unreadCount: 0,
    approvalCount: 0,
    ruleCount: 0,
    systemCount: 0,
    announcementCount: 0
  })
  const preferences = ref<NotificationPreferences>({
    id: 0,
    userId: 0,
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    approvalNotify: true,
    ruleNotify: true,
    systemNotify: true,
    announcementNotify: true,
    updatedAt: ''
  })
  const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null)

  const mockNotifications: Notification[] = [
    {
      id: 1,
      userId: 1,
      type: 'approval',
      title: '新的采购订单待审批',
      content: '您有一个新的采购订单需要审批，订单金额：¥50,000',
      relatedId: 101,
      relatedType: 'order',
      relatedUrl: '/order',
      senderId: 2,
      senderName: '操作员1',
      isRead: false,
      createdAt: '2024-01-15 14:30:25'
    },
    {
      id: 2,
      userId: 1,
      type: 'rule',
      title: '规则执行成功',
      content: '资产折旧计算规则已成功执行，处理资产 15 台',
      relatedId: 5,
      relatedType: 'rule',
      relatedUrl: '/rule',
      senderId: 0,
      senderName: '系统',
      isRead: false,
      createdAt: '2024-01-15 12:00:00'
    },
    {
      id: 3,
      userId: 1,
      type: 'system',
      title: '系统维护通知',
      content: '系统将于今晚 22:00-24:00 进行例行维护，届时部分功能可能不可用',
      isRead: true,
      readAt: '2024-01-15 10:00:00',
      createdAt: '2024-01-15 09:00:00'
    },
    {
      id: 4,
      userId: 1,
      type: 'announcement',
      title: '平台功能更新公告',
      content: '平台已上线新功能：规则引擎可视化配置，欢迎体验！',
      isRead: true,
      readAt: '2024-01-14 16:00:00',
      createdAt: '2024-01-14 15:00:00'
    },
    {
      id: 5,
      userId: 1,
      type: 'approval',
      title: '订单已通过审批',
      content: '您的订单 PO20240110003 已通过审批',
      relatedId: 103,
      relatedType: 'order',
      relatedUrl: '/order',
      senderId: 1,
      senderName: '管理员',
      isRead: false,
      createdAt: '2024-01-15 11:20:15'
    }
  ]

  async function fetchNotifications() {
    try {
      notifications.value = mockNotifications
      updateStats()
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  async function fetchStats() {
    updateStats()
  }

  function updateStats() {
    const unread = notifications.value.filter(n => !n.isRead)
    unreadCount.value = unread.length

    stats.value = {
      totalCount: notifications.value.length,
      unreadCount: unread.length,
      approvalCount: notifications.value.filter(n => n.type === 'approval').length,
      ruleCount: notifications.value.filter(n => n.type === 'rule').length,
      systemCount: notifications.value.filter(n => n.type === 'system').length,
      announcementCount: notifications.value.filter(n => n.type === 'announcement').length
    }
  }

  async function markAsRead(id: number) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
      notification.readAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      updateStats()
    }
  }

  async function markAllAsRead() {
    notifications.value.forEach(n => {
      n.isRead = true
      n.readAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    })
    updateStats()
  }

  async function deleteNotification(id: number) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      updateStats()
    }
  }

  async function fetchPreferences() {
    try {
      preferences.value = {
        id: 1,
        userId: 1,
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        approvalNotify: true,
        ruleNotify: true,
        systemNotify: true,
        announcementNotify: true,
        updatedAt: '2024-01-01 00:00:00'
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  async function updatePreferences(data: Partial<NotificationPreferences>) {
    try {
      Object.assign(preferences.value, data)
    } catch (error) {
      console.error('Failed to update preferences:', error)
    }
  }

  function startPolling(interval = 30000) {
    stopPolling()
    pollingTimer.value = setInterval(() => {
      fetchNotifications()
    }, interval)
  }

  function stopPolling() {
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
  }

  return {
    notifications,
    unreadCount,
    stats,
    preferences,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchPreferences,
    updatePreferences,
    startPolling,
    stopPolling
  }
})
