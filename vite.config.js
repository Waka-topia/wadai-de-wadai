import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate', // サービスワーカーの自動更新
      manifest: {
        name: 'ワダイdeワダイ',
        short_name: 'ワダイdeワダイ',
        description: 'ワダイdeワダイは、新入生が友達に自慢をするためのツールです',
        theme_color: '#FF9900',
        icons: [
          {
            src: '/icons/AppIcon512-512.png',
            sizes: '512x512',
            type: 'image/png', // 拡張子に合わせる
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vuetifyを別チャンクに分離
          vuetify: ['vuetify', 'vuetify/components', 'vuetify/directives'],
          // Firebaseを別チャンクに分離
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics',
          ],
          // Vue関連を別チャンクに分離
          'vue-vendor': ['vue', 'vue-router', 'vuex'],
        },
      },
    },
    // チャンクサイズ警告の閾値を調整（オプション）
    chunkSizeWarningLimit: 600,
  },
})
