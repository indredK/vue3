<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNotificationStore } from '@/stores/notification'
import type { Notification, NotificationType, NotificationPreferences } from '@/types/notification'
import { NOTIFICATION_TYPES } from '@/types/notification'

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()

const searchForm = reactive({
  type: '' as NotificationType | '',
  isRead: '' as boolean | '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loading = ref(false)
const detailDialogVisible = ref(false)
const preferencesDialogVisible = ref(false)
const currentNotification = ref<Notification | null>(null)

const preferencesForm = reactive<NotificationPreferences>({
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

const filteredNotifications = computed(() => {
  let result = notificationStore.notifications

  if (searchForm.type) {
    result = result.filter(n => n.type === searchForm.type)
  }
  if (searchForm.isRead !== '') {
    result = result.filter(n => n.isRead === searchForm.isRead)
  }
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(n =>
      n.title.toLowerCase().includes(keyword) ||
      n.content.toLowerCase().includes(keyword)
    )
  }

  return result
})

const paginatedNotifications = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  const end = start + pagination.size
  pagination.total = filteredNotifications.value.length
  return filteredNotifications.value.slice(start, end)
})

const loadNotifications = async () => {
  loading.value = true
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.isRead = ''
  searchForm.keyword = ''
  pagination.page = 1
}

const handleViewDetail = (row: Notification) => {
  currentNotification.value = row
  detailDialogVisible.value = true

  if (!row.isRead) {
    handleMarkAsRead(row.id)
  }
}

const handleMarkAsRead = async (id: number) => {
  await notificationStore.markAsRead(id)
  ElMessage.success('标记已读成功')
}

const handleMarkAllAsRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有消息标记为已读吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await notificationStore.markAllAsRead()
    ElMessage.success('全部已读成功')
  } catch {
    console.log('Cancelled')
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await notificationStore.deleteNotification(id)
    ElMessage.success('删除成功')
  } catch {
    console.log('Cancelled')
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
}

const handleRelatedClick = (row: Notification) => {
  if (row.relatedUrl) {
    router.push(row.relatedUrl)
    detailDialogVisible.value = false
  }
}

const getTypeIcon = (type: NotificationType) => {
  const iconMap: Record<NotificationType, string> = {
    approval: 'el-icon-Check',
    rule: 'el-icon-Cpu',
    system: 'el-icon-Bell',
    announcement: 'el-icon-Megaphone'
  }
  return iconMap[type] || 'el-icon-Bell'
}

const getTypeColor = (type: NotificationType) => {
  const colorMap: Record<NotificationType, string> = {
    approval: '#409eff',
    rule: '#67c23a',
    system: '#e6a23c',
    announcement: '#909399'
  }
  return colorMap[type] || '#909399'
}

const getTypeLabel = (type: NotificationType) => {
  return NOTIFICATION_TYPES.find(t => t.value === type)?.label || type
}

const formatTime = (time: string) => {
  const now = new Date()
  const date = new Date(time)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time
}

const handleOpenPreferences = () => {
  Object.assign(preferencesForm, notificationStore.preferences)
  preferencesDialogVisible.value = true
}

const handleSavePreferences = async () => {
  await notificationStore.updatePreferences(preferencesForm)
  ElMessage.success('偏好设置保存成功')
  preferencesDialogVisible.value = false
}

onMounted(() => {
  loadNotifications()
  notificationStore.fetchStats()
  notificationStore.fetchPreferences()
})
</script>

<template>
  <div class="notification-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><Bell /></el-icon>
            <div class="stat-value">{{ notificationStore.stats.totalCount }}</div>
            <div class="stat-label">消息总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><Message /></el-icon>
            <div class="stat-value">{{ notificationStore.stats.unreadCount }}</div>
            <div class="stat-label">未读消息</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><Check /></el-icon>
            <div class="stat-value">{{ notificationStore.stats.approvalCount }}</div>
            <div class="stat-label">审批通知</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#e6a23c"><Cpu /></el-icon>
            <div class="stat-value">{{ notificationStore.stats.ruleCount }}</div>
            <div class="stat-label">规则通知</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="search-card" style="margin-top: 20px">
      <el-form :model="searchForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="消息类型">
              <el-select v-model="searchForm.type" placeholder="请选择" clearable>
                <el-option
                  v-for="item in NOTIFICATION_TYPES"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="阅读状态">
              <el-select v-model="searchForm.isRead" placeholder="请选择" clearable>
                <el-option label="未读" :value="false" />
                <el-option label="已读" :value="true" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="标题/内容关键词"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="table-card" style="margin-top: 20px">
      <div class="table-header">
        <div class="table-title">消息列表</div>
        <div class="table-actions">
          <el-button type="primary" size="small" @click="handleOpenPreferences">
            偏好设置
          </el-button>
          <el-button type="primary" size="small" @click="handleMarkAllAsRead">
            全部标记为已读
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="paginatedNotifications"
        style="width: 100%"
        @row-click="handleViewDetail"
      >
        <el-table-column width="50">
          <template #default="{ row }">
            <div v-if="!row.isRead" class="unread-dot" />
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :color="getTypeColor(row.type)" effect="dark" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="senderName" label="发送人" width="120" />
        <el-table-column prop="createdAt" label="发送时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isRead"
              type="primary"
              link
              @click.stop="handleMarkAsRead(row.id)"
            >
              已读
            </el-button>
            <el-button
              type="danger"
              link
              @click.stop="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      title="消息详情"
      width="600px"
    >
      <div v-if="currentNotification">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="类型">
            <el-tag :color="getTypeColor(currentNotification.type)" effect="dark" size="small">
              {{ getTypeLabel(currentNotification.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标题">{{ currentNotification.title }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ currentNotification.content }}</el-descriptions-item>
          <el-descriptions-item label="发送人">
            {{ currentNotification.senderName || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ currentNotification.createdAt }}</el-descriptions-item>
          <el-descriptions-item v-if="currentNotification.readAt" label="阅读时间">
            {{ currentNotification.readAt }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentNotification.relatedUrl" style="margin-top: 20px">
          <el-button type="primary" @click="handleRelatedClick(currentNotification!)">
            查看详情
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="preferencesDialogVisible"
      title="通知偏好设置"
      width="500px"
    >
      <el-form :model="preferencesForm" label-width="120px">
        <el-divider content-position="left">通知方式</el-divider>
        <el-form-item label="站内消息">
          <el-switch v-model="preferencesForm.inAppEnabled" />
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="preferencesForm.emailEnabled" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="preferencesForm.smsEnabled" />
        </el-form-item>
        <el-divider content-position="left">通知类型</el-divider>
        <el-form-item label="审批通知">
          <el-switch v-model="preferencesForm.approvalNotify" />
        </el-form-item>
        <el-form-item label="规则通知">
          <el-switch v-model="preferencesForm.ruleNotify" />
        </el-form-item>
        <el-form-item label="系统通知">
          <el-switch v-model="preferencesForm.systemNotify" />
        </el-form-item>
        <el-form-item label="系统公告">
          <el-switch v-model="preferencesForm.announcementNotify" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="preferencesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePreferences">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.notification-container {
  padding: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
}
</style>
