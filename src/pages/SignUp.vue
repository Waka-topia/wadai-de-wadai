<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="username"
          class="mb-2"
          :rules="[required, nameCheck]"
          clearable
          hint="本名は使用しないでください。"
          label="Username"
          placeholder="わかやん"
        />
        <v-text-field
          v-model="email"
          class="mb-2"
          :rules="[required, emailDomainCheck]"
          clearable
          hint="架空のメールアドレスでも構いません。"
          label="Email"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required, passwordRule]"
          :type="visible ? 'text' : 'password'"
          clearable
          hint="8文字以上にしてください。"
          label="Password"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <!-- モーダルを表示するボタン -->
        <v-btn color="primary" text @click="openRules">利用規約を確認</v-btn>

        <v-checkbox
          v-model="agree"
          :rules="[required, requiredAgree]"
          label="利用規約に同意する"
          color="orange"
        />

        <br />

        <v-btn
          type="submit"
          :disabled="!form || !agree"
          :loading="isLoading"
          block
          color="primary"
          size="large"
          variant="elevated"
        >
          Sign Up
        </v-btn>
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onLogin"> アカウントをお持ちの方はこちら </v-btn>
    </v-card>
  </v-sheet>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>

  <!-- モーダル -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-text>
        <TermsRule />
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="dialog = false">閉じる</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import TermsRule from '@/components/templates/TermsRule.vue'

const username = ref('')
const email = ref('')
const password = ref('')
const visible = ref(false)
const agree = ref(false)
const form = ref(false)
const isLoading = ref(false)
const dialog = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()
const store = useStore()

const required = (value) => !!value || 'このフィールドは必須です。'

const requiredAgree = (value) => {
  if (!value) {
    return '利用規約に同意する必要があります。'
  }
  return true
}

const nameCheck = (value) => {
  if (value && value.length < 2) {
    return 'ユーザー名は2文字以上で入力してください'
  }
  return true
}

const emailDomainCheck = (value) => {
  if (value && value.endsWith('@wakayama-u.ac.jp')) {
    return 'このドメインは使用できません'
  }
  return true
}

const passwordRule = (value) => {
  if (value && value.length < 8) {
    return 'パスワードは8文字以上で入力してください'
  }
  return true
}

const openRules = () => {
  dialog.value = true
}

const onLogin = () => {
  router.push('/login')
}

const onSubmit = async () => {
  try {
    isLoading.value = true
    await store.dispatch('auth/signup', {
      email: email.value,
      password: password.value,
      username: username.value,
    })

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'サインアップしました',
    }

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: `サインアップに失敗しました。${error.message}`,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
