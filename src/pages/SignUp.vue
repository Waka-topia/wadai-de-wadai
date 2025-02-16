<template>
  <v-progress-linear color="success" v-if="isLoading" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">

        <v-text-field v-model="username" :rules="[required, nameCheck]" class="mb-2" label="Username" placeholder="わかやん"
          clearable hint="本名は使用しないでください。" />
        <v-text-field v-model="email" :rules="[required, emailDomainCheck]" prepend-inner-icon="mdi-email-outline"
          class="mb-2" label="Email" placeholder="sample@gmail.com" clearable hint="架空のメールアドレスでも構いません。"></v-text-field>
        <v-text-field v-model="password" :rules="[required, passwordRule]"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'" :type="visible ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline" label="Password" placeholder="Xa4%j87d" clearable
          @click:append-inner="visible = !visible" hint="8文字以上にしてください。"></v-text-field>

        <br>

        <v-btn :disabled="!form" :loading="isLoading" color="primary" size="large" type="submit" variant="elevated"
          block>
          Sign Up
        </v-btn>
        
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onLogIn">
        アカウントをお持ちの方はこちら
      </v-btn>
    </v-card>
  </v-sheet>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "UserSignup",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      visible: false,
      snackbar: {
        show: false,
        color: "",
        message: "",
      },
      form: false,
      isLoading: false,
    };
  },
  methods: {
    ...mapActions("auth", ["signup"]),

    required(value) {
      return !!value || 'このフィールドは必須です。';
    },

    nameCheck(value) {
      if (value && value.length < 2) {
        return 'ユーザー名は2文字以上で入力してください';
      }
      return true;
    },

    emailDomainCheck(value) {
      if (value && value.endsWith('@wakayama-u.ac.jp')) {
        return 'このドメインは使用できません';
      }
      return true;
    },

    passwordRule(value) {
      if (value && value.length < 8) {
        return 'パスワードは8文字以上で入力してください';
      }
      return true;
    },

    async onSubmit() {
      try {
        this.isLoading = true
        await this.signup({ email: this.email, password: this.password, username: this.username });

        this.snackbar = {
          show: true,
          color: "success",
          message: "サインアップしました",
        };

        setTimeout(() => {
          this.$router.push("/login");
        }, 1000);
      } catch (error) {

        // Firebase のエラーコードを処理
        if (error.code === "auth/email-already-in-use") {
          error.message = "このメールアドレスはすでに登録されています。別のメールアドレスを使用してください。";
        } else if (error.code === "auth/weak-password") {
          error.message = "パスワードが弱すぎます。8文字以上の強力なパスワードを使用してください。";
        } else if (error.code === "auth/invalid-email") {
          error.message = "メールアドレスの形式が正しくありません。";
        } else if (error.code === "auth/network-request-failed") {
          error.message = "ネットワークエラーが発生しました。接続を確認してください。";
        }

        this.snackbar = {
          show: true,
          color: "error",
          message: `サインアップに失敗しました。メールアドレスまたはパスワードをご確認ください。${error.message}`,
        };
      } finally {
        this.isLoading = false
      }
    },
    onLogIn() {
      this.$router.push("/login");
    },
  },
};
</script>
