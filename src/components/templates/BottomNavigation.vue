<template>
  <v-layout>
    <v-bottom-navigation v-model="selectedIndex" class="bottom-nav" active color="orange" grow>
      <v-btn to="/" value="home" @click="logBottomNav('home')">
        <v-icon>mdi-calendar-month</v-icon>
        <span>新歓日程</span>
      </v-btn>

      <v-btn to="/ranking" value="ranking" @click="logBottomNav('ranking')">
        <v-icon>mdi-trophy</v-icon>
        <span>ランキング</span>
      </v-btn>

      <div class="scan-btn-wrapper">
        <v-btn
          to="/reader"
          value="reader"
          class="scan-btn"
          :ripple="false"
          @click="logBottomNav('reader')"
        >
          <div class="scan-icon-bg">
            <v-icon size="32" color="white">mdi-qrcode-scan</v-icon>
            <span class="scan-label-in-circle">読み取る</span>
          </div>
        </v-btn>
      </div>

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
    else if (newPath === '/ranking') selectedIndex.value = 'ranking'
    else if (newPath === '/reader') selectedIndex.value = 'reader'
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
  overflow: visible !important;
  contain: none !important;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.05) !important;
}

.bottom-nav :deep(.v-btn) {
  min-width: 0 !important;
  padding: 0 4px !important;
}

.bottom-nav :deep(.v-btn__content) {
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  font-size: 11px !important;
}

.scan-btn-wrapper {
  position: relative;
  width: 80px; /* min-widthから固定幅へ */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible; /* はみ出しを許可 */
}

.scan-btn {
  /* 下の見切れを解消するために上に移動させる */
  transform: translateY(-8px) !important;

  /* position: absolute を使うと親の高さ制限を無視して上に突き抜ける */
  position: absolute !important;
  bottom: 10px !important;

  height: auto !important;
  background: transparent !important;
  padding: 0 !important;
  min-width: auto !important;
}

.scan-icon-bg {
  width: 72px;
  height: 72px;
  background-color: #ff9800;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 下が見切れないよう、影も考慮して少し上に配置 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 4px solid white;
}

.scan-label-in-circle {
  font-size: 10px;
  color: white;
  font-weight: bold;
  line-height: 1;
  margin-top: 2px;
}

/* 中央ボタンはデフォルトのアクティブ表示を出さない */
:deep(.scan-btn.v-btn--active) > .v-btn__overlay {
  opacity: 0 !important;
}
</style>
