<template>
  <div class="review-panel">
    <div class="review-panel-header">
      <v-icon size="18" color="orange">mdi-star</v-icon>
      <span class="panel-title">楽単レビュー</span>
      <span v-if="averageDifficulty > 0" class="avg-chip">
        平均 {{ averageDifficulty.toFixed(1) }} / 5（{{ reviews.length }}件）
      </span>
    </div>

    <!-- 自分のレビュー投稿エリア -->
    <div class="my-review-form">
      <div class="field-label">難易度（1=楽単 / 5=鬼単）</div>
      <div class="stars">
        <v-btn
          v-for="n in 5"
          :key="n"
          icon
          variant="text"
          size="small"
          @click="myDifficulty = n"
        >
          <v-icon :color="n <= myDifficulty ? 'orange' : '#ddd'" size="22">
            mdi-star
          </v-icon>
        </v-btn>
      </div>

      <v-text-field
        v-model="myComment"
        variant="outlined"
        density="compact"
        placeholder="一言コメント（任意）"
        hide-details
        class="mt-2"
      />

      <v-btn
        color="orange"
        variant="flat"
        size="small"
        :disabled="myDifficulty === 0"
        class="mt-2"
        @click="submitReview"
      >
        {{ hasMyReview ? '更新する' : '投稿する' }}
      </v-btn>
    </div>

    <v-divider class="my-3" />

    <!-- レビュー一覧 -->
    <div v-if="reviews.length === 0" class="empty-reviews">
      まだレビューはありません
    </div>

    <div v-else class="review-list">
      <div v-for="review in reviews" :key="review.uid" class="review-item">
        <div class="review-stars">
          <v-icon
            v-for="n in 5"
            :key="n"
            size="14"
            :color="n <= review.difficulty ? 'orange' : '#ddd'"
          >mdi-star</v-icon>
        </div>
        <span class="review-comment">{{ review.comment || '—' }}</span>
        <span class="review-author">{{ review.authorName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import {
  fetchReviews,
  fetchMyReview,
  saveReview,
  calcAverageDifficulty,
} from '@/services/reviewService'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

const props = defineProps({
  lectureName: {
    type: String,
    default: '',
  },
})

const store = useStore()
const reviews = ref([])
const myDifficulty = ref(0)
const myComment = ref('')
const hasMyReview = ref(false)

const uid = store.getters['auth/userId']
const displayName = store.getters['auth/displayName']

const nameNormalized = ref('')

const averageDifficulty = computed(() => calcAverageDifficulty(reviews.value))

const loadReviews = async () => {
  if (!props.lectureName) return
  nameNormalized.value = normalizeLectureName(props.lectureName, { katakana: true })
  reviews.value = await fetchReviews(nameNormalized.value)

  const myReview = await fetchMyReview(nameNormalized.value, uid)
  if (myReview) {
    hasMyReview.value = true
    myDifficulty.value = myReview.difficulty
    myComment.value = myReview.comment || ''
  }
}

onMounted(loadReviews)
watch(() => props.lectureName, loadReviews)

const submitReview = async () => {
  if (!myDifficulty.value || !nameNormalized.value) return
  await saveReview(nameNormalized.value, uid, {
    difficulty: myDifficulty.value,
    comment: myComment.value.trim(),
    authorName: displayName || '名無し',
  })
  hasMyReview.value = true
  await loadReviews()
}
</script>

<style scoped>
.review-panel {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-top: 12px;
}

.review-panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #444;
}

.avg-chip {
  font-size: 0.75rem;
  background: #fff3e0;
  color: #ff9800;
  border-radius: 20px;
  padding: 2px 10px;
  margin-left: auto;
  font-weight: bold;
}

.my-review-form {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
}

.stars {
  display: flex;
  gap: 2px;
}

.empty-reviews {
  font-size: 0.85rem;
  color: #bbb;
  text-align: center;
  padding: 12px 0;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
}

.review-stars {
  display: flex;
  gap: 1px;
}

.review-comment {
  flex: 1;
  color: #444;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-author {
  font-size: 0.72rem;
  color: #aaa;
  white-space: nowrap;
}
</style>
