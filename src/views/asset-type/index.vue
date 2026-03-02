<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAssetTypeListApi, 
  createAssetTypeApi, 
  updateAssetTypeApi, 
  deleteAssetTypeApi,
  checkAssetTypeCanDeleteApi,
  updateAssetTypeFieldsApi,
  updateAssetTypeStatusesApi,
  updateAssetTypeTransitionsApi
} from '@/api/modules/assetType'
import type { AssetType, AssetTypeForm, FieldDefinition, StatusDefinition, StatusTransition } from '@/types/assetType'
import { FIELD_TYPES } from '@/types/assetType'

const { t } = useI18n()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: ''
})

// 表格数据
const tableData = ref<AssetType[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const fieldDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const transitionDialogVisible = ref(false)
const dialogTitle = ref('')

// 表单数据
const formData = reactive<AssetTypeForm>({
  name: '',
  code: '',
  description: '',
  status: 1
})

// 当前操作的资产类型
const currentAssetType = ref<AssetType | null>(null)

// 字段配置数据
const fieldList = ref<FieldDefinition[]>([])
const fieldForm = reactive<FieldDefinition>({
  id: 0,
  name: '',
  code: '',
  type: 'text',
  required: false,
  sort: 0,
  visible: true,
  editable: true,
  searchable: false,
  options: []
})

// 状态配置数据
const statusList = ref<StatusDefinition[]>([])
const statusForm = reactive<StatusDefinition>({
  id: 0,
  code: '',
  name: '',
  color: 'info',
  isInitial: false,
  isFinal: false,
  sort: 0
})

// 状态流转配置数据
const transitionList = ref<StatusTransition[]>([])
const transitionForm = reactive<StatusTransition>({
  id: 0,
  fromStatus: '',
  toStatus: '',
  action: '',
  condition: '',
  description: ''
})

const statusColors = [
  { label: '绿色-成功', value: 'success' },
  { label: '橙色-警告', value: 'warning' },
  { label: '红色-危险', value: 'danger' },
  { label: '灰色-信息', value: 'info' },
  { label: '蓝色-主要', value: 'primary' }
]

// 加载资产类型列表
const loadAssetTypeList = async () => {
  loading.value = true
  try {
    // Mock 数据
    const mockData: AssetType[] = [
      {
        id: 1,
        name: '通用资产',
        code: 'asset',
        description: '通用资产类型',
        fields: [
          { id: 1, name: '资产名称', code: 'name', type: 'text', required: true, sort: 1, visible: true, editable: true, searchable: true },
          { id: 2, name: '资产编号', code: 'code', type: 'text', required: true, sort: 2, visible: true, editable: false, searchable: true },
          { id: 3, name: '购买日期', code: 'purchaseDate', type: 'date', required: false, sort: 3, visible: true, editable: true, searchable: false },
          { id: 4, name: '状态', code: 'status', type: 'select', required: true, sort: 4, visible: true, editable: true, searchable: true, options: [] }
        ],
        statuses: [
          { id: 1, code: 'available', name: '可用', color: 'success', isInitial: true, isFinal: false, sort: 1 },
          { id: 2, code: 'in_use', name: '使用中', color: 'primary', isInitial: false, isFinal: false, sort: 2 },
          { id: 3, code: 'maintenance', name: '维护中', color: 'warning', isInitial: false, isFinal: false, sort: 3 },
          { id: 4, code: 'retired', name: '已报废', color: 'danger', isInitial: false, isFinal: true, sort: 4 }
        ],
        transitions: [
          { id: 1, fromStatus: 'available', toStatus: 'in_use', action: '借用', description: '资产被借用' },
          { id: 2, fromStatus: 'in_use', toStatus: 'available', action: '归还', description: '资产归还' },
          { id: 3, fromStatus: 'available', toStatus: 'maintenance', action: '报修', description: '资产需要维修' },
          { id: 4, fromStatus: 'maintenance', toStatus: 'available', action: '维修完成', description: '维修完成' },
          { id: 5, fromStatus: 'available', toStatus: 'retired', action: '报废', description: '资产报废' }
        ],
        fieldCount: 4,
        statusCount: 4,
        assetCount: 156,
        status: 1,
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '设备',
        code: 'device',
        description: '设备资产',
        fields: [
          { id: 1, name: '设备名称', code: 'name', type: 'text', required: true, sort: 1, visible: true, editable: true, searchable: true },
          { id: 2, name: '设备型号', code: 'model', type: 'text', required: true, sort: 2, visible: true, editable: true, searchable: true },
          { id: 3, name: '序列号', code: 'serialNumber', type: 'text', required: true, sort: 3, visible: true, editable: false, searchable: true }
        ],
        statuses: [
          { id: 1, code: 'online', name: '在线', color: 'success', isInitial: true, isFinal: false, sort: 1 },
          { id: 2, code: 'offline', name: '离线', color: 'info', isInitial: false, isFinal: false, sort: 2 },
          { id: 3, code: 'error', name: '故障', color: 'danger', isInitial: false, isFinal: false, sort: 3 }
        ],
        transitions: [],
        fieldCount: 3,
        statusCount: 3,
        assetCount: 89,
        status: 1,
        createdAt: '2024-01-02 10:00:00'
      },
      {
        id: 3,
        name: '工单',
        code: 'work_order',
        description: '维修工单',
        fields: [
          { id: 1, name: '工单编号', code: 'orderNo', type: 'text', required: true, sort: 1, visible: true, editable: false, searchable: true },
          { id: 2, name: '标题', code: 'title', type: 'text', required: true, sort: 2, visible: true, editable: true, searchable: true },
          { id: 3, name: '优先级', code: 'priority', type: 'select', required: true, sort: 3, visible: true, editable: true, searchable: false }
        ],
        statuses: [
          { id: 1, code: 'pending', name: '待处理', color: 'warning', isInitial: true, isFinal: false, sort: 1 },
          { id: 2, code: 'processing', name: '处理中', color: 'primary', isInitial: false, isFinal: false, sort: 2 },
          { id: 3, code: 'completed', name: '已完成', color: 'success', isInitial: false, isFinal: true, sort: 3 },
          { id: 4, code: 'cancelled', name: '已取消', color: 'info', isInitial: false, isFinal: true, sort: 4 }
        ],
        transitions: [],
        fieldCount: 3,
        statusCount: 4,
        assetCount: 234,
        status: 1,
        createdAt: '2024-01-03 10:00:00'
      }
    ]
    
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载资产类型列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadAssetTypeList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增资产类型'
  Object.assign(formData, { id: 0, name: '', code: '', description: '', status: 1 })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: AssetType) => {
  dialogTitle.value = '编辑资产类型'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 删除（带约束验证）
const handleDelete = async (row: AssetType) => {
  try {
    // 检查是否可以删除
    const canDelete = await checkAssetTypeCanDeleteApi(row.id)
    
    if (!canDelete.canDelete) {
      ElMessage.error(`无法删除：该类型下存在 ${canDelete.assetCount} 个资产实例，请先迁移或删除这些资产`)
      return
    }
  } catch {
    // 如果是 mock 数据，使用本地检查
    if (row.assetCount && row.assetCount > 0) {
      ElMessage.error(`无法删除：该类型下存在 ${row.assetCount} 个资产实例，请先迁移或删除这些资产`)
      return
    }
  }
  
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAssetTypeApi(row.id)
      await loadAssetTypeList()
      ElMessage.success(t('common.success'))
    } catch (error) {
      // 本地删除
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      ElMessage.success(t('common.success'))
    }
  }).catch(() => {})
}

// 配置字段
const handleConfigField = (row: AssetType) => {
  currentAssetType.value = row
  fieldList.value = [...row.fields]
  fieldDialogVisible.value = true
}

// 配置状态
const handleConfigStatus = (row: AssetType) => {
  currentAssetType.value = row
  statusList.value = [...row.statuses]
  statusDialogVisible.value = true
}

// 配置状态流转
const handleConfigTransition = (row: AssetType) => {
  currentAssetType.value = row
  transitionList.value = [...row.transitions]
  transitionDialogVisible.value = true
}

// 保存资产类型
const handleSave = async () => {
  if (!formData.name || !formData.code) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (formData.id === 0) {
      await createAssetTypeApi(formData)
    } else {
      await updateAssetTypeApi(formData.id!, formData)
    }
    
    dialogVisible.value = false
    await loadAssetTypeList()
    ElMessage.success(t('common.success'))
  } catch (error) {
    // 本地处理
    if (formData.id === 0) {
      tableData.value.unshift({
        ...formData,
        id: Date.now(),
        fields: [],
        statuses: [],
        transitions: [],
        fieldCount: 0,
        statusCount: 0,
        assetCount: 0,
        createdAt: new Date().toLocaleString()
      } as AssetType)
    } else {
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        Object.assign(tableData.value[index], formData)
      }
    }
    dialogVisible.value = false
    ElMessage.success(t('common.success'))
  }
}

// 添加/编辑字段
const handleAddField = () => {
  Object.assign(fieldForm, {
    id: 0,
    name: '',
    code: '',
    type: 'text',
    required: false,
    sort: fieldList.value.length + 1,
    visible: true,
    editable: true,
    searchable: false,
    options: []
  })
}

const handleEditField = (field: FieldDefinition) => {
  Object.assign(fieldForm, { ...field, options: field.options || [] })
}

const handleDeleteField = (index: number) => {
  fieldList.value.splice(index, 1)
}

const handleSaveFields = async () => {
  try {
    await updateAssetTypeFieldsApi(currentAssetType.value!.id, fieldList.value)
    ElMessage.success('字段配置保存成功')
    fieldDialogVisible.value = false
    await loadAssetTypeList()
  } catch {
    // 本地处理
    const index = tableData.value.findIndex(item => item.id === currentAssetType.value!.id)
    if (index !== -1) {
      tableData.value[index].fields = [...fieldList.value]
      tableData.value[index].fieldCount = fieldList.value.length
    }
    fieldDialogVisible.value = false
    ElMessage.success('字段配置保存成功')
  }
}

// 添加/编辑状态
const handleAddStatus = () => {
  Object.assign(statusForm, {
    id: 0,
    code: '',
    name: '',
    color: 'info',
    isInitial: false,
    isFinal: false,
    sort: statusList.value.length + 1
  })
}

const handleEditStatus = (status: StatusDefinition) => {
  Object.assign(statusForm, { ...status })
}

const handleDeleteStatus = (index: number) => {
  statusList.value.splice(index, 1)
}

const handleSaveStatuses = async () => {
  // 检查是否有初始状态
  const hasInitial = statusList.value.some(s => s.isInitial)
  if (!hasInitial) {
    ElMessage.warning('请至少设置一个初始状态')
    return
  }
  
  // 检查是否有最终状态
  const hasFinal = statusList.value.some(s => s.isFinal)
  if (!hasFinal) {
    ElMessage.warning('请至少设置一个最终状态')
    return
  }
  
  try {
    await updateAssetTypeStatusesApi(currentAssetType.value!.id, statusList.value)
    ElMessage.success('状态配置保存成功')
    statusDialogVisible.value = false
    await loadAssetTypeList()
  } catch {
    // 本地处理
    const index = tableData.value.findIndex(item => item.id === currentAssetType.value!.id)
    if (index !== -1) {
      tableData.value[index].statuses = [...statusList.value]
      tableData.value[index].statusCount = statusList.value.length
    }
    statusDialogVisible.value = false
    ElMessage.success('状态配置保存成功')
  }
}

// 添加/编辑状态流转
const handleAddTransition = () => {
  Object.assign(transitionForm, {
    id: 0,
    fromStatus: '',
    toStatus: '',
    action: '',
    condition: '',
    description: ''
  })
}

const handleEditTransition = (transition: StatusTransition) => {
  Object.assign(transitionForm, { ...transition })
}

const handleDeleteTransition = (index: number) => {
  transitionList.value.splice(index, 1)
}

const handleSaveTransitions = async () => {
  try {
    await updateAssetTypeTransitionsApi(currentAssetType.value!.id, transitionList.value)
    ElMessage.success('状态流转配置保存成功')
    transitionDialogVisible.value = false
    await loadAssetTypeList()
  } catch {
    // 本地处理
    const index = tableData.value.findIndex(item => item.id === currentAssetType.value!.id)
    if (index !== -1) {
      tableData.value[index].transitions = [...transitionList.value]
    }
    transitionDialogVisible.value = false
    ElMessage.success('状态流转配置保存成功')
  }
}

// 分页改变
const handlePageChange = (page: number) => {
  pagination.page = page
  loadAssetTypeList()
}

onMounted(() => {
  loadAssetTypeList()
})
</script>

<template>
  <div class="asset-type-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="名称">
          <el-input v-model="searchForm.keyword" placeholder="资产类型名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
          <el-button v-permission="{ permission: 'asset:type:add' }" type="primary" @click="handleAdd">
            新增资产类型
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="类型名称" width="150" />
        <el-table-column prop="code" label="类型编码" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="fieldCount" label="字段数" width="80">
          <template #default="{ row }">
            <el-tag type="info">{{ row.fieldCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusCount" label="状态数" width="80">
          <template #default="{ row }">
            <el-tag type="success">{{ row.statusCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assetCount" label="实例数" width="80">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.assetCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="{ permission: 'asset:type:edit' }" link type="primary" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button v-permission="{ permission: 'asset:type:config' }" link type="success" @click="handleConfigField(row)">
              字段配置
            </el-button>
            <el-button v-permission="{ permission: 'asset:type:config' }" link type="warning" @click="handleConfigStatus(row)">
              状态配置
            </el-button>
            <el-button v-permission="{ permission: 'asset:type:config' }" link type="info" @click="handleConfigTransition(row)">
              流转配置
            </el-button>
            <el-button v-permission="{ permission: 'asset:type:delete' }" link type="danger" @click="handleDelete(row)">
              {{ t('common.delete') }}
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
          @size-change="loadAssetTypeList"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 资产类型编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="类型名称" required>
          <el-input v-model="formData.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型编码" required>
          <el-input v-model="formData.code" placeholder="请输入类型编码" :disabled="formData.id !== 0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 字段配置对话框 -->
    <el-dialog v-model="fieldDialogVisible" title="字段配置" width="900px">
      <div class="dialog-toolbar">
        <el-button type="primary" @click="handleAddField">添加字段</el-button>
      </div>
      <el-table :data="fieldList" border stripe max-height="400">
        <el-table-column prop="name" label="字段名称" width="120" />
        <el-table-column prop="code" label="字段编码" width="120" />
        <el-table-column label="数据类型" width="120">
          <template #default="{ row }">
            {{ FIELD_TYPES.find(f => f.value === row.type)?.label || row.type }}
          </template>
        </el-table-column>
        <el-table-column label="必填" width="60">
          <template #default="{ row }">
            <el-tag :type="row.required ? 'danger' : 'info'" size="small">{{ row.required ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可见" width="60">
          <template #default="{ row }">
            <el-tag :type="row.visible ? 'success' : 'info'" size="small">{{ row.visible ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可编辑" width="70">
          <template #default="{ row }">
            <el-tag :type="row.editable ? 'success' : 'info'" size="small">{{ row.editable ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可搜索" width="70">
          <template #default="{ row }">
            <el-tag :type="row.searchable ? 'success' : 'info'" size="small">{{ row.searchable ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" size="small" @click="handleEditField(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteField($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 字段编辑表单 -->
      <el-divider v-if="fieldForm.id !== 0 || fieldList.length === 0" />
      <el-form v-if="fieldForm.id !== 0 || fieldList.length === 0" :model="fieldForm" inline label-width="80px" class="field-form">
        <el-form-item label="字段名称">
          <el-input v-model="fieldForm.name" placeholder="名称" style="width: 100px" />
        </el-form-item>
        <el-form-item label="字段编码">
          <el-input v-model="fieldForm.code" placeholder="编码" style="width: 100px" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="fieldForm.type" placeholder="类型" style="width: 100px">
            <el-option v-for="ft in FIELD_TYPES" :key="ft.value" :label="ft.label" :value="ft.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="必填">
          <el-switch v-model="fieldForm.required" />
        </el-form-item>
        <el-form-item label="可见">
          <el-switch v-model="fieldForm.visible" />
        </el-form-item>
        <el-form-item label="可编辑">
          <el-switch v-model="fieldForm.editable" />
        </el-form-item>
        <el-form-item label="可搜索">
          <el-switch v-model="fieldForm.searchable" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="fieldForm.sort" :min="1" :max="999" style="width: 80px" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="fieldDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveFields">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 状态配置对话框 -->
    <el-dialog v-model="statusDialogVisible" title="状态配置" width="800px">
      <div class="dialog-toolbar">
        <el-button type="primary" @click="handleAddStatus">添加状态</el-button>
        <span class="tips">提示：至少需要设置一个初始状态和一个最终状态</span>
      </div>
      <el-table :data="statusList" border stripe max-height="400">
        <el-table-column prop="name" label="状态名称" width="120" />
        <el-table-column prop="code" label="状态编码" width="120" />
        <el-table-column label="颜色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.color as any">{{ row.color }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="初始状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isInitial ? 'success' : 'info'" size="small">{{ row.isInitial ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最终状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isFinal ? 'danger' : 'info'" size="small">{{ row.isFinal ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" size="small" @click="handleEditStatus(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteStatus($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-divider />
      <el-form v-if="statusForm.id !== 0 || statusList.length === 0" :model="statusForm" inline label-width="80px">
        <el-form-item label="状态名称">
          <el-input v-model="statusForm.name" placeholder="名称" style="width: 100px" />
        </el-form-item>
        <el-form-item label="状态编码">
          <el-input v-model="statusForm.code" placeholder="编码" style="width: 100px" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-select v-model="statusForm.color" placeholder="颜色" style="width: 100px">
            <el-option v-for="sc in statusColors" :key="sc.value" :label="sc.label" :value="sc.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始">
          <el-switch v-model="statusForm.isInitial" />
        </el-form-item>
        <el-form-item label="最终">
          <el-switch v-model="statusForm.isFinal" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="statusForm.sort" :min="1" :max="999" style="width: 80px" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="statusDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveStatuses">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 状态流转配置对话框 -->
    <el-dialog v-model="transitionDialogVisible" title="状态流转配置" width="800px">
      <div class="dialog-toolbar">
        <el-button type="primary" @click="handleAddTransition">添加流转规则</el-button>
      </div>
      <el-table :data="transitionList" border stripe max-height="400">
        <el-table-column prop="fromStatus" label="源状态" width="120" />
        <el-table-column prop="toStatus" label="目标状态" width="120" />
        <el-table-column prop="action" label="操作动作" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" size="small" @click="handleEditTransition(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteTransition($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-divider />
      <el-form v-if="transitionForm.id !== 0 || transitionList.length === 0" :model="transitionForm" inline label-width="80px">
        <el-form-item label="源状态">
          <el-input v-model="transitionForm.fromStatus" placeholder="源状态编码" style="width: 100px" />
        </el-form-item>
        <el-form-item label="目标状态">
          <el-input v-model="transitionForm.toStatus" placeholder="目标状态编码" style="width: 100px" />
        </el-form-item>
        <el-form-item label="操作动作">
          <el-input v-model="transitionForm.action" placeholder="动作名称" style="width: 100px" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="transitionForm.description" placeholder="描述" style="width: 150px" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="transitionDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSaveTransitions">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.asset-type-management {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

.dialog-toolbar {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-toolbar .tips {
  color: #909399;
  font-size: 12px;
}

.field-form {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
