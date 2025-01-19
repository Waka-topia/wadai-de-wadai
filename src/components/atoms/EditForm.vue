<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="700">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          class="text-none font-weight-regular"
          prepend-icon="mdi-account"
          color="primary"
          v-bind="activatorProps"
        >
          プロフィール編集
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 font-weight-bold">
          <v-icon class="mr-2" color="primary">mdi-account</v-icon>
          ユーザープロフィール
        </v-card-title>

        <v-card-text>
          <!-- アイコンとファイルアップロード -->
          <v-row align="center" justify="center" class="mb-4">
            <v-avatar size="120" class="mb-2">
              <v-img :src="getImageUrl(photoURL)" alt="ユーザーのアイコン" />
            </v-avatar>
            <profileImage />
          </v-row>

          <v-divider class="my-4" />
          <div class="py-4">
            <v-row align="center">
              <v-col cols="auto">
                <v-icon color="primary" large>mdi-information</v-icon>
              </v-col>
              <v-col>
                <h3 class="text-h5 font-weight-bold">基本情報</h3>
              </v-col>
            </v-row>
          </div>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-card class="pa-3 elevation-1" outlined>
                <v-row align="center" justify="space-between">
                  <v-col cols="auto">
                    <v-icon color="primary">mdi-account-circle</v-icon>
                  </v-col>
                  <v-col>
                    <div class="text-subtitle-1 font-weight-medium">ユーザー名</div>
                    <div class="text-body-1">{{ displayName }}</div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="pa-3 elevation-1" outlined>
                <v-row align="center" justify="space-between">
                  <v-col cols="auto">
                    <v-icon color="primary">mdi-email</v-icon>
                  </v-col>
                  <v-col>
                    <div class="text-subtitle-1 font-weight-medium">メールアドレス</div>
                    <div class="text-body-1">{{ email }}</div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <div class="py-4 mt-5">
            <v-row align="center">
              <v-col cols="auto">
                <v-icon color="primary" large>mdi-map-marker</v-icon>
              </v-col>
              <v-col>
                <h3 class="text-h5 font-weight-bold">次に行く新歓設定</h3>
              </v-col>
            </v-row>
          </div>

          <v-card class="elevation-2 pa-4" outlined>

            <v-card-text>
              <NextShinkan />
            </v-card-text>
          </v-card>

          <!-- フッター情報 -->
          <div class="mt-3">
            <!-- <small class="text-caption text-medium-emphasis">ユーザーID: {{ userId }}</small><br /> -->
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">キャンセル</v-btn>
          <!-- <v-btn color="primary" @click="saveShinkan">保存</v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import NextShinkan from "@/components/templates/NextShinkan.vue";
import profileImage from "@/components/templates/profileImage.vue";

export default {
  data() {
    return {
      dialog: false,
    };
  },
  components: {
    NextShinkan,
    profileImage,
  },
  computed: {
    displayName() {
      return this.$store.getters["auth/displayName"];
    },
    userId() {
      return this.$store.getters["auth/userId"];
    },
    email() {
      return this.$store.getters["auth/email"];
    },
    providerData() {
      return this.$store.getters["auth/providerData"];
    },
    photoURL() {
      return this.$store.getters["auth/photoURL"];
    },
  },
  methods: {
    // 相対パスに基づいて画像URLを取得するメソッド
    getImageUrl(relativePath) {
      // 相対パスが指定されていれば、それをもとに画像を取得
      if (relativePath) {
        return new URL(`../../assets/${relativePath}`, import.meta.url).href;
      }
      // デフォルト画像が必要な場合
      return 'https://via.placeholder.com/120';
    },
    saveShinkan() {
      const userId = this.userId;
      this.dialog = false;

      if (!userId) {
        alert("ユーザーがログインしていません。");
        return;
      }

      alert("プロフィールの保存が完了しました！");
    },
  },
};
</script>
