<template>
  <v-dialog v-model="isDialogOpen" max-width="500">
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

    <template #default>
      <v-card>
        <v-card-title class="bg-error text-white d-flex align-center">
          <v-icon class="mr-2" color="white">mdi-alert-octagon</v-icon>
          危険な操作
        </v-card-title>
        <v-card-text class="pt-5">
          <v-alert class="mb-3" density="compact" type="error" variant="tonal">
            この操作は取り消せません。
          </v-alert>
          <p class="text-body-2 mb-3">
            アカウントを削除すると、プロフィールや利用履歴などのデータは復元できなくなります。
          </p>
          <p class="text-body-2 font-weight-bold mb-3">削除対象: {{ userEmail }}</p>
          <p class="text-body-2 text-grey">削除後はログアウトし、ログイン画面へ移動します。</p>
          <p class="text-body-2 text-grey">内容を確認し、問題なければ「削除」を押してください。</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="キャンセル" @click="isDialogOpen = false"></v-btn>
          <v-btn
            color="error"
            prepend-icon="mdi-delete-alert"
            text="削除"
            @click="onDeleteAccount"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const router = useRouter()
const store = useStore()

const user = computed(() => store.getters['auth/user'])
const userEmail = computed(() => store.getters['users/currentUserData']?.email)
const isDialogOpen = ref(false)

const { showSnackbar } = useSnackbar()

const onDeleteAccount = async () => {
  try {
    void logFirebaseAnalyticsEvent('delete_account_confirm', {})
    await store.dispatch('auth/deleteAccount')
    await store.dispatch('auth/initializeAuth')
    sessionStorage.removeItem('user')

    showSnackbar('アカウントを削除しました', 'success', { icon: 'mdi-check-circle' })

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    isDialogOpen.value = false
  }
}
</script>
