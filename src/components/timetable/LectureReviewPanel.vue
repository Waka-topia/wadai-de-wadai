<template>
  <div class="review-panel mt-4">
    <div class="review-header mb-2">
      <v-icon color="orange" size="20" class="mr-2">mdi-star</v-icon>
      <span class="review-title">楽単度評価</span>
      <v-spacer></v-spacer>
    </div>

    <div v-if="loading" class="text-center py-2">
      <v-progress-circular indeterminate size="20" color="orange"></v-progress-circular>
    </div>
    <div v-else class="review-body">
      <!-- 統計表示 -->
      <div class="stats-box mb-3" :class="{'mb-0': readonly}">
        <div class="stats-average">
          <span class="average-num">{{ averageRating.toFixed(1) }}</span>
          <v-rating
            :model-value="averageRating"
            color="orange-lighten-1"
            active-color="orange"
            size="small"
            density="compact"
            half-increments
            readonly
          ></v-rating>
        </div>
        <div class="stats-count">評価 {{ reviewCount }} 件</div>
      </div>

      <template v-if="!readonly">
        <v-divider class="mb-3"></v-divider>

        <!-- ユーザーの評価入力 -->
        <div v-if="isLoggedIn" class="user-rating-box">
          <div class="user-rating-label mb-1">あなたの評価</div>
          <v-rating
            v-model="userRating"
            color="orange-lighten-1"
            active-color="orange"
            size="small"
            density="compact"
            hover
            @update:model-value="submitRating"
          ></v-rating>
          <div class="user-rating-hint text-caption mt-1 text-center" :class="{ 'text-success': submitSuccess }">
            {{ submitMessage }}
          </div>
        </div>
        <div v-else class="text-caption text-grey text-center py-2">
          評価を投稿するにはログインが必要です。
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  getLectureReviewStats,
  getUserRating,
  submitUserRating,
} from '@/services/reviewService'

const props = defineProps({
  lectureName: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const store = useStore()
const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])
const uid = computed(() => store.getters['auth/userId'])

const loading = ref(true)
const averageRating = ref(0)
const reviewCount = ref(0)
const userRating = ref(0)
const submitMessage = ref('星をタップして評価を投稿')
const submitSuccess = ref(false)

const loadStats = async () => {
  if (!props.lectureName) return
  loading.value = true
  submitSuccess.value = false
  try {
    const stats = await getLectureReviewStats(props.lectureName)
    if (stats) {
      averageRating.value = stats.average || 0
      reviewCount.value = stats.count || 0
    } else {
      averageRating.value = 0
      reviewCount.value = 0
    }

    if (isLoggedIn.value) {
      const myRating = await getUserRating(props.lectureName, uid.value)
      userRating.value = myRating || 0
      if (myRating) {
        submitMessage.value = '評価済みです（タップで変更）'
      } else {
        submitMessage.value = '星をタップして評価を投稿'
      }
    }
  } catch (error) {
    console.error('楽単評価の取得に失敗:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.lectureName, loadStats)

onMounted(() => {
  loadStats()
})

const submitRating = async (newVal) => {
  if (!newVal || !isLoggedIn.value || !props.lectureName) return
  try {
    submitMessage.value = '送信中...'
    submitSuccess.value = false
    await submitUserRating(props.lectureName, uid.value, newVal)
    submitMessage.value = '評価を投稿しました！'
    submitSuccess.value = true

    // 統計を再取得
    const stats = await getLectureReviewStats(props.lectureName)
    if (stats) {
      averageRating.value = stats.average || 0
      reviewCount.value = stats.count || 0
    }
  } catch (err) {
    console.error('評価の投稿に失敗しました:', err)
    submitMessage.value = '投稿に失敗しました'
  }
}
</script>

<style scoped>
.review-panel {
  background: #fffdf5;
  border: 1px solid #ffe0b2;
  border-radius: 8px;
  padding: 12px 16px;
}

.review-header {
  display: flex;
  align-items: center;
}

.review-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #e65100;
}

.stats-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.stats-average {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.average-num {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ef6c00;
  line-height: 1;
}

.stats-count {
  font-size: 0.75rem;
  color: #666;
}

.user-rating-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 8px;
  border-radius: 6px;
}

.user-rating-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
}

.user-rating-hint {
  color: #999;
}

.text-success {
  color: #4caf50 !important;
}
</style>
