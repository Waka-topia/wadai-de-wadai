<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-card-title class="text-center mb-4">新しいパスワードを設定</v-card-title>
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="newPassword"
          :append-inner-icon="visibleNew ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required]"
          :type="visibleNew ? 'text' : 'password'"
          clearable
          class="mb-2"
          label="新しいパスワード"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="visibleNew = !visibleNew"
        ></v-text-field>
        <v-text-field
          v-model="confirmPassword"
          :append-inner-icon="visibleConfirm ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required, passwordMatch]"
          :type="visibleConfirm ? 'text' : 'password'"
          clearable
          label="パスワードを確認"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="visibleConfirm = !visibleConfirm"
        ></v-text-field>

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
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-sheet>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { resetPassword } from '@/services/authService'

const newPassword = ref('')
const confirmPassword = ref('')
const visibleNew = ref(false)
const visibleConfirm = ref(false)
const form = ref(false)
const isLoading = ref(false)
const oobCode = ref('')
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const route = useRoute()
const router = useRouter()

useFirebasePageView('view_reset_password', {})

const required = (value) => !!value || 'このフィールドは必須です。'
const passwordMatch = (value) => value === newPassword.value || 'パスワードが一致しません。'

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

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'パスワードを変更しました。',
    }

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('reset_password_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
    snackbar.value = {
      show: true,
      color: 'error',
      message: `パスワードの変更に失敗しました: ${error.message}`,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
