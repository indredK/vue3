import { useNotificationStore } from '@/stores/notification'
import type { NotificationType } from '@/types/notification'

class NotificationService {
  private store = useNotificationStore()

  async sendApprovalNotification(
    orderId: number,
    orderNo: string,
    action: 'approve' | 'reject' | 'submit',
    operatorName: string,
    comment?: string
  ) {
    const preferences = this.store.preferences
    if (!preferences.approvalNotify) return

    const titles: Record<string, string> = {
      submit: '新的采购订单待审批',
      approve: '订单已通过审批',
      reject: '订单已被拒绝'
    }

    const contents: Record<string, string> = {
      submit: `您有一个新的${orderNo}订单需要审批`,
      approve: `您的订单 ${orderNo} 已通过审批${comment ? `，审批意见：${comment}` : ''}`,
      reject: `您的订单 ${orderNo} 已被拒绝${comment ? `，拒绝原因：${comment}` : ''}`
    }

    const notification = {
      userId: 1,
      type: 'approval' as NotificationType,
      title: titles[action],
      content: contents[action],
      relatedId: orderId,
      relatedType: 'order',
      relatedUrl: '/order',
      senderName: operatorName,
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    await this.sendNotification(notification, preferences)
  }

  async sendRuleNotification(
    ruleId: number,
    ruleName: string,
    result: 'success' | 'failed' | 'warning',
    details: string
  ) {
    const preferences = this.store.preferences
    if (!preferences.ruleNotify) return

    const titles: Record<string, string> = {
      success: '规则执行成功',
      failed: '规则执行失败',
      warning: '规则执行警告'
    }

    const notification = {
      userId: 1,
      type: 'rule' as NotificationType,
      title: titles[result],
      content: `${ruleName}执行${titles[result]}：${details}`,
      relatedId: ruleId,
      relatedType: 'rule',
      relatedUrl: '/rule',
      senderName: '系统',
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    await this.sendNotification(notification, preferences)
  }

  async sendSystemNotification(
    title: string,
    content: string,
    relatedUrl?: string
  ) {
    const preferences = this.store.preferences
    if (!preferences.systemNotify) return

    const notification = {
      userId: 1,
      type: 'system' as NotificationType,
      title,
      content,
      relatedUrl,
      senderName: '系统',
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    await this.sendNotification(notification, preferences)
  }

  async sendAnnouncement(
    title: string,
    content: string,
    targetUserIds?: number[]
  ) {
    const preferences = this.store.preferences
    if (!preferences.announcementNotify) return

    const notification = {
      userId: targetUserIds?.[0] || 1,
      type: 'announcement' as NotificationType,
      title,
      content,
      senderName: '系统',
      isRead: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }

    await this.sendNotification(notification, preferences)
  }

  private async sendNotification(
    notification: any,
    preferences: any
  ) {
    const newNotification = {
      ...notification,
      id: Date.now()
    }

    this.store.notifications.unshift(newNotification)
    this.store.fetchStats()

    if (preferences.emailEnabled) {
      console.log('[Email Notification]', notification)
    }

    if (preferences.smsEnabled) {
      console.log('[SMS Notification]', notification)
    }
  }
}

export const notificationService = new NotificationService()
