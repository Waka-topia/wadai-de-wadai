<template>
  <div>
    <!-- エラー発生時のアラート -->
    <v-alert v-if="error" type="error" title="エラー" :text="errorMessages" />

    <!-- 読み込み中のスケルトンローダー -->
    <template v-if="isLoading">
      <v-skeleton-loader
        v-for="n in 7"
        :key="n"
        type="list-item-avatar-three-line"
        :elevation="0"
      />
    </template>

    <!-- 読み込み完了後、ランキングが存在する場合に表示 -->
    <div v-if="!isLoading && rankings.length">
      <ProfileCard
        v-for="(user, index) in rankings"
        :key="user.userId"
        :count="user.stampCount"
        :image="getImageUrl(user.photoURL)"
        :name="user.displayName"
        :rank="index + 1"
        :status="
          user.nextShinkan
            ? `${user.nextShinkan.groupName} - ${user.nextShinkan.nextDate}`
            : '情報なし'
        "
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ProfileCard from '@/components/UserRanking/ProfileCard.vue'
import rankingService from '@/services/rankingService'

// 各種状態をrefで定義
const rankings = ref([])
const isLoading = ref(true)
const error = ref(false)
const errorMessages = ref('')

// 画像のURLを生成する関数
/** @param relativePath */
function getImageUrl(relativePath) {
  if (relativePath) {
    return new URL(`../../assets/${relativePath}`, import.meta.url).href
  }
  return new URL(`../../assets/${relativePath}`, import.meta.url).href
}

// ランキングデータを取得する非同期関数
/**
 *
 */
async function fetchRankings() {
  try {
    const data = await rankingService.fetchTop100()
    console.log(data)
    rankings.value = data
  } catch (err) {
    errorMessages.value = 'ランキングの取得に失敗しました: ' + err.message
    error.value = true
  } finally {
    isLoading.value = false
  }
}

// コンポーネントのマウント時にデータ取得処理を実行
onMounted(() => {
  fetchRankings()
})
</script>
