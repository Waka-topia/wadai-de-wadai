<template>
  <v-layout class="overflow-visible" style="height: 56px;">
    <v-bottom-navigation
      v-model="value"
      color="orange"
      active
    >
      <v-btn @click="navigateTo('/campus-map')">
        <v-icon>mdi-map</v-icon>
        マップ
      </v-btn>

      <v-btn @click="navigateTo('/reader')">
        <v-icon>mdi-qrcode-scan</v-icon>
        読み取る
      </v-btn>

      <v-btn @click="navigateTo('/ranking')">
        <v-icon>mdi-account-group</v-icon>
        <span>ランキング</span>
      </v-btn>

      <v-btn @click="navigateTo('/mypage')">
        <v-icon>mdi-account</v-icon>
        <span>マイページ</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const value = ref(0); // ナビゲーションの選択状態
const router = useRouter();
const route = useRoute(); // 現在のルートを取得

// ページ遷移用関数
function navigateTo(routePath) {
  router.push(routePath);
}

// ルートごとに対応するvalueを設定
watch(
  () => route.path, // 現在のルートのパスを監視
  (newPath) => {
    switch (newPath) {
      case "/campus-map":
        value.value = 0;
        break;
      case "/reader":
        value.value = 1;
        break;
      case "/ranking":
        value.value = 2;
        break;
      case "/mypage":
        value.value = 3;
        break;
      default:
        value.value = 0; // デフォルトの値
    }
  },
  { immediate: true } // 初期読み込み時も適用
);
</script>
