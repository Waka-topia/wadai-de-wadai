import { createApp } from 'vue'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import authService from './services/authService'
import { getNextShinkan } from './services/nextShinkanService'
import store from './store'

try {
  const app = createApp(App)

  // アプリケーションを先にマウント
  app.use(router)
  app.use(store)
  app.config.globalProperties.$authService = authService // authServiceを登録（任意）
  app.use(vuetify)
  app.mount('#app')

  // 認証状態を監視（エラーハンドリング付き）
  try {
    authService.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken()
          store.commit('auth/setUser', user)
          store.commit('auth/setIdToken', idToken)
          store.commit('auth/setUserId', user.uid)
          const nextShinkan = await getNextShinkan(user.uid)
          store.commit('shinkan/setNextShinkan', nextShinkan)
          console.log('User authenticated:', user)
        } catch (error) {
          console.error('認証状態の更新エラー:', error)
        }
      } else {
        store.commit('auth/clearAuthState')
        console.log('No user authenticated')
      }
    })
  } catch (error) {
    console.error('認証サービスの初期化エラー:', error)
    console.error('Firebase設定を確認してください。')
  }
} catch (error) {
  console.error('アプリケーションの初期化エラー:', error)
  document.getElementById('app').innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>アプリケーションの初期化に失敗しました</h1>
      <p>ブラウザのコンソールを確認してください。</p>
      <p>Firebase設定（.envファイル）が正しく設定されているか確認してください。</p>
    </div>
  `
}
