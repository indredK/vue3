<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export interface PermissionButtonProps {
  code?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  icon?: string
  text?: string
  tag?: string
  show?: boolean
}

const props = withDefaults(defineProps<PermissionButtonProps>(), {
  type: 'primary',
  size: 'default',
  disabled: false,
  loading: false,
  show: true
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const userStore = useUserStore()

const hasPermission = computed(() => {
  if (!props.code) return true
  return userStore.hasPermission(props.code)
})

const isVisible = computed(() => {
  if (!props.show) return false
  if (props.code && !hasPermission.value) return false
  return true
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag || 'el-button'"
    v-if="isVisible"
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </component>
</template>
