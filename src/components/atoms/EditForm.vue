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
              <v-img :src="photoURL" alt="ユーザーのアイコン" />
            </v-avatar>
            <!-- <v-file-input label="アイコンを変更" prepend-icon="mdi-camera" variant="outlined"></v-file-input> -->
            <profileImage />
          </v-row>

          <!-- 基本情報 -->
          <v-divider />
          <div class="py-2">
            <h3 class="text-subtitle-1 font-weight-medium">基本情報</h3>
          </div>
          <v-row dense>
            <v-col cols="12" md="6">
              <div>
                <strong>ユーザー名:</strong> {{ displayName }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div>
                <strong>メールアドレス:</strong> {{ email }}
              </div>
            </v-col>
          </v-row>

          <!-- 新歓設定 -->
          <v-divider />
          <div class="py-2">
            <h3 class="text-subtitle-1 font-weight-medium">新歓設定</h3>
          </div>
          <NextShinkan />

          <!-- フッター情報 -->
          <div class="mt-3">
            <small class="text-caption text-medium-emphasis">* 必須項目</small><br />
            <small class="text-caption text-medium-emphasis">ユーザーID: {{ userId }}</small><br />
            <small class="text-caption text-medium-emphasis">プロバイダ: {{ providerData }}</small>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">キャンセル</v-btn>
          <v-btn color="primary" @click="saveShinkan">保存</v-btn>
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
