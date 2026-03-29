<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-card-title class="text-center mb-4">パスワードをリセット</v-card-title>
      <v-card-text class="text-center text-body-2 mb-2">
        登録済みのメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
      </v-card-text>
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          class="mb-2"
          :rules="[required]"
          clearable
          label="Email"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
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
          リセットメールを送信
        </v-btn>
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onBack">ログインに戻る</v-btn>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-sheet>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendPasswordReset } from '@/services/authService'

const email = ref('')
const form = ref(false)
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()

const required = (value) => !!value || 'このフィールドは必須です。'

const onBack = () => {
  router.push('/login')
}

const onSubmit = async () => {
  try {
    isLoading.value = true
    await sendPasswordReset(email.value)

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'リセットメールを送信しました。メールをご確認ください。',
    }

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
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
