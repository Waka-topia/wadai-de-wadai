<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-card-title class="text-center mb-4">新しいパスワードを設定</v-card-title>
      <v-form v-model="form" @submit.prevent="onSubmit">
        <PasswordField
          v-model="newPassword"
          :rules="[required, passwordRule]"
          class="mb-2"
          label="新しいパスワード"
          placeholder="Xa4%j87d"
        />
        <PasswordField
          v-model="confirmPassword"
          :rules="[required, confirmPasswordRule(newPassword)]"
          label="パスワードを確認"
          placeholder="Xa4%j87d"
        />

        <br />

        <v-btn
          type="submit"
          :disabled="!form"
          :loading="isLoading"
          block
          color="success"
          size="large"
          variant="elevated"
        >
          パスワードを変更する
        </v-btn>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { resetPassword } from '@/services/authService'
import { confirmPasswordRule, passwordRule, required } from '@/utils/forms/validate'
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
