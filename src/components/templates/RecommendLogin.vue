<template>
  <div class="d-flex flex-column justify-center align-center my-10">
    <p class="text-center text-emphasis pb-6">
      \ <span class="font-weight-bold">ワダイdeワダイ</span>でみんなと新歓に行こう /
    </p>
    <p class="text-center text-medium-emphasis pb-6">
      自分のプロフィールを作成し、<br />新歓に行くことでスタンプが貯められます
    </p>
    <v-btn
      class="mx-3 px-3 my-6 font-weight-bold text-white"
      color="orange"
      elevation="15"
      prepend-icon="mdi-email"
      rounded
      size="x-large"
      @click="router.push('/login')"
    >
      メールアドレスでログイン
    </v-btn>
    <v-btn size="large" variant="plain" @click="router.push('/signup')">アカウントを作成</v-btn>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
