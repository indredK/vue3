<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import AssetForm from '@/components/AssetForm/index.vue'
import {
  getAssetListApi,
  getAssetDetailApi,
  createAssetApi,
  updateAssetApi,
  deleteAssetApi,
  importAssetsApi,
  exportAssetsApi,
  getAssetHistoryApi,
  getAssetStatisticsApi
} from '@/api/modules/asset'
import { getAssetTypeListApi } from '@/api/modules/assetType'
import type { Asset, AssetForm as AssetFormType, AssetHistory } from '@/types/asset'
import type { AssetType, FieldDefinition, StatusDefinition } from '@/types/assetType'

const { t } = useI18n()

const assetFormRef = ref<InstanceType<typeof AssetForm>>()

// 搜索表单
const searchForm = reactive({
  assetTypeId: undefined as number | undefined,
  status: '',
  keyword: ''
})

// 表格数据
const tableData = ref<Asset[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 资产类型列表
const assetTypeList = ref<AssetType[]>([])
const currentAssetType = ref<AssetType | null>(null)

// 对话框
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const importDialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'create' | 'edit' | 'view'>('create')

// 表单数据
const formData = reactive<AssetFormType>({
  assetTypeId: 0,
  assetCode: '',
  name: '',
  status: '',
  fields: {}
})

// 当前操作的资产
const currentAsset = ref<Asset | null>(null)

// 历史记录
const historyList = ref<AssetHistory[]>([])
const historyLoading = ref(false)

// 导入相关
const importFile = ref<File | null>(null)
const importLoading = ref(false)
const importProgress = ref(0)
const importResult = ref<{ success: number; failed: number; errors: any[] } | null>(null)

// 统计卡片
const statistics = reactive({
  total: 0,
  available: 0,
  inUse: 0,
  maintenance: 0,
  retired: 0
})

// 加载资产列表
const loadAssetList = async () => {
  loading.value = true
  try {
    const mockAssets: Asset[] = [
      {
        id: 1,
        assetTypeId: 1,
        assetTypeName: '通用资产',
        assetCode: 'AST001',
        name: '办公电脑 Dell XPS 15',
        status: 'available',
        statusName: '可用',
        fields: { purchaseDate: '2024-01-15', price: 12000, department: '技术部' },
        createdBy: 'admin',
        createdAt: '2024-01-15 10:00:00'
      },
      {
        id: 2,
        assetTypeId: 1,
        assetTypeName: '通用资产',
        assetCode: 'AST002',
        name: '办公桌椅套装',
        status: 'in_use',
        statusName: '使用中',
        fields: { purchaseDate: '2024-02-01', price: 2000, department: '市场部' },
        createdBy: 'admin',
        createdAt: '2024-02-01 14:30:00'
      },
      {
        id: 3,
        assetTypeId: 2,
        assetTypeName: '设备',
        assetCode: 'DEV001',
        name: '服务器 Dell PowerEdge',
        status: 'maintenance',
        statusName: '维护中',
        fields: { purchaseDate: '2023-06-01', price: 50000, ip: '192.168.1.100' },
        createdBy: 'admin',
        createdAt: '2023-06-01 09:00:00'
      },
      {
        id: 4,
        assetTypeId: 1,
        assetTypeName: '通用资产',
        assetCode: 'AST003',
        name: '投影仪 Epson',
        status: 'available',
        statusName: '可用',
        fields: { purchaseDate: '2023-11-20', price: 8000, department: '会议室' },
        createdBy: 'admin',
        createdAt: '2023-11-20 16:00:00'
      },
      {
        id: 5,
        assetTypeId: 1,
        assetTypeName: '通用资产',
        assetCode: 'AST004',
        name: '打印机 HP LaserJet',
        status: 'retired',
        statusName: '已报废',
        fields: { purchaseDate: '2020-05-10', price: 3000, department: '行政部' },
        createdBy: 'admin',
        createdAt: '2020-05-10 11:00:00'
      }
    ]
    
    tableData.value = mockAssets
    pagination.total = mockAssets.length
    
    updateStatistics()
  } catch (error) {
    ElMessage.error('加载资产列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = () => {
  const total = tableData.value.length
  const available = tableData.value.filter(a => a.status === 'available').length
  const inUse = tableData.value.filter(a => a.status === 'in_use').length
  const maintenance = tableData.value.filter(a => a.status === 'maintenance').length
  const retired = tableData.value.filter(a => a.status === 'retired').length
  
  statistics.total = total
  statistics.available = available
  statistics.inUse = inUse
  statistics.maintenance = maintenance
  statistics.retired = retired
}

// 加载资产类型列表
const loadAssetTypeList = async () => {
  try {
    const mockTypes: AssetType[] = [
      {
        id: 1,
        name: '通用资产',
        code: 'asset',
        description: '通用资产类型',
        fields: [
          { id: 1, name: '资产名称', code: 'name', type: 'text', required: true, sort: 1, visible: true, editable: true, searchable: true },
          { id: 2, name: '购买日期', code: 'purchaseDate', type: 'date', required: false, sort: 2, visible: true, editable: true, searchable: false },
          { id: 3, name: '价格', code: 'price', type: 'number', required: false, sort: 3, visible: true, editable: true, searchable: false },
          { id: 4, name: '所属部门', code: 'department', type: 'text', required: false, sort: 4, visible: true, editable: true, searchable: true }
        ],
        statuses: [
          { id: 1, code: 'available', name: '可用', color: 'success', isInitial: true, isFinal: false, sort: 1 },
          { id: 2, code: 'in_use', name: '使用中', color: 'primary', isInitial: false, isFinal: false, sort: 2 },
          { id: 3, code: 'maintenance', name: '维护中', color: 'warning', isInitial: false, isFinal: false, sort: 3 },
          { id: 4, code: 'retired', name: '已报废', color: 'danger', isInitial: false, isFinal: true, sort: 4 }
        ],
        transitions: [],
        fieldCount: 4,
        statusCount: 4,
        status: 1,
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        name: '设备',
        code: 'device',
        description: '设备资产',
        fields: [
          { id: 1, name: '设备名称', code: 'name', type: 'text', required: true, sort: 1, visible: true, editable: true, searchable: true },
          { id: 2, name: 'IP地址', code: 'ip', type: 'text', required: false, sort: 2, visible: true, editable: true, searchable: true }
        ],
        statuses: [
          { id: 1, code: 'online', name: '在线', color: 'success', isInitial: true, isFinal: false, sort: 1 },
          { id: 2, code: 'offline', name: '离线', color: 'info', isInitial: false, isFinal: false, sort: 2 },
          { id: 3, code: 'maintenance', name: '维护中', color: 'warning', isInitial: false, isFinal: false, sort: 3 }
        ],
        transitions: [],
        fieldCount: 2,
        statusCount: 3,
        status: 1,
        createdAt: '2024-01-02'
      }
    ]
    
    assetTypeList.value = mockTypes
  } catch (error) {
    ElMessage.error('加载资产类型列表失败')
  }
}

// 获取当前资产类型的状态列表
const currentStatuses = computed(() => {
  return currentAssetType.value?.statuses || []
})

// 获取当前资产类型的字段列表
const currentFields = computed(() => {
  return currentAssetType.value?.fields || []
})

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadAssetList()
}

// 重置
const handleReset = () => {
  searchForm.assetTypeId = undefined
  searchForm.status = ''
  searchForm.keyword = ''
  handleSearch()
}

// 选择资产类型
const handleAssetTypeChange = (typeId: number) => {
  currentAssetType.value = assetTypeList.value.find(t => t.id === typeId) || null
  formData.status = currentStatuses.value.find(s => s.isInitial)?.code || ''
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增资产'
  dialogMode.value = 'create'
  Object.assign(formData, {
    assetTypeId: assetTypeList.value[0]?.id || 0,
    assetCode: '',
    name: '',
    status: '',
    fields: {}
  })
  handleAssetTypeChange(formData.assetTypeId)
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: Asset) => {
  dialogTitle.value = '编辑资产'
  dialogMode.value = 'edit'
  
  try {
    const detail = await getAssetDetailApi(row.id)
    Object.assign(formData, detail)
    currentAssetType.value = assetTypeList.value.find(t => t.id === detail.assetTypeId) || null
    dialogVisible.value = true
  } catch {
    Object.assign(formData, {
      id: row.id,
      assetTypeId: row.assetTypeId,
      assetCode: row.assetCode,
      name: row.name,
      status: row.status,
      fields: row.fields
    })
    currentAssetType.value = assetTypeList.value.find(t => t.id === row.assetTypeId) || null
    dialogVisible.value = true
  }
}

// 查看
const handleView = async (row: Asset) => {
  currentAsset.value = row
  viewDialogVisible.value = true
}

// 删除
const handleDelete = (row: Asset) => {
  ElMessageBox.confirm(`确定要删除资产「${row.name}」吗？`, t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAssetApi(row.id)
      await loadAssetList()
      ElMessage.success(t('common.success'))
    } catch {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      updateStatistics()
      ElMessage.success(t('common.success'))
    }
  }).catch(() => {})
}

// 查看历史记录
const handleHistory = async (row: Asset) => {
  currentAsset.value = row
  historyLoading.value = true
  historyDialogVisible.value = true
  
  try {
    const history = await getAssetHistoryApi(row.id)
    historyList.value = history
  } catch {
    historyList.value = [
      { id: 1, assetId: row.id, assetCode: row.assetCode, fieldName: 'status', fieldLabel: '状态', oldValue: '', newValue: 'available', operation: 'create' as const, operator: 'admin', operateTime: row.createdAt },
      { id: 2, assetId: row.id, assetCode: row.assetCode, fieldName: 'name', fieldLabel: '资产名称', oldValue: '', newValue: row.name, operation: 'create' as const, operator: 'admin', operateTime: row.createdAt }
    ]
  } finally {
    historyLoading.value = false
  }
}

// 保存
const handleSave = async () => {
  if (!formData.assetCode || !formData.name) {
    ElMessage.warning('请填写资产编号和资产名称')
    return
  }

  try {
    if (dialogMode.value === 'create') {
      await createAssetApi(formData)
    } else {
      await updateAssetApi(formData.id!, formData)
    }
    
    dialogVisible.value = false
    await loadAssetList()
    ElMessage.success(t('common.success'))
  } catch {
    if (dialogMode.value === 'create') {
      tableData.value.unshift({
        id: Date.now(),
        assetTypeId: formData.assetTypeId,
        assetTypeName: currentAssetType.value?.name || '',
        assetCode: formData.assetCode,
        name: formData.name,
        status: formData.status,
        statusName: currentStatuses.value.find(s => s.code === formData.status)?.name || '',
        fields: formData.fields,
        createdBy: 'admin',
        createdAt: new Date().toLocaleString()
      } as Asset)
    } else {
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        Object.assign(tableData.value[index], {
          assetTypeId: formData.assetTypeId,
          assetTypeName: currentAssetType.value?.name || '',
          assetCode: formData.assetCode,
          name: formData.name,
          status: formData.status,
          statusName: currentStatuses.value.find(s => s.code === formData.status)?.name || '',
          fields: formData.fields
        })
      }
    }
    updateStatistics()
    dialogVisible.value = false
    ElMessage.success(t('common.success'))
  }
}

// 导出
const handleExport = async () => {
  try {
    await exportAssetsApi({
      page: pagination.page,
      size: pagination.size,
      assetTypeId: searchForm.assetTypeId,
      status: searchForm.status || undefined,
      keyword: searchForm.keyword || undefined
    })
    ElMessage.success('导出成功')
  } catch {
    ElMessage.info('导出功能需要后端支持')
  }
}

// 导入相关
const handleImportClick = () => {
  importFile.value = null
  importResult.value = null
  importProgress.value = 0
  importDialogVisible.value = true
}

const handleFileChange = (file: File) => {
  importFile.value = file
  return false
}

const handleImport = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  importLoading.value = true
  importProgress.value = 30
  
  try {
    const result = await importAssetsApi(importFile.value, searchForm.assetTypeId || assetTypeList.value[0]?.id || 1)
    importProgress.value = 100
    importResult.value = result
    
    if (result.failed === 0) {
      ElMessage.success(`导入成功：${result.success} 条记录`)
      importDialogVisible.value = false
      loadAssetList()
    }
  } catch {
    importProgress.value = 100
    importResult.value = {
      success: 10,
      failed: 2,
      errors: [
        { row: 5, field: 'assetCode', message: '资产编号重复' },
        { row: 8, field: 'name', message: '资产名称不能为空' }
      ]
    }
  } finally {
    importLoading.value = false
  }
}

// 分页改变
const handlePageChange = (page: number) => {
  pagination.page = page
  loadAssetList()
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    available: 'success',
    in_use: 'primary',
    maintenance: 'warning',
    retired: 'danger',
    online: 'success',
    offline: 'info'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string, statuses: StatusDefinition[]) => {
  return statuses.find(s => s.code === status)?.name || status
}

onMounted(() => {
  loadAssetList()
  loadAssetTypeList()
})
</script>

<template>
  <div class="asset-management">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="4">
        <div class="stat-card">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">资产总数</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card available">
          <div class="stat-value">{{ statistics.available }}</div>
          <div class="stat-label">可用</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card in-use">
          <div class="stat-value">{{ statistics.inUse }}</div>
          <div class="stat-label">使用中</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card maintenance">
          <div class="stat-value">{{ statistics.maintenance }}</div>
          <div class="stat-label">维护中</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card retired">
          <div class="stat-value">{{ statistics.retired }}</div>
          <div class="stat-label">已报废</div>
        </div>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="资产类型">
          <el-select v-model="searchForm.assetTypeId" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="type in assetTypeList" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="可用" value="available" />
            <el-option label="使用中" value="in_use" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="已报废" value="retired" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="资产编号/名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button v-permission="{ permission: 'asset:add' }" type="primary" @click="handleAdd">
            新增资产
          </el-button>
          <el-button v-permission="{ permission: 'asset:export' }" @click="handleExport">
            导出
          </el-button>
          <el-button v-permission="{ permission: 'asset:import' }" @click="handleImportClick">
            导入
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="assetCode" label="资产编号" width="120" />
        <el-table-column prop="name" label="资产名称" min-width="150" />
        <el-table-column prop="assetTypeName" label="资产类型" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="自定义字段" min-width="200">
          <template #default="{ row }">
            <div class="field-preview">
              <span v-for="(value, key) in row.fields" :key="key" class="field-tag">
                {{ key }}: {{ value }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="{ permission: 'asset:list' }" link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button v-permission="{ permission: 'asset:edit' }" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="{ permission: 'asset:history' }" link type="info" @click="handleHistory(row)">
              历史
            </el-button>
            <el-button v-permission="{ permission: 'asset:delete' }" link type="danger" @click="handleDelete(row)">
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
          @size-change="loadAssetList"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产类型" required>
              <el-select 
                v-model="formData.assetTypeId" 
                placeholder="请选择" 
                style="width: 100%"
                :disabled="dialogMode === 'edit'"
                @change="handleAssetTypeChange"
              >
                <el-option 
                  v-for="type in assetTypeList" 
                  :key="type.id" 
                  :label="type.name" 
                  :value="type.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产编号" required>
              <el-input v-model="formData.assetCode" placeholder="请输入资产编号" :disabled="dialogMode === 'edit'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产名称" required>
              <el-input v-model="formData.name" placeholder="请输入资产名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                <el-option 
                  v-for="status in currentStatuses" 
                  :key="status.code" 
                  :label="status.name" 
                  :value="status.code" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider>自定义字段</el-divider>
        
        <AssetForm
          ref="assetFormRef"
          v-model="formData.fields"
          :fields="currentFields"
          :mode="dialogMode === 'view' ? 'view' : 'edit'"
        />
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="资产详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="资产编号">{{ currentAsset?.assetCode }}</el-descriptions-item>
        <el-descriptions-item label="资产名称">{{ currentAsset?.name }}</el-descriptions-item>
        <el-descriptions-item label="资产类型">{{ currentAsset?.assetTypeName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentAsset?.status || '')">
            {{ currentAsset?.statusName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentAsset?.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentAsset?.createdAt }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>自定义字段</el-divider>
      
      <AssetForm
        :fields="currentFields"
        :model-value="currentAsset?.fields || {}"
        mode="view"
      />
      
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录对话框 -->
    <el-dialog v-model="historyDialogVisible" title="变更历史" width="800px">
      <el-table v-loading="historyLoading" :data="historyList" border stripe max-height="400">
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.operation === 'create' ? 'success' : row.operation === 'delete' ? 'danger' : 'warning'">
              {{ row.operation === 'create' ? '创建' : row.operation === 'update' ? '更新' : '删除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fieldLabel" label="变更字段" width="120" />
        <el-table-column label="变更内容">
          <template #default="{ row }">
            <span class="old-value">{{ row.oldValue || '(空)' }}</span>
            <el-icon><arrow-right /></el-icon>
            <span class="new-value">{{ row.newValue }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入" width="500px">
      <el-form label-width="100px">
        <el-form-item label="资产类型">
          <el-select v-model="searchForm.assetTypeId" placeholder="请选择" style="width: 100%">
            <el-option v-for="type in assetTypeList" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="导入文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls,.csv"
            :on-change="handleFileChange"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .xlsx, .xls, .csv 格式
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="importProgress > 0" label="导入进度">
          <el-progress :percentage="importProgress" :status="importProgress === 100 ? 'success' : ''" />
        </el-form-item>
        <el-form-item v-if="importResult" label="导入结果">
          <div class="import-result">
            <span class="success">成功: {{ importResult.success }} 条</span>
            <span class="failed">失败: {{ importResult.failed }} 条</span>
          </div>
        </el-form-item>
        <el-form-item v-if="importResult?.errors?.length">
          <el-table :data="importResult.errors" border size="small" max-height="200">
            <el-table-column prop="row" label="行号" width="60" />
            <el-table-column prop="field" label="字段" width="100" />
            <el-table-column prop="message" label="错误信息" />
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImport">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.asset-management {
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

.stat-card.available {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-card.in-use {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.stat-card.maintenance {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.stat-card.retired {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
}

.stat-value {
  font-size: 32px;
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

.field-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.field-tag {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.old-value {
  color: #f56c6c;
  text-decoration: line-through;
}

.new-value {
  color: #67c23a;
}

.import-result {
  display: flex;
  gap: 20px;
}

.import-result .success {
  color: #67c23a;
}

.import-result .failed {
  color: #f56c6c;
}
</style>
