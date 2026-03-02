<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrderListApi,
  getOrderDetailApi,
  createOrderApi,
  updateOrderApi,
  deleteOrderApi,
  updateOrderStatusApi,
  addOrderAttachmentApi,
  deleteOrderAttachmentApi,
  addOrderRemarkApi,
  deleteOrderRemarkApi,
  getOrderStatisticsApi
} from '@/api/modules/order'
import type { Order, OrderForm, OrderItem, Attachment, Remark, OrderStatistics } from '@/types/order'
import { ORDER_TYPES, ORDER_STATUSES, ORDER_STATUS_TRANSITIONS } from '@/types/order'

const { t } = useI18n()

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  orderType: '',
  status: '',
  customerName: '',
  startDate: '',
  endDate: ''
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 表格数据
const tableData = ref<Order[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'create' | 'edit' | 'view'>('create')

// 表单数据
const formData = reactive<OrderForm>({
  orderType: 'purchase',
  customerId: 0,
  customerName: '',
  contactPhone: '',
  contactEmail: '',
  totalAmount: 0,
  discountAmount: 0,
  actualAmount: 0,
  status: 'pending',
  items: []
})

// 当前操作的订单
const currentOrder = ref<Order | null>(null)

// 订单项
const orderItems = ref<OrderItem[]>([])

// 备注和附件
const remarks = ref<Remark[]>([])
const attachments = ref<Attachment[]>([])
const newRemark = ref('')

// 统计
const statistics = ref<OrderStatistics>({
  totalCount: 0,
  totalAmount: 0,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 0,
  cancelledCount: 0,
  statusDistribution: [],
  dailyTrend: []
})

// 可用的状态转换
const availableTransitions = computed(() => {
  if (!currentOrder.value) return []
  return ORDER_STATUS_TRANSITIONS.filter(t => t.fromStatus === currentOrder.value?.status)
})

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true
  try {
    const mockOrders: Order[] = [
      {
        id: 1,
        orderNo: 'ORD202401150001',
        orderType: 'purchase',
        orderTypeName: '采购订单',
        customerId: 1,
        customerName: '张三',
        contactPhone: '13800138000',
        contactEmail: 'zhangsan@example.com',
        totalAmount: 15000,
        discountAmount: 500,
        actualAmount: 14500,
        status: 'completed',
        statusName: '已完成',
        items: [
          { id: 1, assetId: 1, assetCode: 'AST001', assetName: '办公电脑 Dell XPS 15', quantity: 1, unitPrice: 12000, discount: 0, amount: 12000 },
          { id: 2, assetId: 2, assetCode: 'AST002', assetName: '显示器 Samsung 27寸', quantity: 2, unitPrice: 1500, discount: 500, amount: 2500 }
        ],
        attachments: [],
        remarks: [],
        relatedAssets: [],
        createdBy: 'admin',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-16 15:20:00'
      },
      {
        id: 2,
        orderNo: 'ORD202401150002',
        orderType: 'rental',
        orderTypeName: '租赁订单',
        customerId: 2,
        customerName: '李四',
        contactPhone: '13800138001',
        contactEmail: 'lisi@example.com',
        totalAmount: 5000,
        discountAmount: 0,
        actualAmount: 5000,
        status: 'processing',
        statusName: '处理中',
        items: [
          { id: 3, assetId: 3, assetCode: 'DEV001', assetName: '投影仪 Epson', quantity: 1, unitPrice: 5000, discount: 0, amount: 5000 }
        ],
        attachments: [],
        remarks: [],
        relatedAssets: [],
        createdBy: 'admin',
        createdAt: '2024-01-15 14:25:00'
      },
      {
        id: 3,
        orderNo: 'ORD202401160001',
        orderType: 'maintenance',
        orderTypeName: '维修订单',
        customerId: 3,
        customerName: '王五',
        contactPhone: '13800138002',
        contactEmail: 'wangwu@example.com',
        totalAmount: 800,
        discountAmount: 0,
        actualAmount: 800,
        status: 'pending',
        statusName: '待处理',
        items: [
          { id: 4, assetId: 4, assetCode: 'DEV002', assetName: '打印机 HP LaserJet', quantity: 1, unitPrice: 800, discount: 0, amount: 800 }
        ],
        attachments: [],
        remarks: [],
        relatedAssets: [],
        createdBy: 'admin',
        createdAt: '2024-01-16 09:15:00'
      },
      {
        id: 4,
        orderNo: 'ORD202401160002',
        orderType: 'purchase',
        orderTypeName: '采购订单',
        customerId: 4,
        customerName: '赵六',
        contactPhone: '13800138003',
        contactEmail: 'zhaoliu@example.com',
        totalAmount: 25000,
        discountAmount: 2000,
        actualAmount: 23000,
        status: 'cancelled',
        statusName: '已取消',
        items: [
          { id: 5, assetId: 5, assetCode: 'AST003', assetName: '服务器 Dell PowerEdge', quantity: 1, unitPrice: 25000, discount: 2000, amount: 23000 }
        ],
        attachments: [],
        remarks: [{ id: 1, content: '客户要求取消订单', createdBy: 'admin', createdAt: '2024-01-16 14:00:00' }],
        relatedAssets: [],
        createdBy: 'admin',
        createdAt: '2024-01-16 11:30:00'
      },
      {
        id: 5,
        orderNo: 'ORD202401170001',
        orderType: 'rental',
        orderTypeName: '租赁订单',
        customerId: 5,
        customerName: '钱七',
        contactPhone: '13800138004',
        contactEmail: 'qianqi@example.com',
        totalAmount: 3000,
        discountAmount: 0,
        actualAmount: 3000,
        status: 'completed',
        statusName: '已完成',
        items: [
          { id: 6, assetId: 6, assetCode: 'AST004', assetName: '会议麦克风', quantity: 2, unitPrice: 1500, discount: 0, amount: 3000 }
        ],
        attachments: [
          { id: 1, fileName: '合同.pdf', fileSize: 1024000, fileType: 'application/pdf', fileUrl: '#', uploadedBy: 'admin', uploadedAt: '2024-01-17 10:00:00' }
        ],
        remarks: [],
        relatedAssets: [],
        createdBy: 'admin',
        createdAt: '2024-01-17 10:00:00',
        updatedAt: '2024-01-18 16:30:00'
      }
    ]
    
    tableData.value = mockOrders
    pagination.total = mockOrders.length
    
    updateStatistics()
  } catch (error) {
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = () => {
  statistics.value = {
    totalCount: tableData.value.length,
    totalAmount: tableData.value.reduce((sum, o) => sum + o.actualAmount, 0),
    pendingCount: tableData.value.filter(o => o.status === 'pending').length,
    processingCount: tableData.value.filter(o => o.status === 'processing').length,
    completedCount: tableData.value.filter(o => o.status === 'completed').length,
    cancelledCount: tableData.value.filter(o => o.status === 'cancelled').length,
    statusDistribution: [
      { status: 'pending', count: tableData.value.filter(o => o.status === 'pending').length, amount: 0 },
      { status: 'processing', count: tableData.value.filter(o => o.status === 'processing').length, amount: 0 },
      { status: 'completed', count: tableData.value.filter(o => o.status === 'completed').length, amount: 0 },
      { status: 'cancelled', count: tableData.value.filter(o => o.status === 'cancelled').length, amount: 0 }
    ],
    dailyTrend: []
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadOrderList()
}

// 重置
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.orderType = ''
  searchForm.status = ''
  searchForm.customerName = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  dateRange.value = null
  handleSearch()
}

// 日期范围变化处理
const handleDateRangeChange = (val: [string, string] | null) => {
  if (val) {
    searchForm.startDate = val[0]
    searchForm.endDate = val[1]
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '创建订单'
  dialogMode.value = 'create'
  Object.assign(formData, {
    orderType: 'purchase',
    customerId: 0,
    customerName: '',
    contactPhone: '',
    contactEmail: '',
    totalAmount: 0,
    discountAmount: 0,
    actualAmount: 0,
    status: 'pending',
    items: []
  })
  orderItems.value = []
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Order) => {
  dialogTitle.value = '编辑订单'
  dialogMode.value = 'edit'
  Object.assign(formData, {
    id: row.id,
    orderType: row.orderType,
    customerId: row.customerId,
    customerName: row.customerName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    totalAmount: row.totalAmount,
    discountAmount: row.discountAmount,
    actualAmount: row.actualAmount,
    status: row.status,
    items: [...row.items]
  })
  orderItems.value = [...row.items]
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row: Order) => {
  currentOrder.value = row
  remarks.value = [...row.remarks]
  attachments.value = [...row.attachments]
  detailDialogVisible.value = true
}

// 删除
const handleDelete = (row: Order) => {
  ElMessageBox.confirm(`确定要删除订单「${row.orderNo}」吗？`, t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrderApi(row.id)
      await loadOrderList()
      ElMessage.success(t('common.success'))
    } catch {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      updateStatistics()
      ElMessage.success(t('common.success'))
    }
  }).catch(() => {})
}

// 状态流转
const handleStatusChange = async (row: Order, newStatus: string) => {
  const transition = ORDER_STATUS_TRANSITIONS.find(t => t.fromStatus === row.status && t.toStatus === newStatus)
  const actionName = transition?.action || '变更状态'
  
  try {
    await ElMessageBox.confirm(`确定要「${actionName}」吗？`, '提示', {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    
    await updateOrderStatusApi(row.id, newStatus)
    
    const statusInfo = ORDER_STATUSES.find(s => s.value === newStatus)
    row.status = newStatus
    row.statusName = statusInfo?.label || newStatus
    
    ElMessage.success('状态更新成功')
  } catch {
    // 用户取消
  }
}

// 添加订单项
const handleAddItem = () => {
  orderItems.value.push({
    id: Date.now(),
    assetId: 0,
    assetCode: '',
    assetName: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    amount: 0
  })
  calculateTotal()
}

// 删除订单项
const handleDeleteItem = (index: number) => {
  orderItems.value.splice(index, 1)
  calculateTotal()
}

// 计算总金额
const calculateTotal = () => {
  const total = orderItems.value.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity - item.discount)
  }, 0)
  formData.totalAmount = total
  formData.actualAmount = total - formData.discountAmount
}

// 保存
const handleSave = async () => {
  if (!formData.customerName) {
    ElMessage.warning('请填写客户信息')
    return
  }

  if (orderItems.value.length === 0) {
    ElMessage.warning('请添加订单明细')
    return
  }

  formData.items = orderItems.value

  try {
    if (dialogMode.value === 'create') {
      await createOrderApi(formData)
    } else {
      await updateOrderApi(formData.id!, formData)
    }
    
    dialogVisible.value = false
    await loadOrderList()
    ElMessage.success(t('common.success'))
  } catch {
    if (dialogMode.value === 'create') {
      tableData.value.unshift({
        id: Date.now(),
        orderNo: `ORD${new Date().getTime()}`,
        orderType: formData.orderType,
        orderTypeName: ORDER_TYPES.find(t => t.value === formData.orderType)?.label || '',
        customerId: formData.customerId,
        customerName: formData.customerName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        totalAmount: formData.totalAmount,
        discountAmount: formData.discountAmount,
        actualAmount: formData.actualAmount,
        status: formData.status,
        statusName: ORDER_STATUSES.find(s => s.value === formData.status)?.label || '',
        items: [...orderItems.value],
        attachments: [],
        remarks: [],
        relatedAssets: [],
        createdBy: 'admin',
        createdAt: new Date().toLocaleString()
      } as Order)
    } else {
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        Object.assign(tableData.value[index], {
          orderType: formData.orderType,
          orderTypeName: ORDER_TYPES.find(t => t.value === formData.orderType)?.label || '',
          customerName: formData.customerName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          totalAmount: formData.totalAmount,
          discountAmount: formData.discountAmount,
          actualAmount: formData.actualAmount,
          items: [...orderItems.value]
        })
      }
    }
    updateStatistics()
    dialogVisible.value = false
    ElMessage.success(t('common.success'))
  }
}

// 添加备注
const handleAddRemark = async () => {
  if (!newRemark.value.trim()) {
    ElMessage.warning('请输入备注内容')
    return
  }

  const remark: Remark = {
    id: Date.now(),
    content: newRemark.value,
    createdBy: 'admin',
    createdAt: new Date().toLocaleString()
  }
  
  remarks.value.push(remark)
  currentOrder.value!.remarks = [...remarks.value]
  newRemark.value = ''
  
  try {
    await addOrderRemarkApi(currentOrder.value!.id, remark.content)
  } catch {
    // 本地处理
  }
}

// 删除备注
const handleDeleteRemark = async (remarkId: number) => {
  remarks.value = remarks.value.filter(r => r.id !== remarkId)
  currentOrder.value!.remarks = [...remarks.value]
  
  try {
    await deleteOrderRemarkApi(currentOrder.value!.id, remarkId)
  } catch {
    // 本地处理
  }
}

// 文件上传
const handleFileChange = async (file: File) => {
  const attachment: Attachment = {
    id: Date.now(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    fileUrl: '#',
    uploadedBy: 'admin',
    uploadedAt: new Date().toLocaleString()
  }
  
  attachments.value.push(attachment)
  currentOrder.value!.attachments = [...attachments.value]
  
  try {
    await addOrderAttachmentApi(currentOrder.value!.id, file)
  } catch {
    // 本地处理
  }
  
  return false
}

// 删除附件
const handleDeleteAttachment = async (attachmentId: number) => {
  attachments.value = attachments.value.filter(a => a.id !== attachmentId)
  currentOrder.value!.attachments = [...attachments.value]
  
  try {
    await deleteOrderAttachmentApi(currentOrder.value!.id, attachmentId)
  } catch {
    // 本地处理
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

// 分页改变
const handlePageChange = (page: number) => {
  pagination.page = page
  loadOrderList()
}

onMounted(() => {
  loadOrderList()
})
</script>

<template>
  <div class="order-management">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="4">
        <div class="stat-card">
          <div class="stat-value">{{ statistics.totalCount }}</div>
          <div class="stat-label">订单总数</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card amount">
          <div class="stat-value">¥{{ statistics.totalAmount.toLocaleString() }}</div>
          <div class="stat-label">订单总额</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card pending">
          <div class="stat-value">{{ statistics.pendingCount }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card processing">
          <div class="stat-value">{{ statistics.processingCount }}</div>
          <div class="stat-label">处理中</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card completed">
          <div class="stat-value">{{ statistics.completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card cancelled">
          <div class="stat-value">{{ statistics.cancelledCount }}</div>
          <div class="stat-label">已取消</div>
        </div>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="订单类型">
          <el-select v-model="searchForm.orderType" placeholder="请选择" clearable style="width: 130px">
            <el-option v-for="type in ORDER_TYPES" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="status in ORDER_STATUSES" :key="status.value" :label="status.label" :value="status.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button v-permission="{ permission: 'order:add' }" type="primary" @click="handleAdd">
            创建订单
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="orderTypeName" label="订单类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.orderTypeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.actualAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="{ permission: 'order:list' }" link type="primary" @click="handleView(row)">
              详情
            </el-button>
            <el-button v-permission="{ permission: 'order:edit' }" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-dropdown @command="(cmd: string) => handleStatusChange(row, cmd)">
              <el-button link type="warning">
                状态变更<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="transition in ORDER_STATUS_TRANSITIONS.filter(t => t.fromStatus === row.status)"
                    :key="transition.toStatus"
                    :command="transition.toStatus"
                    :disabled="transition.toStatus === row.status"
                  >
                    {{ transition.action }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button v-permission="{ permission: 'order:delete' }" link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadOrderList"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单类型" required>
              <el-select v-model="formData.orderType" placeholder="请选择" style="width: 100%">
                <el-option v-for="type in ORDER_TYPES" :key="type.value" :label="type.label" :value="type.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" required>
              <el-input v-model="formData.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱">
              <el-input v-model="formData.contactEmail" placeholder="请输入电子邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider>订单明细</el-divider>
        
        <div class="order-items">
          <el-button type="primary" size="small" @click="handleAddItem">添加资产</el-button>
          <el-table :data="orderItems" border size="small" style="margin-top: 10px">
            <el-table-column label="资产编号" width="150">
              <template #default="{ row, $index }">
                <el-input v-model="row.assetCode" placeholder="请输入" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="资产名称" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.assetName" placeholder="请输入" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="1" :max="999" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.unitPrice" :min="0" :precision="2" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="折扣" width="100">
              <template #default="{ row }">
                <el-input-number v-model="row.discount" :min="0" :precision="2" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100">
              <template #default="{ row }">
                ¥{{ (row.unitPrice * row.quantity - row.discount).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="handleDeleteItem($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="8">
            <el-form-item label="订单金额">
              <el-input-number v-model="formData.totalAmount" :precision="2" :disabled style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="折扣金额">
              <el-input-number v-model="formData.discountAmount" :min="0" :precision="2" style="width: 100%" @change="calculateTotal" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实际金额">
              <el-input-number v-model="formData.actualAmount" :precision="2" :disabled style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="900px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ currentOrder?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <el-tag>{{ currentOrder?.orderTypeName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentOrder?.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder?.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">{{ currentOrder?.contactEmail }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder?.status || '')">{{ currentOrder?.statusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder?.totalAmount?.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="折扣金额">¥{{ currentOrder?.discountAmount?.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="实际金额">
          <span class="amount">¥{{ currentOrder?.actualAmount?.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder?.createdAt }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>订单明细</el-divider>
      
      <el-table :data="currentOrder?.items" border size="small">
        <el-table-column prop="assetCode" label="资产编号" width="150" />
        <el-table-column prop="assetName" label="资产名称" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column label="单价" width="100">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="折扣" width="100">
          <template #default="{ row }">
            ¥{{ row.discount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      
      <el-divider>备注</el-divider>
      
      <div class="remarks-section">
        <div class="add-remark">
          <el-input v-model="newRemark" type="textarea" :rows="2" placeholder="请输入备注内容" />
          <el-button type="primary" size="small" @click="handleAddRemark">添加备注</el-button>
        </div>
        <div class="remark-list">
          <div v-for="remark in remarks" :key="remark.id" class="remark-item">
            <div class="remark-content">{{ remark.content }}</div>
            <div class="remark-info">
              <span>{{ remark.createdBy }}</span>
              <span>{{ remark.createdAt }}</span>
              <el-button link type="danger" size="small" @click="handleDeleteRemark(remark.id)">删除</el-button>
            </div>
          </div>
          <el-empty v-if="remarks.length === 0" description="暂无备注" :image-size="60" />
        </div>
      </div>
      
      <el-divider>附件</el-divider>
      
      <div class="attachments-section">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或<em>点击上传</em>
          </div>
        </el-upload>
        
        <el-table :data="attachments" border size="small" style="margin-top: 10px">
          <el-table-column prop="fileName" label="文件名" />
          <el-table-column label="大小" width="100">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="uploadedBy" label="上传人" width="100" />
          <el-table-column prop="uploadedAt" label="上传时间" width="180" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" size="small">下载</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteAttachment(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.order-management {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  color: #fff;
  text-align: center;
}

.stat-card.amount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.pending {
  background: linear-gradient(135deg, #909399 0%, #bdbdbd 100%);
}

.stat-card.processing {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.stat-card.completed {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.stat-card.cancelled {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  margin-top: 5px;
  opacity: 0.9;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  background: #fff;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}

.order-items {
  margin-bottom: 20px;
}

.remarks-section {
  margin-top: 10px;
}

.add-remark {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-remark .el-textarea {
  flex: 1;
}

.remark-list {
  max-height: 200px;
  overflow-y: auto;
}

.remark-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.remark-item:last-child {
  border-bottom: none;
}

.remark-content {
  margin-bottom: 5px;
}

.remark-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 10px;
  align-items: center;
}

.attachments-section {
  margin-top: 10px;
}
</style>
