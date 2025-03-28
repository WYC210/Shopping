import './assets/main.css'
import 'element-plus/theme-chalk/display.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { fingerprintManager } from './utils/fingerprint'

// 预先生成指纹
fingerprintManager.getFingerprint().then(() => {
 
})

const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
