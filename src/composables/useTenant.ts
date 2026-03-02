import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function useTenant() {
  const userStore = useUserStore()

  const currentTenant = computed(() => userStore.currentTenant)
  const tenantId = computed(() => userStore.currentTenant?.id || null)
  const tenantName = computed(() => userStore.currentTenant?.name || '')
  const tenantCode = computed(() => userStore.currentTenant?.code || '')

  const isDefaultTenant = computed(() => {
    return currentTenant.value?.code === 'default'
  })

  const tenantConfig = computed(() => {
    return currentTenant.value?.config || {
      themeColor: '#409eff',
      logo: '',
      enabledModules: []
    }
  })

  const tenantQuota = computed(() => {
    return currentTenant.value?.quota || {
      maxUsers: 0,
      maxAssets: 0,
      maxOrders: 0
    }
  })

  function setTenant(tenant: any) {
    userStore.setTenant(tenant)
  }

  return {
    currentTenant,
    tenantId,
    tenantName,
    tenantCode,
    isDefaultTenant,
    tenantConfig,
    tenantQuota,
    setTenant
  }
}
