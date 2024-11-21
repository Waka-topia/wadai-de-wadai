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
  import { login } from "../services/authService"; // login メソッドをインポート
  
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
      async onSubmit() {
        try {
          // authService内のloginメソッドを利用してログイン
          const user = await login(this.email, this.password);
          console.log("ログイン成功:", user);
          
          // ログイン成功後にセッションストレージにユーザー情報を保存
          sessionStorage.setItem('user', JSON.stringify(user));  // ユーザー情報をセッションストレージに保存
          
          this.errorMessage = null;
          // ログイン成功後のリダイレクトや処理をここに追加
        } catch (error) {
          console.error("ログインエラー:", error.message);
          this.errorMessage = "ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。";
        }
      },
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
  