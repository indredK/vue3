import request from '@/utils/request'
import type { AssetType, AssetTypeForm, FieldDefinition, StatusDefinition, StatusTransition } from '@/types/assetType'

export interface AssetTypeListParams {
  page: number
  size: number
  keyword?: string
  status?: number
}

export interface AssetTypeListResponse {
  list: AssetType[]
  total: number
  page: number
  size: number
}

export function getAssetTypeListApi(params: AssetTypeListParams) {
  return request<AssetTypeListResponse>({
    url: '/asset/type/list',
    method: 'get',
    params
  })
}

export function getAssetTypeDetailApi(id: number) {
  return request<AssetType>({
    url: `/asset/type/${id}`,
    method: 'get'
  })
}

export function createAssetTypeApi(data: AssetTypeForm) {
  return request<AssetType>({
    url: '/asset/type',
    method: 'post',
    data
  })
}

export function updateAssetTypeApi(id: number, data: AssetTypeForm) {
  return request<AssetType>({
    url: `/asset/type/${id}`,
    method: 'put',
    data
  })
}

export function deleteAssetTypeApi(id: number) {
  return request({
    url: `/asset/type/${id}`,
    method: 'delete'
  })
}

export function checkAssetTypeCanDeleteApi(id: number) {
  return request<{ canDelete: boolean; assetCount: number; message: string }>({
    url: `/asset/type/${id}/can-delete`,
    method: 'get'
  })
}

export function updateAssetTypeFieldsApi(id: number, fields: FieldDefinition[]) {
  return request({
    url: `/asset/type/${id}/fields`,
    method: 'put',
    data: { fields }
  })
}

export function updateAssetTypeStatusesApi(id: number, statuses: StatusDefinition[]) {
  return request({
    url: `/asset/type/${id}/statuses`,
    method: 'put',
    data: { statuses }
  })
}

export function updateAssetTypeTransitionsApi(id: number, transitions: StatusTransition[]) {
  return request({
    url: `/asset/type/${id}/transitions`,
    method: 'put',
    data: { transitions }
  })
}
