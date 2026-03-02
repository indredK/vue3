import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import i18n from './i18n'
import router from './router'
import App from './App.vue'
import permission from './directives/permission'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import './styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.directive('permission', permission)

app.mount('#app')
