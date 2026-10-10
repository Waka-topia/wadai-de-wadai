<template>
  <AuthCard
    icon="mdi-login"
    title="ログイン"
    subtitle="ワダイdeワダイへようこそ"
    :loading="isLoading"
  >
    <FormFieldDefaults>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="loginData.email"
          class="mb-4"
          :rules="[required, emailDomainCheck]"
          clearable
          label="メールアドレス"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
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
    </FormFieldDefaults>

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
  </AuthCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required, emailDomainCheck } from '@/utils/forms/validate'
import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordField from '@/components/common/PasswordField.vue'
import FormFieldDefaults from '@/components/common/FormFieldDefaults.vue'

const loginData = ref({
  email: '',
  password: '',
})

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

const { isLoading, submit: onSubmit } = useFormSubmit({
  action: async () => {
    await store.dispatch('auth/login', loginData.value)
    void logFirebaseAnalyticsEvent('login_submit_success', {})
  },
  successMessage: 'ログインしました',
  // ガードによるリダイレクト先がある場合はそこへ、なければトップへ
  redirectTo: () => String(route.query.redirect || '/'),
  errorEvent: 'login_submit_error',
})

const isFormValid = computed(() => {
  return Boolean(loginData.value.email && loginData.value.password)
})
</script>
