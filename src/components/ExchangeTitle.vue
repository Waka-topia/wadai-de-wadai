<template>
  <div class="titles-container">
    <h1 class="page-title">称号一覧</h1>
    <ul v-if="titles.length" class="titles-list">
      <li v-for="title in titles" :key="title.id" class="title-card">
        <h2 class="title-name">{{ title.name }}</h2>
        <p class="title-description">{{ title.description }}</p>
        <v-btn color="primary" @click="claimTitle(title)">獲得する</v-btn>
      </li>
    </ul>
    <p v-else class="no-titles-message">称号がありません。</p>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const store = useStore()

const error = ref(null) // エラーメッセージを保存

// Vuexストアからタイトルデータを取得
const titles = computed(() => store.getters['title/allTitles'])

/**
 * ユーザーIDを取得する
 *
 * @returns {string | null} ユーザーID
 */
const getUserId = () => {
  return store.getters['auth/userId']
}

/**
 * 称号を獲得する
 *
 * @param {object} title - 獲得する称号データ
 */
const claimTitle = async (title) => {
  try {
    error.value = null
    const userId = getUserId()
    if (!userId) {
      throw new Error('ログインしてください。')
    }

    await store.dispatch('title/addTitleToUser', {
      userID: userId,
      titleID: title.id,
      titleData: title,
    })
    void logFirebaseAnalyticsEvent('title_claim_success', { titleId: title.id })
  } catch (err) {
    void logFirebaseAnalyticsEvent('title_claim_error', { titleId: title?.id })
    console.error('Error claiming title:', err)
    error.value =
      err.message === 'User does not meet the criteria for this title'
        ? '条件を満たしていません。'
        : err.message
  }
}

/** 称号データを読み込む */
const loadTitles = async () => {
  try {
    await store.dispatch('title/fetchAllTitles')
  } catch (err) {
    console.error('Error loading titles:', err)
    error.value = '称号データの取得に失敗しました。'
  }
}

onMounted(() => {
  loadTitles()
})
</script>

<style scoped>
/* レスポンシブデザインを考慮したスタイル */
.titles-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
}

.page-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 16px;
}

.titles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  /* 箇条書きの点を非表示に */
  padding: 0;
  /* デフォルトの余白もリセット */
}

.title-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.title-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.title-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.title-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
}

.claim-button:hover {
  background-color: #0056b3;
}

.no-titles-message,
.error-message {
  text-align: center;
  color: #666;
  margin-top: 16px;
}

.error-message {
  color: red;
}
</style>
