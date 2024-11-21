<template>
    <div class="home">
      <h1>Home Page</h1>
      <p>ようこそ！このアプリで新歓スタンプラリーを楽しんでください。</p>
      
      <!-- ユーザー名がセッションストレージに保存されている場合に表示 -->
      <p v-if="user">こんにちは、{{ user.displayName }} さん！</p>
      <p v-else>ログインしていないようです。ログインしてください。</p>
  
      <!-- QRScanner コンポーネントを表示 -->
      <QRScanner />
    </div>
  </template>
  
  <script>
  // QRScanner をインポート
  import QRScanner from "../components/QRScanner.vue";
  
  export default {
    name: "Home",
    components: {
      QRScanner, // コンポーネントを登録
    },
    data() {
      return {
        user: null, // ユーザー情報を格納する変数
      };
    },
    mounted() {
      // セッションストレージからユーザー情報を取得
      const storedUser = sessionStorage.getItem('user');
      
      // ユーザー情報が存在すれば、dataに設定
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        console.log("ユーザー情報:", this.user);
      }
    },
  };
  </script>
  
  <style scoped>
  .home {
    text-align: center;
    margin: 2rem;
  }
  </style>
  