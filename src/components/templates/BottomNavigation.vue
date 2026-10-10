<template>
  <v-layout>
    <v-bottom-navigation v-model="selectedIndex" class="bottom-nav" active color="orange" grow>
      <v-btn
        v-for="item in leftItems"
        :key="item.value"
        :to="item.to"
        :value="item.value"
        @click="logBottomNav(item.value)"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>

      <!-- ホームだけは中央の丸ボタンにする -->
      <div class="home-btn-wrapper">
        <v-btn
          :to="homeItem.to"
          :value="homeItem.value"
          class="home-btn"
          :ripple="false"
          @click="logBottomNav(homeItem.value)"
        >
          <div class="home-icon-bg">
            <v-icon size="32" color="white">{{ homeItem.icon }}</v-icon>
            <span class="home-label-in-circle">{{ homeItem.label }}</span>
          </div>
        </v-btn>
      </div>

      <v-btn
        v-for="item in rightItems"
        :key="item.value"
        :to="item.to"
        :value="item.value"
        @click="logBottomNav(item.value)"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findNavValue, mainNavItems } from '@/config/navigation'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const route = useRoute()

const homeItem = mainNavItems.find((item) => item.value === 'home')
const otherItems = mainNavItems.filter((item) => item.value !== 'home')
// ホームの丸ボタンを中央に置くため、残りを左右 2 つずつに分ける
const leftItems = otherItems.slice(0, 2)
const rightItems = otherItems.slice(2)

const logBottomNav = (destination) => {
  void logFirebaseAnalyticsEvent('bottom_nav_click', { destination })
}
const selectedIndex = ref('home')

// ルート変更時に selectedIndex を更新
watch(
  () => route.path,
  (newPath) => {
    selectedIndex.value = findNavValue(newPath)
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

.home-btn-wrapper {
  position: relative;
  width: 80px; /* min-widthから固定幅へ */
  display: flex;
  justify-content: center;
  align-items: center; /* flex-endからcenterに変更（あるいは指定なし） */
  overflow: visible; /* はみ出しを許可 */
}

.home-btn {
  /* 下の見切れを解消するために上に移動させる */
  transform: translateY(-8px) !important;

  /* position: absolute を使うと親の高さ制限を無視して上に突き抜けます */
  position: absolute !important;
  bottom: 10px !important; /* 数値を大きくするほど上に上がります */

  height: auto !important;
  background: transparent !important;
  padding: 0 !important;
  min-width: auto !important;
}

.home-icon-bg {
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

.home-label-in-circle {
  font-size: 10px;
  color: white;
  font-weight: bold;
  line-height: 1;
  margin-top: 2px;
}

/* Hide the default overlay interaction for the custom button */
:deep(.home-btn.v-btn--active) > .v-btn__overlay {
  opacity: 0 !important;
}
</style>
