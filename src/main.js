import { createApp } from 'vue'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import './registerServiceWorker'
import { setupFirebaseAnalyticsRouter } from '@/services/analyticsService'
import router from './router'
import authService from './services/authService'
import store from './store'

let app

// 認証状態の初回確定を待ってからマウントする。
// 認証情報のストアへの反映と Firestore のユーザードキュメント補完は
// authService.onAuthStateChanged 側が受け持つ（後者は描画を待たせない）。
authService.onAuthStateChanged(() => {
  if (app) return

  app = createApp(App)
  app.use(router)
  app.use(store)
  app.config.globalProperties.$authService = authService // authServiceを登録（任意）
  app.use(vuetify)
  setupFirebaseAnalyticsRouter(router) // analyticsのためのルート計測の登録
  app.mount('#app')
})
