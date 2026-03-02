import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'
export type ThemeColor = 'default' | 'blue' | 'green' | 'purple' | 'red' | 'orange'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: ThemeColor
  primaryColorValue: string
}

const THEME_COLORS: Record<ThemeColor, string> = {
  default: '#409eff',
  blue: '#1890ff',
  green: '#52c41a',
  purple: '#722ed1',
  red: '#f5222d',
  orange: '#fa8c16'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem('theme_mode') as ThemeMode) || 'light')
  const primaryColor = ref<ThemeColor>((localStorage.getItem('theme_color') as ThemeColor) || 'default')
  const primaryColorValue = ref(THEME_COLORS[primaryColor.value])

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem('theme_mode', newMode)
    applyTheme()
  }

  function setPrimaryColor(color: ThemeColor) {
    primaryColor.value = color
    primaryColorValue.value = THEME_COLORS[color]
    localStorage.setItem('theme_color', color)
    applyTheme()
  }

  function applyTheme() {
    const root = document.documentElement

    root.setAttribute('data-theme', mode.value)

    root.style.setProperty('--el-color-primary', primaryColorValue.value)

    const lightColors = ['primary', 'success', 'warning', 'danger', 'error', 'info']
    lightColors.forEach((color) => {
      for (let i = 1; i <= 9; i++) {
        const colorValue = generateColor(primaryColorValue.value, i / 10)
        root.style.setProperty(`--el-color-${color}-light-${i}`, colorValue)
      }
    })

    if (mode.value === 'dark') {
      root.style.setProperty('--bg-color', '#141414')
      root.style.setProperty('--bg-color-page', '#1a1a1a')
      root.style.setProperty('--bg-color-overlay', '#262626')
      root.style.setProperty('--text-color-primary', '#e5e5e5')
      root.style.setProperty('--text-color-regular', '#bfbfbf')
    } else {
      root.style.setProperty('--bg-color', '#ffffff')
      root.style.setProperty('--bg-color-page', '#f0f2f5')
      root.style.setProperty('--bg-color-overlay', '#ffffff')
      root.style.setProperty('--text-color-primary', '#303133')
      root.style.setProperty('--text-color-regular', '#606266')
    }
  }

  function generateColor(hexColor: string, opacity: number): string {
    let r = parseInt(hexColor.slice(1, 3), 16)
    let g = parseInt(hexColor.slice(3, 5), 16)
    let b = parseInt(hexColor.slice(5, 7), 16)

    r = Math.round(r + (255 - r) * opacity)
    g = Math.round(g + (255 - g) * opacity)
    b = Math.round(b + (255 - b) * opacity)

    return `rgb(${r}, ${g}, ${b})`
  }

  function initTheme() {
    applyTheme()
  }

  watch(mode, () => {
    applyTheme()
  })

  watch(primaryColor, () => {
    applyTheme()
  })

  return {
    mode,
    primaryColor,
    primaryColorValue,
    setMode,
    setPrimaryColor,
    initTheme,
    THEME_COLORS
  }
})
