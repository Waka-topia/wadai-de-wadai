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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { required, passwordRule, confirmPasswordRule } from '@/utils/forms/validate'
import { useStore } from 'vuex'
import { allGroups } from '@/data/groups'
import { updateProveOwnerApprovalService, submitOwnership } from '@/services/proveService'

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

const userId = computed(() => store.getters['auth/userId'])
const isProved = computed(() => store.getters['prove/isProved'])

const flowMessageMap = {
  submitted: '申請が完了しました',
  approved: '代表者認証が完了しました',
}

const flowRouteMap = {
  submitted: '/prove-owner/description',
  approved: '/mypage',
}

const onSubmit = async (validationPromise) => {
  try {
    isLoading.value = true

    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

    const selected = selectedGroup.value

    let result = null
    if (isProved.value) {
      // 代表者証明を認証する
      const isVerifiedPassword = store.getters['prove/isVerifiedPassword'](password.value)
      if (!isVerifiedPassword) throw new Error('パスワードが一致しません。')

      // TODO: 本来はstoreで管理しているユーザデータを更新する
      result = await updateProveOwnerApprovalService(userId.value, true)
    } else {
      // 代表者証明の申請フローを実行
      // TODO: 本来はstoreで管理しているユーザデータを更新する
      result = await submitOwnership(String(selected.id), userId.value, password.value)
    }

    snackbar.value = {
      show: true,
      color: 'success',
      message: flowMessageMap[result.flow],
    }

    setTimeout(() => {
      router.push(flowRouteMap[result.flow])
    }, 1000)
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: error.message,
    }
  } finally {
    isLoading.value = false
  }
}

watch(
  () => selectedGroup.value?.id,
  (organizationId) => {
    if (!organizationId) return
    store.dispatch('prove/fetchProveOwnerStatus', String(organizationId))
  },
)
</script>
