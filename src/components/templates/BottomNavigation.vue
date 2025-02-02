<template>
  <v-layout>
    <v-bottom-navigation v-model="selectedIndex" color="orange" active fixed class="bottom-nav">
      <v-btn v-for="(item, index) in navigationItems" :key="index" :to="item.path">
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

// ナビゲーションのアイテムを配列で定義
const navigationItems = [
  { path: "/eventcal", icon: "mdi-calendar-clock-outline", label: "新歓日程" },
  { path: "/reader", icon: "mdi-qrcode-scan", label: "読み取る" },
  { path: "/ranking", icon: "mdi-account-group", label: "ランキング" },
  { path: "/mypage", icon: "mdi-account", label: "マイページ" }
];

// 現在のルートを取得
const route = useRoute();

// 現在のルートに基づいて選択インデックスを計算
const selectedIndex = computed(() => {
  return navigationItems.findIndex(item => item.path === route.path);
});
</script>

<style scoped>
.bottom-nav {
  /* iPhoneのホームインジケーター対策 */
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
