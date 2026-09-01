<template>
  <div class="d-flex flex-column justify-center align-center my-10 px-4 h-100">
    <v-card
      class="pa-6 pa-md-8 text-center w-100"
      max-width="400"
      elevation="0"
      rounded="xl"
      color="orange-lighten-5"
    >
      <v-avatar color="orange-lighten-4" size="80" class="mb-6">
        <v-icon size="40" color="orange-darken-2">mdi-account-group</v-icon>
      </v-avatar>

      <h2 class="text-h6 font-weight-bold text-orange-darken-4 mb-2">
        和大DE話題で<br />みんなと新歓に行こう！
      </h2>

      <p class="text-body-2 text-medium-emphasis mb-8">
        アカウントを作成してログインすると、<br />
        新歓イベントの参加やスケジュールの管理など<br />
        すべての便利機能が利用できます。
      </p>

      <div class="d-flex flex-column w-100" style="gap: 16px">
        <v-btn
          color="orange-darken-2"
          elevation="0"
          rounded="pill"
          size="x-large"
          block
          class="font-weight-bold"
          @click="goSignup"
        >
          アカウントを作成する
        </v-btn>

        <v-btn
          color="orange-darken-2"
          variant="outlined"
          rounded="pill"
          size="large"
          block
          prepend-icon="mdi-email"
          class="font-weight-bold bg-white"
          @click="goLogin"
        >
          メールアドレスでログイン
        </v-btn>
      </div>
    </v-card>
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
