import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import i18n from './i18n'
import router from './router'
import App from './App.vue'
import permission from './directives/permission'
import { useThemeStore } from './stores/theme'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import './styles/index.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.directive('permission', permission)

const themeStore = useThemeStore(pinia)
themeStore.initTheme()

app.mount('#app')
