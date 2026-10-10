<template>
  <v-container class="fill-height d-flex align-start justify-center" fluid>
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
          <v-icon size="36" color="orange-darken-2">mdi-login</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold text-grey-darken-3">ログイン</h2>
        <p class="text-caption text-grey-darken-1 mt-1">ワダイdeワダイへようこそ</p>
      </div>

      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="loginData.email"
          class="mb-4"
          :rules="[required, emailDomainCheck]"
          clearable
          label="メールアドレス"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          color="orange-darken-2"
          density="comfortable"
        ></v-text-field>

        <PasswordField
          v-model="loginData.password"
          :rules="[required]"
          label="パスワード"
          placeholder="パスワードを入力"
        />

        <div class="d-flex justify-end mb-6 mt-n2">
          <a
            href="#"
            class="text-caption text-orange-darken-2 font-weight-medium text-decoration-none"
            @click.prevent="onForgotPassword"
          >
            パスワードをお忘れですか？
          </a>
        </div>

        <v-btn
          type="submit"
          :loading="isLoading"
          :disabled="!isFormValid"
          block
          color="orange-darken-2"
          size="x-large"
          rounded="pill"
          class="font-weight-bold mb-2"
          elevation="0"
        >
          ログイン
        </v-btn>
      </v-form>

      <v-divider class="my-6"></v-divider>

      <div class="d-flex flex-column" style="gap: 12px">
        <v-btn
          variant="outlined"
          color="orange-darken-2"
          rounded="pill"
          size="large"
          block
          class="font-weight-bold bg-white"
          @click="onSignUp"
        >
          新しいアカウントを作成
        </v-btn>

        <v-btn
          variant="text"
          color="grey-darken-1"
          rounded="pill"
          size="large"
          block
          @click="onStart"
        >
          ログインせずに開始する
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required, emailDomainCheck } from '@/utils/forms/validate'
import PasswordField from '@/components/common/PasswordField.vue'

const loginData = ref({
  email: '',
  password: '',
})
const isLoading = ref(false)

const { notifySuccess, notifyError } = useSnackbar()

const router = useRouter()
const route = useRoute()
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

    notifySuccess('ログインしました')

    setTimeout(() => {
      // ガードによるリダイレクト先がある場合はそこへ、なければトップへ
      const redirectPath = route.query.redirect || '/'
      router.push(String(redirectPath))
    }, 1000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('login_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
    notifyError(error)
  } finally {
    isLoading.value = false
  }
}

const isFormValid = computed(() => {
  return Boolean(loginData.value.email && loginData.value.password)
})
</script>
