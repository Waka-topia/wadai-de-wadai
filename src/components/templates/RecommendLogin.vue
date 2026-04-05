<template>
  <div class="d-flex flex-column justify-center align-center my-10">
    <p class="text-center text-emphasis pb-6">
      &#92; <span class="font-weight-bold">ワダイdeワダイ</span>でみんなと新歓に行こう &frasl;
    </p>
    <p class="text-center text-medium-emphasis pb-6">
      自分のアカウントを作成し <br />
      ログインすることで<br />
      たくさんの便利機能が利用できます!
    </p>
    <v-btn
      class="mx-3 px-3 my-6 font-weight-bold text-white"
      color="orange"
      elevation="15"
      prepend-icon="mdi-email"
      rounded
      size="x-large"
      @click="goLogin"
    >
      メールアドレスでログイン
    </v-btn>
    <v-btn size="large" variant="plain" @click="goSignup">アカウントを作成</v-btn>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const router = useRouter()

const goLogin = () => {
  void logFirebaseAnalyticsEvent('recommend_login_click', { destination: 'login' })
  router.push('/login')
}

const goSignup = () => {
  void logFirebaseAnalyticsEvent('recommend_login_click', { destination: 'signup' })
  router.push('/signup')
}
</script>
