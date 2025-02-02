<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <p v-if="user">現在ログイン中: {{ user.email }}</p>
      <v-btn size="large" v-bind="activatorProps" variant="flat" block>ログアウト</v-btn>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="注意">
        <v-card-text>
          ログアウトします。本当によろしいですか？
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="キャンセル" @click="isActive.value = false"></v-btn>
          <v-btn text="ログアウト" @click="onLogout(isActive)" color="red"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "UserLogout",
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

    async onLogout(isActive) {
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

        isActive.value = false;
      } catch (error) {
        console.error("ログアウトエラー:", error.message);
        this.errorMessage = "ログアウトに失敗しました。";
      }
    },
  },
};
</script>
