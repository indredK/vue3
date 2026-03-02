export interface Tenant {
  id: number
  name: string
  code: string
  status: number
  quota: TenantQuota
  config: TenantConfig
  createdAt: string
  updatedAt?: string
}

export interface TenantQuota {
  maxUsers: number
  maxAssets: number
  maxOrders: number
  usedUsers?: number
  usedAssets?: number
  usedOrders?: number
}

export interface TenantConfig {
  themeColor: string
  logo: string
  enabledModules: string[]
  settings?: Record<string, any>
}

export interface TenantQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export interface CreateTenantParams {
  name: string
  code: string
  quota: TenantQuota
  config?: Partial<TenantConfig>
  status?: number
}

export interface UpdateTenantParams extends Partial<CreateTenantParams> {
  id: number
}
