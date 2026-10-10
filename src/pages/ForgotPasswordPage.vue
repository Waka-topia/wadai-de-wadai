<template>
  <AuthCard icon="mdi-lock-reset" title="パスワードをリセット" :loading="isLoading">
    <template #subtitle>
      <p class="text-caption text-grey-darken-1 mt-2">
        登録済みのメールアドレスを入力してください。<br />
        パスワード再設定用のリンクを送信します。
      </p>
    </template>

    <FormFieldDefaults>
      <v-form v-model="isFormValid" @submit.prevent="onSubmit">
        <EmailField v-model="email" class="mb-6" />

        <v-btn
          type="submit"
          :loading="isLoading"
          :disabled="!isFormValid"
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
    </FormFieldDefaults>

    <v-divider class="my-6"></v-divider>

    <v-btn variant="text" color="grey-darken-1" rounded="pill" size="large" block @click="onBack">
      ログイン画面に戻る
    </v-btn>
  </AuthCard>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { sendPasswordReset } from '@/services/authService'
import AuthCard from '@/components/auth/AuthCard.vue'
import EmailField from '@/components/common/EmailField.vue'
import FormFieldDefaults from '@/components/common/FormFieldDefaults.vue'

const email = ref('')
// 全項目が入力ルールを満たしているか（v-form が更新する）
const isFormValid = ref(false)

const router = useRouter()

useFirebasePageView('view_forgot_password', {})

const onBack = () => {
  void logFirebaseAnalyticsEvent('forgot_password_back_click', {})
  router.push('/login')
}

const { isLoading, submit: onSubmit } = useFormSubmit({
  action: async () => {
    await sendPasswordReset(email.value)
    void logFirebaseAnalyticsEvent('forgot_password_submit_success', {})
  },
  successMessage: 'リセットメールを送信しました。メールをご確認ください。',
  redirectTo: '/login',
  redirectDelay: 3000,
  errorEvent: 'forgot_password_submit_error',
})
</script>
