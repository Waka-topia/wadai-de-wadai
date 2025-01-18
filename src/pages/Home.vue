<template>
  <div class="mx-3 my-3 text-center">
    <h1>Home Page</h1>
    <p>ようこそ！このアプリで新歓スタンプラリーを楽しんでください。</p>

    <!-- ユーザー名がVuexに保存されている場合に表示 -->
    <p v-if="isAuthenticated">こんにちは、{{ displayName }} さん！</p>
    <p v-else>ログインしていないようです。ログインしてください。</p>
  </div>
</template>

<script>

export default {
  name: "Home",
  components: {
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
