<template>
  <div class="home">
    <h1>Home Page</h1>
    <p>ようこそ！このアプリで新歓スタンプラリーを楽しんでください。</p>

    <!-- ユーザー名がVuexに保存されている場合に表示 -->
    <p v-if="isAuthenticated">こんにちは、{{ displayName }} さん！</p>
    <p v-else>ログインしていないようです。ログインしてください。</p>
    <p>ユーザーID: {{ userId }}</p>
    <p>メールアドレス: {{ email }}</p>
    <p>ユーザー情報: {{ user }}</p>
    <p>プロバイダ情報: {{ providerData }}</p>
    <p>プロフィール画像: <img :src="photoURL" alt="プロフィール画像" /></p>
    <profileImage/>
    <!-- QRScanner コンポーネントを表示 -->
    <PropColor />
  </div>
</template>

<script>
import PropColor from "../layouts/prop-color.vue";
import profileImage from "@/components/templates/profileImage.vue";

export default {
  name: "Home",
  components: {
    PropColor,
    profileImage,
  },
  computed: {
    // VuexのGetterを使用して認証状態を取得
    isAuthenticated() {
      return this.$store.getters["auth/isAuthenticated"];
    },
    // VuexのGetterを使用して表示名を取得
    displayName() {
      return this.$store.getters["auth/displayName"];
    },
    userId() {
      return this.$store.getters["auth/userId"];
    },
    email() {
      return this.$store.getters["auth/email"];
    },
    user() {
      return this.$store.getters["auth/user"];
    },
    providerData() {
      return this.$store.getters["auth/providerData"];
    },
    photoURL() {
      return this.$store.getters["auth/photoURL"];
    },
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin: 2rem;
}
</style>
