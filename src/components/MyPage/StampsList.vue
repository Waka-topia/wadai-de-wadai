<template>
  <div>
    <v-skelton-loader v-if="isLoading" :elevation="1" type="image" />
    <v-alert v-else-if="!isAuthenticated" text="ログインして下さい" title="warning" type="warning"></v-alert>
    <v-alert v-else-if="stampImages.length === 0" text="スタンプをまだ持っていません。" title="info" type="info"></v-alert>
    <v-alert v-else-if="isErrored" :text="errorMessages" title="エラー" type="error"></v-alert>
    <v-row class="mt-1" v-else>
      <v-col
        v-for="stamp in stampImages"
        :key="stamp.stampId"
        cols="4" sm="4" md="3"
      >
        <v-card elevation="0">
          <v-img :src="getImageUrl(stamp.imageUrl)" :alt="stamp.name" aspect-ratio="1"></v-img>
          <v-card-title class="text-body-2"><small>{{ stamp.name }}</small></v-card-title>
          <v-card-text>{{ stamp.description }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      isLoading: true, // 初期は読み込み中
      isErrored: false,
      errorMessages: "画像の取得に失敗しました",
    };
  },
  computed: {
    ...mapGetters("stamps", ["userStampImages"]),
    ...mapGetters("auth", ["isAuthenticated"]),
    stampImages() {
      return this.userStampImages || [];
    },
  },
  methods: {
    ...mapActions("stamps", ["fetchUserStampImages"]),
    async loadStampImages() {
      try {
        await this.fetchUserStampImages();
      } catch (error) {
        this.isErrored = true;
        this.errorMessages = error.message || error;
      } finally {
        this.isLoading = false;
      }
    },
    getImageUrl(relativePath) {
      return new URL(`../../assets/${relativePath}`, import.meta.url).href;
    },
  },
  async created() {
    if (this.isAuthenticated) {
      await this.loadStampImages();
    } else {
      this.isLoading = false; // 認証が必要な場合も読み込み終了
    }
  },
  watch: {
    isAuthenticated: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadStampImages();
        }
      },
    },
  },
};
</script>
