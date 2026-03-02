<script setup lang="ts">
defineProps<{
  loading?: boolean
  skeleton?: boolean
  rows?: number
}>()
</script>

<template>
  <div v-if="loading || skeleton" class="skeleton-container">
    <slot name="skeleton">
      <div v-for="i in (rows || 5)" :key="i" class="skeleton-row">
        <div class="skeleton-line" :style="{ width: `${Math.random() * 40 + 60}%` }"></div>
      </div>
    </slot>
  </div>
  <slot v-else></slot>
</template>

<style scoped>
.skeleton-container {
  width: 100%;
}

.skeleton-row {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.skeleton-row:last-child {
  border-bottom: none;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 50%, #f2f2f2 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
