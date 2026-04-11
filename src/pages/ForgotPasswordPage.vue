<template>
  <v-container class="fill-height d-flex align-start justify-center pt-10" fluid>
    <v-card class="pa-6 pa-md-8 w-100" max-width="450" rounded="xl" elevation="1" outlined>
      <v-progress-linear
        v-if="isLoading"
        color="orange-darken-2"
        indeterminate
        absolute
        top
      ></v-progress-linear>

      <div class="text-center mb-8">
        <v-avatar color="orange-lighten-5" size="72" class="mb-4">
          <v-icon size="36" color="orange-darken-2">mdi-lock-reset</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold text-grey-darken-3">パスワードをリセット</h2>
        <p class="text-caption text-grey-darken-1 mt-2">
          登録済みのメールアドレスを入力してください。<br />
          パスワード再設定用のリンクを送信します。
        </p>
      </div>

      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          class="mb-6"
          :rules="[required]"
          clearable
          label="メールアドレス"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          color="orange-darken-2"
          density="comfortable"
        ></v-text-field>

        <v-btn
          type="submit"
          :loading="isLoading"
          block
          color="green-darken-2"
          size="x-large"
          rounded="pill"
          class="font-weight-bold mb-2"
          elevation="0"
        >
          リセットメールを送信
        </v-btn>
      </v-form>

      <v-divider class="my-6"></v-divider>

      <v-btn variant="text" color="grey-darken-1" rounded="pill" size="large" block @click="onBack">
        ログイン画面に戻る
      </v-btn>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" rounded="pill">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { required } from '@/utils/forms/validate'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { sendPasswordReset } from '@/services/authService'

const email = ref('')
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()

useFirebasePageView('view_forgot_password', {})

const onBack = () => {
  void logFirebaseAnalyticsEvent('forgot_password_back_click', {})
  router.push('/login')
}

const onSubmit = async (validationPromise) => {
  try {
    isLoading.value = true

    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

    await sendPasswordReset(email.value)

    void logFirebaseAnalyticsEvent('forgot_password_submit_success', {})

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'リセットメールを送信しました。メールをご確認ください。',
    }

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('forgot_password_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
    snackbar.value = {
      show: true,
      color: 'error',
      message: `送信に失敗しました: ${error.message}`,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
