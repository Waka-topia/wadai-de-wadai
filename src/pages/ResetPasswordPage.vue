<template>
  <AuthCard
    icon="mdi-lock-check"
    title="新しいパスワードを設定"
    subtitle="8文字以上の新しいパスワードを入力してください。"
    :loading="isLoading"
  >
    <v-form v-model="form" @submit.prevent="onSubmit">
      <PasswordField
        v-model="newPassword"
        :rules="[required, passwordRule]"
        class="mb-4"
        label="新しいパスワード"
        placeholder="Xa4%j87d"
      />
      <PasswordField
        v-model="confirmPassword"
        :rules="[required, confirmPasswordRule(newPassword)]"
        class="mb-6"
        label="パスワードを確認"
        placeholder="Xa4%j87d"
      />

      <v-btn
        type="submit"
        :disabled="!form"
        :loading="isLoading"
        block
        color="green-darken-2"
        size="x-large"
        rounded="pill"
        class="font-weight-bold"
        elevation="0"
      >
        パスワードを変更する
      </v-btn>
    </v-form>
  </AuthCard>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { resetPassword } from '@/services/authService'
import { confirmPasswordRule, passwordRule, required } from '@/utils/forms/validate'
import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordField from '@/components/common/PasswordField.vue'

const newPassword = ref('')
const confirmPassword = ref('')
const form = ref(false)
const isLoading = ref(false)
const oobCode = ref('')

const { notifySuccess, notifyError } = useSnackbar()

const route = useRoute()
const router = useRouter()

useFirebasePageView('view_reset_password', {})

onMounted(() => {
  const code = route.query.oobCode
  if (!code) {
    router.push('/login')
    return
  }
  oobCode.value = code
})

const onSubmit = async () => {
  try {
    isLoading.value = true
    await resetPassword(oobCode.value, newPassword.value)

    void logFirebaseAnalyticsEvent('reset_password_submit_success', {})

    notifySuccess('パスワードを変更しました。')

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('reset_password_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
    notifyError(error)
  } finally {
    isLoading.value = false
  }
}
</script>
