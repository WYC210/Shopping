import './assets/main.css'
import 'element-plus/theme-chalk/display.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { fingerprintManager } from './utils/fingerprint'
import { httpClient } from './utils/request'
import { tokenManager } from './utils/tokenManager'

// 预先生成指纹
fingerprintManager.getFingerprint().then(() => {
  console.log('Fingerprint initialized')
})

const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
