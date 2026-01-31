<template>
  <v-layout>
    <v-bottom-navigation v-model="selectedIndex" class="bottom-nav" active color="orange" grow>
      <v-btn to="/eventcal" value="eventcal">
        <v-icon>mdi-calendar-month</v-icon>
        <!-- <span>新歓日程</span> -->
      </v-btn>

      <v-btn to="/reader" value="reader">
        <v-icon>mdi-qrcode-scan</v-icon>
        <!-- <span>読み取る</span> -->
      </v-btn>

      <div class="home-btn-wrapper">
        <v-btn to="/" value="home" class="home-btn" :ripple="false">
          <div class="home-icon-bg">
            <v-icon size="32" color="white">mdi-home</v-icon>
          </div>
          <!-- <span class="home-label">ホーム</span> -->
        </v-btn>
      </div>

      <v-btn to="/jobs" value="jobs">
        <v-icon>mdi-briefcase-search</v-icon>
        <!-- <span>求人情報</span> -->
      </v-btn>

      <v-btn to="/mypage" value="mypage">
        <v-icon>mdi-account</v-icon>
        <!-- <span>マイページ</span> -->
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const selectedIndex = ref('home')

// ルート変更時に selectedIndex を更新
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') selectedIndex.value = 'home'
    else if (newPath === '/eventcal') selectedIndex.value = 'eventcal'
    else if (newPath === '/reader') selectedIndex.value = 'reader'
    else if (newPath === '/jobs') selectedIndex.value = 'jobs'
    else if (newPath === '/mypage') selectedIndex.value = 'mypage'
    else selectedIndex.value = undefined
  },
  { immediate: true },
)
</script>

<style scoped>
.bottom-nav {
  height: 64px !important; /* なぜか高さが足りない場合があるので強制 */
  padding-bottom: env(safe-area-inset-bottom);
  overflow: visible !important; /* ホームボタンが飛び出すように */
  contain: none !important; /* ホームボタンが飛び出すように */
}

.home-btn-wrapper {
  position: relative;
  width: min-content;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.home-btn {
  height: 100% !important;
  margin-top: -20px; /* 上に突き出させる */
  opacity: 1 !important; /* アクティブ時の透明度変化を無効化 */
  background: transparent !important;
}

.home-icon-bg {
  width: 56px;
  height: 56px;
  background-color: #ff9800; /* Orange */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  border: 4px solid white; /* 背景色と同じにして切り抜き感を出す */
  margin-bottom: 4px;
}

.home-label {
  font-size: 10px;
  color: #ff9800;
  font-weight: bold;
}

/* 通常のボタンのアクティブ状態のスタイル調整 */
:deep(.v-btn--active) > .v-btn__overlay {
  opacity: 0.1;
}

/* ホームボタンの強制スタイル */
:deep(.home-btn.v-btn--active) > .v-btn__overlay {
  opacity: 0 !important;
}
</style>
