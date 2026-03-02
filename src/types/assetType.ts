export interface FieldDefinition {
  id: number
  name: string
  code: string
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'textarea' | 'switch' | 'file' | 'image'
  required: boolean
  defaultValue?: any
  options?: SelectOption[]
  sort: number
  visible: boolean
  editable: boolean
  searchable: boolean
  description?: string
}

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
}

export interface StatusDefinition {
  id: number
  code: string
  name: string
  color: string
  isInitial: boolean
  isFinal: boolean
  sort: number
}

export interface StatusTransition {
  id: number
  fromStatus: string
  toStatus: string
  action: string
  condition?: string
  description?: string
}

export interface AssetType {
  id: number
  name: string
  code: string
  description?: string
  icon?: string
  fields: FieldDefinition[]
  statuses: StatusDefinition[]
  transitions: StatusTransition[]
  fieldCount: number
  statusCount: number
  assetCount?: number
  status: number
  createdAt: string
  updatedAt?: string
}

export interface AssetTypeForm {
  id?: number
  name: string
  code: string
  description?: string
  icon?: string
  status: number
}

export interface FieldForm {
  id?: number
  name: string
  code: string
  type: FieldDefinition['type']
  required: boolean
  defaultValue?: any
  options?: SelectOption[]
  sort: number
  visible: boolean
  editable: boolean
  searchable: boolean
  description?: string
}

export const FIELD_TYPES = [
  { label: '单行文本', value: 'text' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '下拉选择', value: 'select' },
  { label: '多选', value: 'multiselect' },
  { label: '开关', value: 'switch' },
  { label: '文件上传', value: 'file' },
  { label: '图片上传', value: 'image' }
]

export const STATUS_COLORS = [
  { label: '成功', value: 'success', color: '#67c23a' },
  { label: '警告', value: 'warning', color: '#e6a23c' },
  { label: '危险', value: 'danger', color: '#f56c6c' },
  { label: '信息', value: 'info', color: '#909399' },
  { label: '主要', value: 'primary', color: '#409eff' }
]
