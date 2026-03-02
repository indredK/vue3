import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  const permissions = computed(() => userStore.permissions)
  const roles = computed(() => userStore.roles)
  const isAdmin = computed(() => roles.value.includes('admin'))

  function hasPermission(permission: string | string[]): boolean {
    if (!permission || permission.length === 0) {
      return true
    }

    if (isAdmin.value) {
      return true
    }

    const perms = Array.isArray(permission) ? permission : [permission]
    return perms.some(p => permissions.value.includes(p))
  }

  function hasRole(role: string | string[]): boolean {
    if (!role || role.length === 0) {
      return true
    }

    const rolesArr = Array.isArray(role) ? role : [role]
    return rolesArr.some(r => roles.value.includes(r))
  }

  function hasAnyPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true
    }

    return permissions.some(p => userStore.permissions.includes(p))
  }

  function hasAllPermissions(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true
    }

    return permissions.every(p => userStore.permissions.includes(p))
  }

  return {
    permissions,
    roles,
    isAdmin,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  }
}
