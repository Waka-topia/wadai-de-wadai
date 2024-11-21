<template>
    <div class="signup">
      <h1>アカウント作成</h1>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Your Name"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="example@example.com"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="********"
            required
          />
        </div>
        <button type="submit">アカウント作成</button>
      </form>
    </div>
  </template>
  
  <script>
  import { signUp } from "../services/authService"; // signUp メソッドをインポート
  
  export default {
    name: "SignUp",
    data() {
      return {
        username: "",
        email: "",
        password: "",
      };
    },
    methods: {
      async onSubmit() {
        try {
          // signUpメソッドを呼び出してFirebaseでユーザー作成
          await signUp(this.email, this.password, this.username);
  
          alert("アカウントが作成されました！");
        } catch (error) {
          console.error("サインアップエラー:", error.message);
          alert(`エラー: ${error.message}`);
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
  </style>
  