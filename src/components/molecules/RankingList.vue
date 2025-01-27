<template>
    <div>
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-skeleton-loader v-if="isLoading" :elevation="0" type="list-item-avatar-three-line" />
      <v-alert v-if="error" :text="errorMessages" title="エラー" type="error"></v-alert>
      <div v-if="!isLoading && rankings.length > 0">
        <ProfileCard
          v-for="(user, index) in rankings"
          :key="user.userId"
          :name="user.displayName"
          :status="user.nextShinkan ? `${user.nextShinkan.groupName} - ${user.nextShinkan.nextDate}` : '情報なし'"
          :image="getImageUrl(user.photoURL)"
          :rank="index + 1"
          :count="user.stampCount"
        />
      </div>
    </div>
  </template>
  
  <script>
  import ProfileCard from '@/components/atoms/ProfileCard.vue';
  import rankingService from '@/services/rankingService';
  
  export default {
    name: "ProfileList",
    components: {
      ProfileCard,
    },
    data() {
      return {
        rankings: [],
        isLoading: true,
        error: null,
      };
    },
    methods: {
      // 相対パスを画像 URL に変換するメソッド
      getImageUrl(relativePath) {
        // 相対パスが指定されていれば、それをもとに画像を取得
        if (relativePath) {
          return new URL(`../../assets/${relativePath}`, import.meta.url).href;
        }
        // デフォルト画像が必要な場合
        return 'https://via.placeholder.com/120';
      },
      // ランキングデータを取得
      async fetchRankings() {
        try {
          const data = await rankingService.fetchTop100();
          this.rankings = data; // fetchTop100で取得したデータをそのまま格納
        } catch (error) {
          this.error = "ランキングデータの取得中にエラーが発生しました。";
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
    },
    async mounted() {
      await this.fetchRankings();
    },
  };
  </script>
  