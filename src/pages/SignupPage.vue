<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="signupData.userName"
          class="mb-2"
          :rules="[required, nameCheck]"
          clearable
          hint="本名は使用しないでください。"
          label="Username"
          placeholder="わかやん"
        />
        <v-text-field
          v-model="signupData.email"
          class="mb-2"
          :rules="[required, emailDomainCheck]"
          clearable
          hint="架空のメールアドレスでも構いません。"
          label="Email"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>
        <v-text-field
          v-model="signupData.password"
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

        <v-checkbox v-model="agree" :rules="[required]" label="利用規約に同意する" color="orange" />

        <br />

        <v-btn
          type="submit"
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
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required, passwordRule, nameCheck, emailDomainCheck } from '@/utils/forms/validate'
import TermsRule from '@/components/templates/TermsRule.vue'

const signupData = ref({
  email: '',
  password: '',
  userName: '',
})
const visible = ref(false)
const agree = ref(false)
const isLoading = ref(false)
const dialog = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()
const store = useStore()

useFirebasePageView('view_signup', {})

const openRules = () => {
  void logFirebaseAnalyticsEvent('signup_terms_open_click', {})
  dialog.value = true
}

const onLogin = () => {
  void logFirebaseAnalyticsEvent('signup_login_link_click', {})
  router.push('/login')
}

const onSubmit = async (validationPromise) => {
  try {
    isLoading.value = true

    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

    await store.dispatch('auth/signup', signupData.value)

    void logFirebaseAnalyticsEvent('signup_submit_success', {})

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'サインアップしました',
    }

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('signup_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
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
