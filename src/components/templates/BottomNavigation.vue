<template>
  <v-layout>
    <v-bottom-navigation v-model="selectedIndex" class="bottom-nav" active color="orange" fixed>
      <v-btn v-for="(item, index) in navigationItems" :key="index" :to="item.path">
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const navigationItems = [
  { path: '/eventcal', icon: 'mdi-calendar-clock-outline', label: '新歓日程' },
  { path: '/reader', icon: 'mdi-qrcode-scan', label: '読み取る' },
  { path: '/ranking', icon: 'mdi-account-group', label: 'ランキング' },
  { path: '/mypage', icon: 'mdi-account', label: 'マイページ' },
]

const route = useRoute()
const selectedIndex = ref(0)

// ルート変更時に selectedIndex を更新
watch(
  () => route.path,
  (newPath) => {
    selectedIndex.value = navigationItems.findIndex((item) => item.path === newPath)
  },
  { immediate: true }, // 初回も実行
)
</script>

<style scoped>
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
