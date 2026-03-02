import request from '@/utils/request'
import type { Asset, AssetForm, AssetHistory, ImportResult, AssetStatistics } from '@/types/asset'

export interface AssetListParams {
  page: number
  size: number
  assetTypeId?: number
  status?: string
  keyword?: string
}

export interface AssetListResponse {
  list: Asset[]
  total: number
  page: number
  size: number
}

export function getAssetListApi(params: AssetListParams) {
  return request<AssetListResponse>({
    url: '/asset/list',
    method: 'get',
    params
  })
}

export function getAssetDetailApi(id: number) {
  return request<Asset>({
    url: `/asset/${id}`,
    method: 'get'
  })
}

export function createAssetApi(data: AssetForm) {
  return request<Asset>({
    url: '/asset',
    method: 'post',
    data
  })
}

export function updateAssetApi(id: number, data: AssetForm) {
  return request<Asset>({
    url: `/asset/${id}`,
    method: 'put',
    data
  })
}

export function deleteAssetApi(id: number) {
  return request({
    url: `/asset/${id}`,
    method: 'delete'
  })
}

export function importAssetsApi(file: File, assetTypeId: number) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('assetTypeId', assetTypeId.toString())
  
  return request<ImportResult>({
    url: '/asset/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function exportAssetsApi(params: AssetListParams) {
  return request({
    url: '/asset/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function downloadImportTemplateApi(assetTypeId: number) {
  return request({
    url: `/asset/template/${assetTypeId}`,
    method: 'get',
    responseType: 'blob'
  })
}

export function getAssetHistoryApi(assetId: number) {
  return request<AssetHistory[]>({
    url: `/asset/${assetId}/history`,
    method: 'get'
  })
}

export function getAssetStatisticsApi(assetTypeId?: number) {
  return request<AssetStatistics>({
    url: '/asset/statistics',
    method: 'get',
    params: { assetTypeId }
  })
}
