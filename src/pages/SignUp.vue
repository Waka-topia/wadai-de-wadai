<template>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">

        <v-text-field v-model="username" :readonly="loading" :rules="[required]" class="mb-2" label="Username"
          placeholder="Enter your username" clearable />
        <v-text-field v-model="email" :readonly="loading" :rules="[required, emailDomainCheck]"
          prepend-inner-icon="mdi-email-outline" class="mb-2" label="Email" placeholder="Enter your email"
          clearable></v-text-field>

        <v-text-field v-model="password" :readonly="loading" :rules="[required, passwordRule]"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'" :type="visible ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline" label="Password" placeholder="Enter your password" clearable
          @click:append-inner="visible = !visible"></v-text-field>

        <br>

        <v-btn :disabled="!form" :loading="loading" color="primary" size="large" type="submit" variant="elevated" block>
          Sign Up
        </v-btn>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
    };
  },
  methods: {
    ...mapActions("auth", ["signup"]),

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
        this.snackbar = {
          show: true,
          color: "error",
          message: `サインアップに失敗しました。メールアドレスまたはパスワードをご確認ください。${error.message}`,
        };
      }
    },
    onLogIn() {
      this.$router.push("/login");
    },
  },
};
</script>
