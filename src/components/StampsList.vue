<template>
  <div>
    <v-skelton-loader v-if="isLoading" :elevation="1" type="image" />
    <v-alert v-else-if="!isAuthenticated" text="ログインして下さい" title="warning" type="warning"></v-alert>
    <v-alert v-else-if="stampImages.length === 0" text="スタンプをまだ持っていません。" title="info" type="info"></v-alert>
    <v-alert v-else-if="isErrored" text={{ errorMessages }} title="エラー" type="error"></v-alert>
    <div v-else>
      <div v-for="stamp in stampImages" :key="stamp.stampId" class="stamp-card">
        <img :src="getImageUrl(stamp.imageUrl)" :alt="stamp.name" />
        <h2>{{ stamp.name }}</h2>
        <p>{{ stamp.description }}</p>
      </div>
    </div>
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
      console.log("relativePath:", relativePath);
      return new URL(`../assets/${relativePath}`, import.meta.url).href;
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

<style>
.stamp-card {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.stamp-card img {
  max-width: 100px;
  height: auto;
  margin-bottom: 10px;
}
</style>
