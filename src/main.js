import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' // ストアをインポート
import authService from './services/authService' // authService をインポート

const app = createApp(App)

app.use(router)
app.use(store) // ストアをアプリケーションに登録

// authService をストアで使えるように登録（任意）
app.config.globalProperties.$authService = authService;

app.mount('#app')
