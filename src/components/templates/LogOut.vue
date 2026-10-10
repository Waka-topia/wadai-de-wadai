<template>
  <BaseDialog
    v-model="isDialogOpen"
    title="注意"
    message="ログアウトします。本当によろしいですか？"
    confirm-label="ログアウト"
    @confirm="onLogout"
  >
    <template #activator="{ props: activatorProps }">
      <p v-if="user">
        <v-list-item
          v-bind="activatorProps"
          class="position-relative"
          block
          size="large"
          variant="flat"
        >
          <v-icon> mdi-logout </v-icon>
          ログアウト
        </v-list-item>
      </p>
      <p v-else>
        <v-list-item
          class="position-relative"
          block
          elevation="0"
          size="large"
          @click="goLoginFromMenu"
        >
          <v-icon> mdi-login </v-icon>
          ログイン
          <v-icon class="position-absolute right-0 mx-2"> mdi-chevron-right </v-icon>
        </v-list-item>
      </p>
    </template>
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

const goLoginFromMenu = () => {
  void logFirebaseAnalyticsEvent('menu_login_click', {})
  router.push('/login')
}

const user = computed(() => store.getters['auth/user'])
const isDialogOpen = ref(false)

const { notifySuccess, notifyError } = useSnackbar()

const onLogout = async () => {
  try {
    void logFirebaseAnalyticsEvent('menu_logout_confirm', {})
    await store.dispatch('auth/logout')
    await store.dispatch('auth/initializeAuth')
    sessionStorage.removeItem('user')

    notifySuccess('ログアウトしました')

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
