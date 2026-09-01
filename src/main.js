import { createApp } from 'vue'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import './registerServiceWorker'
import { setupFirebaseAnalyticsRouter } from '@/services/analyticsService'
import router from './router'
import authService from './services/authService'
import store from './store'

let app

// 認証状態の初回取得を待機してからアプリケーションをマウント
authService.onAuthStateChanged(async (user) => {
  if (user) {
    const idToken = await user.getIdToken()
    store.commit('auth/setUser', user)
    store.commit('auth/setIdToken', idToken)
    store.commit('auth/setUserId', user.uid)
  } else {
    store.commit('auth/clearAuthState')
  }

  // 初回のみアプリをマウント
  if (!app) {
    app = createApp(App)
    app.use(router)
    app.use(store)
    app.config.globalProperties.$authService = authService // authServiceを登録（任意）
    app.use(vuetify)
    setupFirebaseAnalyticsRouter(router) // analyticsのためのルート計測の登録
    app.mount('#app')
  }
})
