<template>
  <div class="login">
    <h1>ログイン</h1>
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input 
          type="email" 
          id="email" 
          placeholder="example@example.com" 
          v-model="email" 
          required
        />
      </div>
      <div class="form-group">
        <label for="password">パスワード</label>
        <input 
          type="password" 
          id="password" 
          placeholder="********" 
          v-model="password" 
          required
        />
      </div>
      <button type="submit">ログイン</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
// firebaseのログイン機能をインポート
import { mapActions } from "vuex"; // Vuex アクションをインポート

export default {
  name: "Login",
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
        // Vuexのloginアクションを使用してログイン
        await this.login({ email: this.email, password: this.password });

        console.log("ログイン成功");

        // ログイン後、VuexのinitializeAuthアクションを呼び出して、ユーザー情報をストアに保存
        await this.$store.dispatch("auth/initializeAuth");

        // user情報が設定されるのを確認してからセッションストレージに保存
        const user = this.$store.state.auth.user;
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user));
        } else {
          console.error("ユーザー情報が見つかりません");
        }

        this.errorMessage = null;
        // ログイン成功後のリダイレクトや処理をここに追加
        this.$router.push("/"); // 例：ダッシュボードに遷移
      } catch (error) {
        console.error("ログインエラー:", error.message);
        this.errorMessage = "ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。";
      }
    }
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.error {
  margin-top: 1rem;
  color: red;
  text-align: center;
}
</style>
