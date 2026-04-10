<template>
  <v-expansion-panels v-model="panel">
    <v-expansion-panel value="qr" elevation="1" rounded="lg">
      <v-expansion-panel-title class="font-weight-bold text-subtitle-1">
        <v-icon color="primary" class="mr-3">mdi-qrcode</v-icon>
        ワダイdeワダイをシェア
      </v-expansion-panel-title>

      <v-expansion-panel-text class="text-center pt-4">
        <p class="text-caption text-grey-darken-1 mb-4">
          このQRコードを友達に読み取ってもらいましょう！
        </p>

        <div style="min-height: 166px" class="d-flex justify-center align-center">
          <v-fade-transition>
            <v-img
              v-show="isImageVisible"
              :src="qrCodeImage"
              alt="アプリ共有用QRコード"
              max-width="150"
              height="150"
              class="border rounded pa-2 bg-white"
            ></v-img>
          </v-fade-transition>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { ref, watch } from 'vue'
import qrCodeImage from '@/assets/QR/wadai-de-wadai.png'

// パネルの開閉状態を管理する変数
const panel = ref(null)

// 画像の表示/非表示を管理する変数
const isImageVisible = ref(false)

// パネルの状態を監視
watch(panel, (newVal) => {
  if (newVal === 'qr') {
    // パネルが開かれたら、アニメーション完了（約300ms）を待ってから画像を表示
    setTimeout(() => {
      isImageVisible.value = true
    }, 10)
  } else {
    // パネルが閉じられたら即座に画像を非表示に戻す
    isImageVisible.value = false
  }
})
</script>
