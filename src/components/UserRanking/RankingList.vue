<template>
  <div>
    <!-- エラー発生時のアラート -->
    <v-alert v-if="error" :text="errorMessages" title="エラー" type="error" />

    <!-- 読み込み中のスケルトンローダー -->
    <template v-if="isLoading">
      <v-skeleton-loader v-for="n in 7" :key="n" :elevation="0" type="list-item-avatar-three-line" />
    </template>

    <!-- 読み込み完了後、ランキングが存在する場合に表示 -->
    <div v-if="!isLoading && rankings.length">
      <ProfileCard v-for="(user, index) in rankings" :key="user.userId" :name="user.displayName"
        :status="user.nextShinkan ? `${user.nextShinkan.groupName} - ${user.nextShinkan.nextDate}` : '情報なし'"
        :image="getImageUrl(user.photoURL)" :rank="index + 1" :count="user.stampCount" />
    </div>
  </div>
</template>

<script setup>
import ProfileCard from '@/components/UserRanking/ProfileCard.vue';
import rankingService from '@/services/rankingService';
import { onMounted, ref } from 'vue';

// 各種状態をrefで定義
const rankings = ref([]);
const isLoading = ref(true);
const error = ref(false);
const errorMessages = ref('');

// 画像のURLを生成する関数
function getImageUrl(relativePath) {
  if (relativePath) {
    return new URL(`../../assets/${relativePath}`, import.meta.url).href;
  }
  return 'https://via.placeholder.com/120';
}

// ランキングデータを取得する非同期関数
async function fetchRankings() {
  try {
    const data = await rankingService.fetchTop100();
    console.log(data);
    rankings.value = data;
  } catch (err) {
    errorMessages.value = 'ランキングの取得に失敗しました: ' + err.message;
    error.value = true;
  } finally {
    isLoading.value = false;
  }
}

// コンポーネントのマウント時にデータ取得処理を実行
onMounted(() => {
  fetchRankings();
});
</script>
