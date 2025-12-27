<template>
  <v-progress-linear color="success" v-if="isLoading" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="username"
          :rules="[required, nameCheck]"
          class="mb-2"
          label="Username"
          placeholder="わかやん"
          clearable
          hint="本名は使用しないでください。"
        />
        <v-text-field
          v-model="email"
          :rules="[required, emailDomainCheck]"
          prepend-inner-icon="mdi-email-outline"
          class="mb-2"
          label="Email"
          placeholder="sample@gmail.com"
          clearable
          hint="架空のメールアドレスでも構いません。"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :rules="[required, passwordRule]"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
          :type="visible ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          label="Password"
          placeholder="Xa4%j87d"
          clearable
          @click:append-inner="visible = !visible"
          hint="8文字以上にしてください。"
        ></v-text-field>

        <v-btn @click="openRules" text color="primary">利用規約を確認</v-btn>
        <!-- モーダルを表示するボタン -->

        <v-checkbox v-model="agree" :rules="[requiredAgree]" label="利用規約に同意する" />

        <br />

        <v-btn
          :disabled="!form || !agree"
          :loading="isLoading"
          color="primary"
          size="large"
          type="submit"
          variant="elevated"
          block
        >
          Sign Up
        </v-btn>
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onLogIn"> アカウントをお持ちの方はこちら </v-btn>
    </v-card>
  </v-sheet>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>

  <!-- モーダル（Rule.vue） -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-text>
        <rule-component />
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="dialog = false">閉じる</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import RuleComponent from '@/components/Rule.vue' // Rule.vue をインポート

export default {
  name: 'UserSignup',
  components: {
    RuleComponent, // Rule.vue コンポーネントを登録
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      visible: false,
      agree: false, // チェックボックス用のデータ
      snackbar: {
        show: false,
        color: '',
        message: '',
      },
      form: false,
      isLoading: false,
      dialog: false, // モーダルの表示状態
    }
  },
  methods: {
    ...mapActions('auth', ['signup']),

    required(value) {
      return !!value || 'このフィールドは必須です。'
    },

    requiredAgree(value) {
      return value || '利用規約に同意する必要があります。'
    },

    nameCheck(value) {
      if (value && value.length < 2) {
        return 'ユーザー名は2文字以上で入力してください'
      }
      return true
    },

    emailDomainCheck(value) {
      if (value && value.endsWith('@wakayama-u.ac.jp')) {
        return 'このドメインは使用できません'
      }
      return true
    },

    passwordRule(value) {
      if (value && value.length < 8) {
        return 'パスワードは8文字以上で入力してください'
      }
      return true
    },

    openRules() {
      this.dialog = true // モーダルを開く
    },

    async onSubmit() {
      if (!this.agree) {
        this.snackbar = {
          show: true,
          color: 'error',
          message: '利用規約に同意する必要があります。',
        }
        return
      }

      try {
        this.isLoading = true
        await this.signup({ email: this.email, password: this.password, username: this.username })

        this.snackbar = {
          show: true,
          color: 'success',
          message: 'サインアップしました',
        }

        setTimeout(() => {
          this.$router.push('/login')
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
          message: `サインアップに失敗しました。メールアドレスまたはパスワードをご確認ください。${error.message}`,
        }
      } finally {
        this.isLoading = false
      }
    },

    onLogIn() {
      this.$router.push('/login')
    },
  },
}
</script>
