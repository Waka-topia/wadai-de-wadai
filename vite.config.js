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
      workbox: {
        // スタンプ画像は112枚あるためプリキャッシュせず、表示したものだけ実行時にキャッシュする
        globIgnores: ['**/stamps/**'],
        runtimeCaching: [
          {
            urlPattern: /\/stamps\/[\w-]+\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'stamp-images',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'ワダイdeワダイ(2025年4月復刻版)',
        short_name: 'ワダイ復刻版',
        description: '2025年新歓シーズンのスタンプラリーを復刻したデモ版',
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
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          // Vue関連を別チャンクに分離
          'vue-vendor': ['vue', 'vue-router', 'vuex'],
          // QR読み取りは /reader を開いたときだけ必要なので分離
          'qr-reader': ['vue-qrcode-reader'],
        },
      },
    },
    // チャンクサイズ警告の閾値を調整（オプション）
    chunkSizeWarningLimit: 600,
  },
})
