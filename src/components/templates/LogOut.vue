<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <p v-if="user">
        <v-list-item
          size="large"
          v-bind="activatorProps"
          variant="flat"
          class="position-relative"
          block
        >
          <v-icon> mdi-logout </v-icon>
          ログアウト
        </v-list-item>
      </p>
      <p v-else>
        <v-list-item
          size="large"
          elevation="0"
          @click="$router.push('/login')"
          class="position-relative"
          block
        >
          <v-icon> mdi-login </v-icon>
          ログイン
          <v-icon class="position-absolute right-0 mx-2"> mdi-chevron-right </v-icon>
        </v-list-item>
      </p>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="注意">
        <v-card-text> ログアウトします。本当によろしいですか？ </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="キャンセル" @click="isActive.value = false"></v-btn>
          <v-btn text="ログアウト" @click="onLogout(isActive)" color="red"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'UserLogout',
  computed: {
    ...mapGetters('auth', ['user']),
  },
  data() {
    return {
      snackbar: {
        show: false,
        color: '',
        message: '',
      },
    }
  },
  methods: {
    ...mapActions('auth', ['logout', 'initializeAuth']),

    async onLogout(isActive) {
      try {
        await this.logout()
        await this.$store.dispatch('auth/initializeAuth')
        sessionStorage.removeItem('user')

        this.snackbar = {
          show: true,
          color: 'success',
          message: 'ログアウトしました',
        }
        isActive.value = false

        setTimeout(() => {
          this.$router.push('/login')
        }, 1000)
      } catch (error) {
        this.snackbar = {
          show: true,
          color: 'error',
          message: `ログアウトに失敗しました: ${error.message}`,
        }
      }
    },
  },
}
</script>
