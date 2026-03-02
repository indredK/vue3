<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

interface Props {
  permission?: string | string[]
  role?: string | string[]
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false
})

const userStore = useUserStore()

const hasPermission = computed(() => {
  if (!props.permission && !props.role) {
    return true
  }

  if (props.role) {
    const roles = Array.isArray(props.role) ? props.role : [props.role]
    if (roles.some(r => userStore.hasRole(r))) {
      return true
    }
  }

  if (props.permission) {
    const perms = Array.isArray(props.permission) ? props.permission : [props.permission]
    if (perms.some(p => userStore.hasPermission(p))) {
      return true
    }
  }

  return false
})
</script>

<template>
  <slot v-if="hasPermission" :hasPermission="hasPermission" />
  <slot v-else name="fallback" />
</template>
