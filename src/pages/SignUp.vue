<template>
    <div class="signup">
      <h1>サインアップ</h1>
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
        <button type="submit">サインアップ</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script>
  import { mapActions } from "vuex"; // Vuex アクションをインポート
  
  export default {
    name: "Signup",
    data() {
      return {
        email: "",
        password: "",
        errorMessage: null,
      };
    },
    methods: {
      ...mapActions("auth", ["signup"]), // Vuex のsignupアクションをマップ
  
      async onSubmit() {
        try {
          // Vuexのsignupアクションを使用してサインアップ
          await this.signup({ email: this.email, password: this.password });
          console.log("サインアップ成功");
  
          // サインアップ後、リダイレクトなどの処理
          this.$router.push("/login"); // 例：ダッシュボードに遷移
        } catch (error) {
          console.error("サインアップエラー:", error.message);
          this.errorMessage = "サインアップに失敗しました。メールアドレスまたはパスワードをご確認ください。";
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .signup {
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
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .error {
    margin-top: 1rem;
    color: red;
    text-align: center;
  }
  </style>
  