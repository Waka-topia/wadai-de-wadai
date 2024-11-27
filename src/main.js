import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import authService from './services/authService';
import vuetify from "../src/plugins/vuetify";
import "./assets/main.css";

const app = createApp(App);

// アプリケーションを先にマウント
app.use(router);
app.use(store);
app.config.globalProperties.$authService = authService; // authServiceを登録（任意）
app.use(vuetify);
app.mount('#app');

// 認証状態を監視
authService.onAuthStateChanged(async (user) => {
  if (user) {
    const idToken = await user.getIdToken();
    store.commit('auth/setUser', user);
    store.commit('auth/setIdToken', idToken);
    store.commit('auth/setUserId', user.uid);
    console.log('User authenticated:', user);
  } else {
    store.commit('auth/clearAuthState');
    console.log('No user authenticated');
  }
});
