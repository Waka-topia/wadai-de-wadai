<template>
  <v-sheet class="bg-orange-lighten-5 pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-form
        v-model="form"
        @submit.prevent="onSubmit"
      >

        <v-text-field
          v-model="username"
          :readonly="loading"
          :rules="[required]"
          class="mb-2"
          label="Username"
          placeholder="Enter your username"
          clearable
        />
        <v-text-field
          v-model="email"
          :readonly="loading"
          :rules="[required]"
          class="mb-2"
          label="Email"
          placeholder="Enter your email"
          clearable
        ></v-text-field>

        <v-text-field
          v-model="password"
          :readonly="loading"
          :rules="[required]"
          label="Password"
          placeholder="Enter your password"
          clearable
        ></v-text-field>

        <br>

        <v-btn
          :disabled="!form"
          :loading="loading"
          color="primary"
          size="large"
          type="submit"
          variant="elevated"
          block
        >
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
      errorMessage: null,
    };
  },
  methods: {
    ...mapActions("auth", ["signup"]),

    async onSubmit() {
      try {
        // Vuexのsignupアクションを使用してサインアップ
        await this.signup({ email: this.email, password: this.password, username: this.username });
        console.log("サインアップ成功");

        // サインアップ後、リダイレクトなどの処理
        this.$router.push("/login"); // 例：ダッシュボードに遷移
      } catch (error) {
        console.error("サインアップエラー:", error.message);
        this.errorMessage = "サインアップに失敗しました。メールアドレスまたはパスワードをご確認ください。";
      }
    },
    onLogIn() {
      this.$router.push("/login");
    },
  },
};
</script>
