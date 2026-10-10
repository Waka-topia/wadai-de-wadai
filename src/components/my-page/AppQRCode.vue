<template>
  <ExpandableSection
    v-model="isOpen"
    icon="mdi-qrcode"
    title="ワダイdeワダイをシェア"
    content-class="text-center pt-4"
  >
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
  </ExpandableSection>
</template>

<script setup>
import { onUnmounted, ref, watch } from 'vue'
import qrCodeImage from '@/assets/QR/wadai-de-wadai.png'
import ExpandableSection from '@/components/common/ExpandableSection.vue'

// パネルが開いているか
const isOpen = ref(false)

// 画像の表示/非表示を管理する変数
const isImageVisible = ref(false)

// タイマーIDを保持する変数
let timer = null

// コンポーネント破棄時にタイマーをクリア
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

// パネルの状態を監視
watch(isOpen, (open) => {
  // 既存のタイマーがあればクリアしてレースコンディションを防ぐ
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  if (open) {
    // パネルが開かれたら、アニメーション完了（約300ms）を待ってから画像を表示
    timer = setTimeout(() => {
      isImageVisible.value = true
      timer = null
    }, 300)
  } else {
    // パネルが閉じられたら即座に画像を非表示に戻す
    isImageVisible.value = false
  }
})
</script>
