import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export const useMenuStore = defineStore('menu', () => {
  const menuRoutes = ref<RouteRecordRaw[]>([])

  function setMenuRoutes(routes: RouteRecordRaw[]) {
    menuRoutes.value = routes
  }

  function getMenuRoutes() {
    return menuRoutes.value
  }

  return {
    menuRoutes,
    setMenuRoutes,
    getMenuRoutes
  }
})
