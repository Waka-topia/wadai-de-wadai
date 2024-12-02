<template>
  <v-sheet class="bg-orange-lighten-5 pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-form
        v-model="form"
        @submit.prevent="onSubmit"
      >
        <v-text-field
          v-model="email"
          :readonly="loading"
          :rules="[required]"
          class="mb-2"
          label="Email"
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
          color="success"
          size="large"
          type="submit"
          variant="elevated"
          block
        >
          Sign In
        </v-btn>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script>
// firebaseのログイン機能をインポート
import { mapActions } from "vuex"; // Vuex アクションをインポート

export default {
  name: "UserLogin",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: null,
    };
  },
  methods: {
    ...mapActions("auth", ["login", "initializeAuth"]), // auth モジュールのアクションをマップ

    async onSubmit() {
      try {
        // Vuex の login アクションを使用してログイン
        await this.login({ email: this.email, password: this.password });

        console.log("ログイン成功");

        // ログイン後にセッションストレージに保存
        const user = this.$store.state.auth.user;
        if (user) {
          // userIdをセッションストレージに保存
          sessionStorage.setItem('userId', this.$store.state.auth.userId);
        } else {
          console.error("ユーザー情報が見つかりません");
        }

        this.errorMessage = null;

        // ダッシュボードなどに遷移
        this.$router.push("/");
      } catch (error) {
        console.error("ログインエラー:", error.message);
        this.errorMessage = "ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。";
      }
    }
  },
};
</script>
