<template>
  <v-dialog max-width="500">
    <template #activator="{ props: activatorProps }">
      <p v-if="user">
        <v-list-item
          v-bind="activatorProps"
          class="position-relative"
          block
          size="large"
          variant="flat"
        >
          <v-icon> mdi-trash-can-outline </v-icon>
          アカウント削除
        </v-list-item>
      </p>
    </template>

    <template #default="{ isActive }">
      <v-card title="注意">
        <v-card-text> アカウントを削除します。本当によろしいですか？ </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="キャンセル" @click="isActive.value = false"></v-btn>
          <v-btn color="red" text="削除" @click="onDeleteAccount(isActive)"></v-btn>
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
