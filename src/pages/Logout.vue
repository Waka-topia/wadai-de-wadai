<template>
    <div class="logout">
      <h1>ログアウト</h1>
      <p v-if="user">現在ログイン中: {{ user.email }}</p>
      <button @click="onLogout">ログアウト</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { mapActions, mapGetters } from "vuex";
  
  export default {
    name: "Logout",
    computed: {
      ...mapGetters("auth", ["user"]), // Vuexからユーザー情報を取得
    },
    data() {
      return {
        errorMessage: null,
      };
    },
    methods: {
      ...mapActions("auth", ["logout", "initializeAuth"]), // Vuexのアクションをマッピング
  
      async onLogout() {
        try {
          // Vuexのlogoutアクションを呼び出してログアウト処理
          await this.logout();
  
          // ログアウト後の初期化処理を実行
          await this.$store.dispatch("auth/initializeAuth");
  
          // セッションストレージの情報をクリア
          sessionStorage.removeItem("user");
  
          console.log("ログアウト成功");
          this.errorMessage = null;
  
          // ログインページへリダイレクト
          this.$router.push("/login");
        } catch (error) {
          console.error("ログアウトエラー:", error.message);
          this.errorMessage = "ログアウトに失敗しました。";
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .logout {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    text-align: center;
  }
  
  button {
    display: block;
    width: 100%;
    padding: 0.5rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #c82333;
  }
  
  .error {
    margin-top: 1rem;
    color: red;
  }
  </style>
  