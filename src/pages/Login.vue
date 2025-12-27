<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="email"
          class="mb-2"
          :rules="[required, emailDomainCheck]"
          clearable
          label="Email"
          placeholder="sample@gmail.com"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required]"
          :type="visible ? 'text' : 'password'"
          clearable
          label="Password"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <br />

        <v-btn
          type="submit"
          :disabled="!form"
          :loading="isLoading"
          block
          color="success"
          size="large"
          variant="elevated"
        >
          Sign In
        </v-btn>
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onSignUp"> アカウントを作成する </v-btn>
      <v-btn variant="text" @click="onStart"> ログインせずに開始する </v-btn>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-sheet>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'UserLogin',
  data() {
    return {
      email: '',
      password: '',
      visible: false,
      snackbar: {
        show: false,
        color: '',
        message: '',
      },
      form: false,
      isLoading: false,
    }
  },
  methods: {
    ...mapActions('auth', ['login']),

    required(value) {
      return !!value || 'このフィールドは必須です。'
    },

    emailDomainCheck(value) {
      if (value && value.endsWith('@wakayama-u.ac.jp')) {
        return 'このドメインは使用できません'
      }
      return true
    },

    async onSubmit() {
      try {
        this.isLoading = true
        await this.login({ email: this.email, password: this.password })

        this.snackbar = {
          show: true,
          color: 'success',
          message: 'ログインしました',
        }

        setTimeout(() => {
          this.$router.push('/')
        }, 1000)
      } catch (error) {
        // Firebase のエラーコードを処理
        if (error.code === 'auth/email-already-in-use') {
          error.message =
            'このメールアドレスはすでに登録されています。別のメールアドレスを使用してください。'
        } else if (error.code === 'auth/weak-password') {
          error.message = 'パスワードが弱すぎます。8文字以上の強力なパスワードを使用してください。'
        } else if (error.code === 'auth/invalid-email') {
          error.message = 'メールアドレスの形式が正しくありません。'
        } else if (error.code === 'auth/network-request-failed') {
          error.message = 'ネットワークエラーが発生しました。接続を確認してください。'
        }

        this.snackbar = {
          show: true,
          color: 'error',
          message: `ログインに失敗しました: ${error.message}`,
        }
      } finally {
        this.isLoading = false
      }
    },
    onSignUp() {
      this.$router.push('/signup')
    },
    onStart() {
      this.$router.push('/')
    },
  },
}
</script>
