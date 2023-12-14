import { createApp } from 'vue'
import './style.css'
import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-message.css'
import router from './router'
import App from './App.vue'

createApp(App).use(router).mount('#app')
 