import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

interface PermDirectiveValue {
  permission?: string | string[]
  role?: string | string[]
  verify?: boolean
}

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermDirectiveValue>) {
    const { permission: perm, role, verify = true } = binding.value || {}
    const userStore = useUserStore()
    
    const checkPermission = () => {
      if (!perm && !role) {
        console.warn('[Permission Directive] No permission or role specified')
        return false
      }
      
      if (role) {
        const roles = Array.isArray(role) ? role : [role]
        if (roles.some(r => userStore.hasRole(r))) {
          return true
        }
      }
      
      if (perm) {
        const perms = Array.isArray(perm) ? perm : [perm]
        if (perms.some(p => userStore.hasPermission(p))) {
          return true
        }
      }
      
      return false
    }
    
    if (verify && !checkPermission()) {
      el.parentNode?.removeChild(el)
    }
  }
}

export const hasPermission = (permission: string | string[]): boolean => {
  const userStore = useUserStore()
  const perms = Array.isArray(permission) ? permission : [permission]
  return perms.some(p => userStore.hasPermission(p))
}

export const hasRole = (role: string | string[]): boolean => {
  const userStore = useUserStore()
  const roles = Array.isArray(role) ? role : [role]
  return roles.some(r => userStore.hasRole(r))
}

export default permission
