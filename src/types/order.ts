export interface Order {
  id: number
  orderNo: string
  orderType: string
  orderTypeName: string
  customerId: number
  customerName: string
  contactPhone: string
  contactEmail: string
  totalAmount: number
  discountAmount: number
  actualAmount: number
  status: string
  statusName: string
  items: OrderItem[]
  attachments: Attachment[]
  remarks: Remark[]
  relatedAssets: RelatedAsset[]
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  startTime?: string
  endTime?: string
}

export interface OrderItem {
  id: number
  assetId: number
  assetCode: string
  assetName: string
  quantity: number
  unitPrice: number
  discount: number
  amount: number
}

export interface Attachment {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
}

export interface Remark {
  id: number
  content: string
  createdBy: string
  createdAt: string
}

export interface RelatedAsset {
  assetId: number
  assetCode: string
  assetName: string
  status: string
  statusName: string
}

export interface OrderForm {
  id?: number
  orderType: string
  customerId: number
  customerName: string
  contactPhone: string
  contactEmail: string
  totalAmount: number
  discountAmount: number
  actualAmount: number
  status: string
  items: OrderItem[]
  startTime?: string
  endTime?: string
}

export interface OrderStatistics {
  totalCount: number
  totalAmount: number
  pendingCount: number
  processingCount: number
  completedCount: number
  cancelledCount: number
  statusDistribution: { status: string; count: number; amount: number }[]
  dailyTrend: { date: string; count: number; amount: number }[]
}

export interface OrderStatusTransition {
  fromStatus: string
  toStatus: string
  action: string
  updateAssetStatus?: string
  condition?: string
}

export const ORDER_STATUS_TRANSITIONS: OrderStatusTransition[] = [
  { fromStatus: 'pending', toStatus: 'processing', action: '开始处理' },
  { fromStatus: 'pending', toStatus: 'cancelled', action: '取消订单', condition: '可取消' },
  { fromStatus: 'processing', toStatus: 'completed', action: '完成订单' },
  { fromStatus: 'processing', toStatus: 'cancelled', action: '取消订单', condition: '可取消' },
  { fromStatus: 'completed', toStatus: 'processing', action: '重新打开' }
]

export const ORDER_TYPES = [
  { label: '采购订单', value: 'purchase' },
  { label: '租赁订单', value: 'rental' },
  { label: '维修订单', value: 'maintenance' },
  { label: '报废订单', value: 'retired' }
]

export const ORDER_STATUSES = [
  { label: '待处理', value: 'pending', color: 'info' },
  { label: '处理中', value: 'processing', color: 'warning' },
  { label: '已完成', value: 'completed', color: 'success' },
  { label: '已取消', value: 'cancelled', color: 'danger' }
]
