<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt?: string
  placeholder?: string
  errorImage?: string
  lazy?: boolean
  width?: string | number
  height?: string | number
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  placeholder: '',
  errorImage: '',
  lazy: true,
  fit: 'cover'
})

const emit = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const isError = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const shouldLoad = ref(!props.lazy)

const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9MjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxcmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I9I2Y1ZjVmNTtzdG9wLW9wYWNpdHk9MC41Ii8+PHN0b3Agb2Zmc2V0PSIxJSIgc3R5bGU9InN0b3AtY29sb3I9I2U4ZThlODtzdG9wLW9wYWNpdHk9MC41Ii8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg=='

const handleLoad = (event: Event) => {
  isLoaded.value = true
  emit('load', event)
}

const handleError = (event: Event) => {
  isError.value = true
  if (props.errorImage && imageRef.value) {
    imageRef.value.src = props.errorImage
  }
  emit('error', event)
}

const initObserver = () => {
  if (!props.lazy || !imageRef.value) return

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          shouldLoad.value = true
          observer.value?.disconnect()
        }
      })
    },
    {
      rootMargin: '50px',
      threshold: 0
    }
  )

  observer.value.observe(imageRef.value)
}

onMounted(() => {
  if (!props.lazy) {
    shouldLoad.value = true
  } else {
    initObserver()
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<template>
  <div
    class="image-container"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
  >
    <img
      v-if="shouldLoad"
      ref="imageRef"
      :src="isError && errorImage ? errorImage : src"
      :alt="alt"
      :style="{ objectFit: fit }"
      class="image"
      :class="{ loaded: isLoaded }"
      @load="handleLoad"
      @error="handleError"
    />
    <img
      v-else
      :src="placeholder || defaultPlaceholder"
      :alt="alt"
      :style="{ objectFit: fit }"
      class="image placeholder"
    />
    <div v-if="!isLoaded && !isError && shouldLoad" class="loading">
      <slot name="loading">
        <div class="loading-spinner"></div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: #f5f7fa;
}

.image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image.loaded {
  opacity: 1;
}

.image.placeholder {
  opacity: 0.5;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #ebeef5;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
