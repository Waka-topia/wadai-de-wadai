<template>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field v-model="email" :readonly="loading" :rules="[required, emailDomainCheck]"
          prepend-inner-icon="mdi-email-outline" class="mb-2" label="Email" clearable></v-text-field>

        <v-text-field v-model="password" :readonly="loading" :rules="[required]"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'" :type="visible ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline" label="Password" placeholder="Enter your password" clearable
          @click:append-inner="visible = !visible"></v-text-field>

        <br>

        <v-btn :disabled="!form" :loading="loading" color="success" size="large" type="submit" variant="elevated" block>
          Sign In
        </v-btn>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </v-form>
      <v-divider class="mt-10"></v-divider>
      <v-btn variant="text" @click="onSignUp">
        アカウントを作成する
      </v-btn>
      <v-btn variant="text" @click="onStart">
        ログインせずに開始する
      </v-btn>
    </v-card>
    <v-snackbar :v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-sheet>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "UserLogin",
  data() {
    return {
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
    ...mapActions("auth", ["login"]),

    emailDomainCheck(value) {
      if (value && value.endsWith('@wakayama-u.ac.jp')) {
        return 'このドメインは使用できません';
      }
      return true;
    },

    async onSubmit() {
      try {
        await this.login({ email: this.email, password: this.password });

        this.$router.push("/");
        this.snackbar = {
          show: true,
          color: "success",
          message: "ログインしました",
        };
      } catch (error) {
        this.snackbar = {
          show: true,
          color: "error",
          message: `ログインに失敗しました: ${error.message}`,
        };
      }
    },
    onSignUp() {
      this.$router.push("/signup");
    },
    onStart() {
      this.$router.push("/");
    },
  },
};
</script>
