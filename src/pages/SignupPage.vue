<template>
  <AuthCard
    icon="mdi-account-plus"
    title="アカウント作成"
    subtitle="ワダイdeワダイを始めよう！"
    :loading="isLoading"
  >
    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="signupData.userName"
        class="mb-4"
        :rules="[required, nameCheck]"
        clearable
        hint="本名は使用しないでください。"
        label="ユーザーネーム"
        placeholder="わかやん"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        color="orange-darken-2"
        density="comfortable"
      ></v-text-field>

      <v-text-field
        v-model="signupData.email"
        class="mb-4"
        :rules="[required, emailDomainCheck]"
        clearable
        hint="大学のメールアドレス以外であれば構いません。"
        label="メールアドレス"
        placeholder="sample@gmail.com"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        color="orange-darken-2"
        density="comfortable"
      ></v-text-field>

      <PasswordField
        v-model="signupData.password"
        class="mb-4"
        :rules="[required, passwordRule]"
        hint="8文字以上にしてください。"
        label="パスワード"
        placeholder="パスワードを入力"
      />

      <div class="d-flex align-center justify-space-between mb-6 bg-grey-lighten-4 pa-3 rounded-lg">
        <v-checkbox
          v-model="agree"
          :rules="[required]"
          color="orange-darken-2"
          hide-details
          class="mt-0"
          :disabled="!hasReadTerms"
        >
          <template #label>
            <span
              class="text-caption font-weight-medium"
              :class="hasReadTerms ? 'text-grey-darken-2' : 'text-grey-lighten-1'"
            >
              利用規約に同意する
              <span
                v-if="!hasReadTerms"
                class="text-orange-darken-2"
                style="font-size: 0.85em; display: block; margin-top: 2px"
              >
                (先に規約をご確認ください)
              </span>
            </span>
          </template>
        </v-checkbox>
        <v-btn
          variant="text"
          color="orange-darken-2"
          size="small"
          class="font-weight-bold"
          @click="openRules"
        >
          規約を読む
        </v-btn>
      </div>

      <v-btn
        type="submit"
        :loading="isLoading"
        :disabled="!isFormValid"
        block
        color="blue-darken-2"
        size="x-large"
        rounded="pill"
        class="font-weight-bold mb-2"
        elevation="0"
      >
        アカウントを作成
      </v-btn>
    </v-form>

    <v-divider class="my-6"></v-divider>

    <v-btn variant="text" color="grey-darken-1" rounded="pill" size="large" block @click="onLogin">
      すでにアカウントをお持ちの方はこちら
    </v-btn>

    <BaseDialog v-model="dialog" title="利用規約" max-width="600">
      <v-card-text class="px-5 pt-2 pb-0">
        <TermsRule />
      </v-card-text>
      <v-card-actions class="justify-center pb-4 pt-4">
        <v-btn
          color="orange-darken-2"
          variant="flat"
          rounded="pill"
          class="px-8 font-weight-bold"
          @click="dialog = false"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </BaseDialog>
  </AuthCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required, passwordRule, nameCheck, emailDomainCheck } from '@/utils/forms/validate'
import AuthCard from '@/components/auth/AuthCard.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import TermsRule from '@/components/templates/TermsRule.vue'
import PasswordField from '@/components/common/PasswordField.vue'

const signupData = ref({
  email: '',
  password: '',
  userName: '',
})
const agree = ref(false)
const isLoading = ref(false)
const dialog = ref(false)

const { notifySuccess, notifyError } = useSnackbar()

// ★ 追加: 規約を読んだかどうかを判定するフラグ
const hasReadTerms = ref(false)

const router = useRouter()
const store = useStore()

useFirebasePageView('view_signup', {})

const openRules = () => {
  void logFirebaseAnalyticsEvent('signup_terms_open_click', {})
  dialog.value = true

  // ★ 追加: 規約を開いたときにフラグをtrueにし、チェックボックスを有効化する
  hasReadTerms.value = true
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

    notifySuccess('サインアップしました')

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('signup_submit_error', {
      errorCode: String(error?.code || 'unknown'),
    })
    notifyError(error)
  } finally {
    isLoading.value = false
  }
}

const isFormValid = computed(() => {
  return Boolean(
    signupData.value.userName &&
    signupData.value.email &&
    signupData.value.password &&
    hasReadTerms.value &&
    agree.value,
  )
})
</script>
