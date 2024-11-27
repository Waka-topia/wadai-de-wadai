<template>
    <v-layout class="overflow-visible" style="height: 56px;">
      <v-bottom-navigation
        v-model="value"
        color="primary"
        active
      >
        <v-btn @click="navigateTo('/campus-map')">
          <v-icon>mdi-map</v-icon>
          マップ
        </v-btn>
  
        <v-btn @click="navigateTo('/qrscanner')">
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
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const value = ref(0);
  const router = useRouter();
  
  // ページ遷移用関数
  function navigateTo(route) {
    router.push(route);
  }
  </script>
  