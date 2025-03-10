import './assets/main.css'
import 'element-plus/theme-chalk/display.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './utils/tokenManager' // 确保 TokenManager 被初始化


const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
