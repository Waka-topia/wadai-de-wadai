<template>
  <v-dialog max-width="500">
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

    <template #default="{ isActive }">
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
          <p class="text-body-2 font-weight-bold mb-3">削除対象: {{ user?.email || '◯◯@◯◯' }}</p>
          <p class="text-body-2 text-grey">削除後はログアウトし、ログイン画面へ移動します。</p>
          <p class="text-body-2 text-grey">内容を確認し、問題なければ「削除」を押してください。</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="キャンセル" @click="isActive.value = false"></v-btn>
          <v-btn
            color="error"
            prepend-icon="mdi-delete-alert"
            text="削除"
            @click="onDeleteAccount(isActive)"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const user = computed(() => store.getters['auth/user'])

const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const onDeleteAccount = async (isActive) => {
  try {
    await store.dispatch('auth/deleteAccount')
    await store.dispatch('auth/initializeAuth')
    sessionStorage.removeItem('user')

    snackbar.value = {
      show: true,
      color: 'success',
      message: 'アカウントを削除しました',
    }
    isActive.value = false

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: `アカウント削除に失敗しました: ${error.message}`,
    }
  }
}
</script>
