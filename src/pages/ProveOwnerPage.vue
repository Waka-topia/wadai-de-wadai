<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-select
          v-model="selectedGroup"
          :items="allGroups"
          :rules="[required]"
          item-title="name"
          item-value="id"
          return-object
          label="団体名"
          variant="outlined"
          density="comfortable"
          required
          persistent-hint
          prepend-inner-icon="mdi-domain"
        />
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
        <v-text-field
          v-model="confirmPassword"
          :append-inner-icon="confirmVisible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required, passwordRule, confirmPasswordRule(password)]"
          :type="confirmVisible ? 'text' : 'password'"
          clearable
          hint="パスワードの確認のため、もう一度入力してください。"
          label="Password"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="confirmVisible = !confirmVisible"
        ></v-text-field>

        <v-btn
          type="submit"
          :loading="isLoading"
          block
          color="orange"
          size="large"
          variant="elevated"
        >
          申請する
        </v-btn>

        <p class="text-caption mt-4 px-2 text-grey">
          このパスワードは団体ごとに任意のものを設定してください。
          したがって、団体ごとにパスワードを厳重に保管し、団体メンバーのみで共有してください。
        </p>

        <v-btn
          variant="plain"
          class="mt-3"
          @click="
            snackbar = {
              show: true,
              color: 'info',
              message: 'パスワードリセット機能は現在準備中です。',
            }
          "
        >
          パスワードを忘れた場合はこちら
        </v-btn>
      </v-form>
    </v-card>
  </v-sheet>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { required, passwordRule, confirmPasswordRule } from '@/utils/forms/validate'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { allGroups } from '@/data/groups'
import { submitOwnership } from '@/services/proveService'

const selectedGroup = ref(null)
const password = ref('')
const confirmPassword = ref('')
const visible = ref(false)
const confirmVisible = ref(false)
const form = ref(false)
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()
const store = useStore()

useFirebasePageView('view_prove_owner', {})

const onSubmit = async (validationPromise) => {
  try {
    isLoading.value = true

    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

    const selected = selectedGroup.value

    // 代表者証明の申請フローを実行
    // Note: 本来はstoreで管理しているユーザデータも同期更新する
    await submitOwnership({
      organizationId: selected.id,
      password: password.value,
      userId: store.getters['auth/userId'],
      userNameSnapshot: store.getters['auth/displayName'],
      emailSnapshot: store.getters['auth/email'],
      groupNameSnapshot: selected.name,
    })

    void logFirebaseAnalyticsEvent('prove_owner_submit_success', {
      organizationId: String(selected.id),
    })

    snackbar.value = {
      show: true,
      color: 'success',
      message: '申請を受け付けました',
    }

    setTimeout(() => {
      router.push('/prove-owner/description')
    }, 1000)
  } catch (error) {
    void logFirebaseAnalyticsEvent('prove_owner_submit_error', {})
    snackbar.value = {
      show: true,
      color: 'error',
      message: error.message,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
