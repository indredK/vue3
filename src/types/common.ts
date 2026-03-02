export {}

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean
  }
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PageParams {
  page?: number
  pageSize?: number
  keyword?: string
}
