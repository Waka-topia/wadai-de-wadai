<template>
  <div class="home">
    <h1>Home Page</h1>
    <p>ようこそ！このアプリで新歓スタンプラリーを楽しんでください。</p>
    
    <!-- ユーザー名がセッションストレージまたはVuexに保存されている場合に表示 -->
    <p v-if="userFromSessionStorage || userFromVuex">こんにちは、{{ (userFromSessionStorage || userFromVuex).displayName }} さん！</p>
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
  computed: {
    // Vuexから取得したユーザー情報
    userFromVuex() {
      const user = this.$store.state.user; // Vuexのユーザー情報
      console.log("Vuexから取得したユーザー情報:", user); // ログを追加
      return user;
    }
  },
  data() {
    return {
      userFromSessionStorage: null, // セッションストレージから取得したユーザー情報
    };
  },
  mounted() {
    // セッションストレージからユーザー情報を取得
    const storedUser = sessionStorage.getItem('user');
    
    // ユーザー情報が存在すれば、dataに設定
    if (storedUser) {
      this.userFromSessionStorage = JSON.parse(storedUser);
      console.log("セッションストレージから取得したユーザー情報:", this.userFromSessionStorage);
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
