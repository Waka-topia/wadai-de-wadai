<template>
  <BaseDialog
    v-model="isDialogOpen"
    title="アカウントを削除しますか？"
    confirm-label="削除する"
    confirm-color="error"
    max-width="500"
    @confirm="onDeleteAccount"
  >
    <template #activator="{ props: activatorProps }">
      <p v-if="user">
        <v-list-item
          v-bind="activatorProps"
          class="position-relative text-error"
          block
          size="large"
          variant="flat"
        >
          <v-icon color="error"> mdi-trash-can-outline </v-icon>
          アカウント削除
        </v-list-item>
      </p>
    </template>

    <v-card-text class="px-5 pb-4">
      <v-alert class="mb-3" density="compact" type="error" variant="tonal">
        この操作は取り消せません。
      </v-alert>
      <p class="text-body-2 mb-3">
        アカウントを削除すると、プロフィールや利用履歴などのデータは復元できなくなります。
      </p>
      <p class="text-body-2 font-weight-bold mb-3">削除対象: {{ userEmail }}</p>
      <p class="text-body-2 text-grey">削除後はログアウトし、ログイン画面へ移動します。</p>
      <p class="text-body-2 text-grey">内容を確認し、問題なければ「削除する」を押してください。</p>
    </v-card-text>
  </BaseDialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import BaseDialog from '@/components/common/BaseDialog.vue'

const router = useRouter()
const store = useStore()

const user = computed(() => store.getters['auth/user'])
const userEmail = computed(() => store.getters['users/currentUserData']?.email)
const isDialogOpen = ref(false)

const { notifySuccess, notifyError } = useSnackbar()

const onDeleteAccount = async () => {
  try {
    void logFirebaseAnalyticsEvent('delete_account_confirm', {})
    await store.dispatch('auth/deleteAccount')
    await store.dispatch('auth/initializeAuth')
    sessionStorage.removeItem('user')

    notifySuccess('アカウントを削除しました')

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    notifyError(error)
  } finally {
    isDialogOpen.value = false
  }
}
</script>
