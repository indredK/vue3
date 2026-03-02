import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Role, Permission, PermissionTree } from '@/types/user'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = shallowRef<Permission[]>([])
  const permissionTree = shallowRef<PermissionTree[]>([])
  const roles = shallowRef<Role[]>([])
  const userPermissions = ref<string[]>([])

  // 设置权限列表
  function setPermissions(data: Permission[]) {
    permissions.value = data
  }

  // 设置权限树
  function setPermissionTree(data: PermissionTree[]) {
    permissionTree.value = data
  }

  // 设置角色列表
  function setRoles(data: Role[]) {
    roles.value = data
  }

  // 设置用户权限
  function setUserPermissions(data: string[]) {
    userPermissions.value = data
  }

  // 检查是否有某个权限
  function hasPermission(code: string): boolean {
    return userPermissions.value.includes(code)
  }

  // 检查是否有某些权限（满足其一即可）
  function hasAnyPermission(codes: string[]): boolean {
    return codes.some(code => userPermissions.value.includes(code))
  }

  // 检查是否拥有所有权限
  function hasAllPermissions(codes: string[]): boolean {
    return codes.every(code => userPermissions.value.includes(code))
  }

  // 重置 store
  function reset() {
    permissions.value = []
    permissionTree.value = []
    roles.value = []
    userPermissions.value = []
  }

  return {
    permissions,
    permissionTree,
    roles,
    userPermissions,
    setPermissions,
    setPermissionTree,
    setRoles,
    setUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reset
  }
})
