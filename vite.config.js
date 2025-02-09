import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate', // サービスワーカーの自動更新
      manifest: {
        name: '和大DE和大',
        short_name: 'ワダダ',
        description: '和大DE和大は、新入生が友達に自慢をするためのツールです',
        theme_color: '#FF9900',
        icons: [
          {
            src: '/icons/AppIcon192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',// 拡張子に合わせる
          },
          {
            src: '/icons/AppIcon512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
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
});
