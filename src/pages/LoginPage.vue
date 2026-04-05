<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="loginData.email"
          class="mb-2"
          :rules="[required, emailDomainCheck]"
          clearable
          label="Email"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>
        <v-text-field
          v-model="loginData.password"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required]"
          :type="visible ? 'text' : 'password'"
          clearable
          label="Password"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <br />

        <v-btn
          type="submit"
          :loading="isLoading"
          block
          color="success"
          size="large"
          variant="elevated"
        >
          Sign In
        </v-btn>
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onSignUp"> アカウントを作成する </v-btn>
      <v-btn variant="text" @click="onStart"> ログインせずに開始する </v-btn>
      <v-btn variant="text" @click="onForgotPassword"> パスワードを忘れた場合 </v-btn>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-sheet>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required, emailDomainCheck } from '@/utils/forms/validate'

const loginData = ref({
  email: '',
  password: '',
})
const visible = ref(false)
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()
const store = useStore()

useFirebasePageView('view_login', {})

const onSignUp = () => {
  void logFirebaseAnalyticsEvent('login_signup_link_click', {})
  router.push('/signup')
}

const onStart = () => {
  void logFirebaseAnalyticsEvent('login_guest_start_click', {})
  router.push('/')
}

const onForgotPassword = () => {
  void logFirebaseAnalyticsEvent('login_forgot_password_click', {})
  router.push('/forgot-password')
}

const onSubmit = async (validationPromise) => {
  try {
    isLoading.value = true

    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

    await store.dispatch('auth/login', loginData.value)

    void logFirebaseAnalyticsEvent('login_submit_success', {})

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'ログインしました',
    }

    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('login_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
    snackbar.value = {
      show: true,
      color: 'error',
      message: `ログインに失敗しました: ${error.message}`,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
