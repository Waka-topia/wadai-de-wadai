<template>
  <v-layout>
    <v-bottom-navigation v-model="selectedIndex" class="bottom-nav" active color="orange" grow>
      <v-btn to="/" value="home" @click="logBottomNav('home')">
        <v-icon>mdi-calendar-month</v-icon>
        <span>新歓日程</span>
      </v-btn>

      <v-btn to="/reader" value="reader" @click="logBottomNav('reader')">
        <v-icon>mdi-qrcode-scan</v-icon>
        <span>読み取る</span>
      </v-btn>

      <v-btn to="/ranking" value="ranking" @click="logBottomNav('ranking')">
        <v-icon>mdi-trophy</v-icon>
        <span>ランキング</span>
      </v-btn>

      <v-btn to="/mypage" value="mypage" @click="logBottomNav('mypage')">
        <v-icon>mdi-account</v-icon>
        <span>マイページ</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const route = useRoute()

const logBottomNav = (destination) => {
  void logFirebaseAnalyticsEvent('bottom_nav_click', { destination })
}
const selectedIndex = ref('home')

// ルート変更時に selectedIndex を更新
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') selectedIndex.value = 'home'
    else if (newPath === '/reader') selectedIndex.value = 'reader'
    else if (newPath === '/ranking') selectedIndex.value = 'ranking'
    else if (newPath === '/mypage') selectedIndex.value = 'mypage'
    else selectedIndex.value = undefined
  },
  { immediate: true },
)
</script>

<style scoped>
.bottom-nav {
  height: 64px !important;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.05) !important;
}

.bottom-nav :deep(.v-btn) {
  min-width: 0 !important;
  padding: 0 4px !important;
}

.bottom-nav :deep(.v-btn__content) {
  white-space: nowrap !important;
  text-overflow: clip !important;
  font-size: 11px !important;
}
</style>
