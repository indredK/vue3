export interface Asset {
  id: number
  assetTypeId: number
  assetTypeName: string
  assetCode: string
  name: string
  status: string
  statusName: string
  fields: Record<string, any>
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

export interface AssetForm {
  id?: number
  assetTypeId: number
  assetCode: string
  name: string
  status: string
  fields: Record<string, any>
}

export interface AssetHistory {
  id: number
  assetId: number
  assetCode: string
  fieldName: string
  fieldLabel: string
  oldValue: string
  newValue: string
  operation: 'create' | 'update' | 'delete'
  operator: string
  operateTime: string
}

export interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  field: string
  message: string
}

export interface AssetStatistics {
  total: number
  available: number
  inUse: number
  maintenance: number
  retired: number
}
