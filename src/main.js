import { createApp } from 'vue'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import './registerServiceWorker'
import { setupFirebaseAnalyticsRouter } from '@/services/analyticsService'
import router from './router'
import authService from './services/authService'
import { getNextShinkan } from './services/nextShinkanService'
import store from './store'

const app = createApp(App)

// アプリケーションを先にマウント
app.use(router)
app.use(store)
app.config.globalProperties.$authService = authService // authServiceを登録（任意）
app.use(vuetify)
setupFirebaseAnalyticsRouter(router) // analyticsのためのルート計測の登録
app.mount('#app')

// 認証状態を監視
authService.onAuthStateChanged(async (user) => {
  if (user) {
    const idToken = await user.getIdToken()
    store.commit('auth/setUser', user)
    store.commit('auth/setIdToken', idToken)
    store.commit('auth/setUserId', user.uid)
    const nextShinkan = await getNextShinkan(user.uid)
    store.commit('shinkan/setNextShinkan', nextShinkan)
    console.log('User authenticated:', user)
  } else {
    store.commit('auth/clearAuthState')
    console.log('No user authenticated')
  }
})
