<template>
  <div class="timetable-page">
    <!-- ページヘッダー -->
    <header class="page-header">
      <TimetableHeaderControls v-if="isAuthenticated" />

      <!-- 必修区分の凡例 -->
      <!-- 凡例と取得単位数 -->
      <div
        v-if="isAuthenticated"
        class="d-flex justify-space-between align-center mt-3 flex-wrap"
        style="gap: 8px"
      >
        <div class="lecture-legend mt-0">
          <div class="legend-item"><span class="legend-color required"></span>必修</div>
          <div class="legend-item"><span class="legend-color semi-required"></span>選択必修</div>
          <div class="legend-item"><span class="legend-color elective"></span>その他</div>
        </div>

        <div
          class="credits-info text-caption d-flex align-center bg-teal-lighten-5 px-2 py-1 rounded border"
        >
          <v-icon size="14" color="teal" class="mr-1">mdi-school</v-icon>
          <span class="font-weight-bold text-teal-darken-3">登録: {{ totalCredits }}単位</span>
          <span v-if="earnedCredits > 0" class="ml-2 font-weight-bold text-teal-darken-1"
            >(取得: {{ earnedCredits }})</span
          >
          <span v-if="failedCredits > 0" class="ml-2 font-weight-bold text-error"
            >(落単: {{ failedCredits }})</span
          >
        </div>
      </div>
    </header>

    <!-- 今日の授業カード -->
    <section v-if="isAuthenticated && todayLectures.length > 0" class="today-section">
      <div class="today-section-title">
        <v-icon size="16" color="orange">mdi-calendar-today</v-icon>
        今日の授業
        <span class="today-date">{{ todayDateLabel }}</span>
      </div>
      <div class="today-cards">
        <div
          v-for="lecture in todayLectures"
          :key="lecture.period"
          class="today-card"
          :style="getTodayCardStyle(lecture)"
        >
          <div class="today-card-period">{{ lecture.period }}限</div>
          <div class="today-card-info">
            <div class="today-card-name">{{ lecture.name }}</div>
            <div class="today-card-meta">
              <span v-if="lecture.room">
                <v-icon size="11" style="opacity: 0.7">mdi-map-marker</v-icon>{{ lecture.room }}
              </span>
              <span v-if="lecture.teacher">{{ lecture.teacher }}</span>
            </div>
          </div>
          <div class="today-card-time">{{ getPeriodStart(lecture.period) }}</div>
        </div>
      </div>
    </section>

    <!-- 時間割グリッド -->
    <main class="page-content">
      <TimetableGrid @cell-click="handleCellClick" />
    </main>

    <!-- 講義登録・編集モーダル -->
    <LectureEditorModal
      v-model="showModal"
      :selected-cell="selectedCell"
      @saved="onLectureSaved"
      @deleted="onLectureDeleted"
    />

    <!-- 成功スナックバー -->
    <v-snackbar
      v-model="snackbarShow"
      :color="snackbarColor"
      location="bottom"
      timeout="2500"
      rounded="pill"
    >
      <v-icon class="mr-2" size="18">{{ snackbarIcon }}</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onActivated } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import TimetableHeaderControls from '@/components/timetable/TimetableHeaderControls.vue'
import TimetableGrid from '@/components/timetable/TimetableGrid.vue'
import LectureEditorModal from '@/components/timetable/LectureEditorModal.vue'

const store = useStore()
const router = useRouter()

useFirebasePageView('view_timetable', () => ({
  loggedIn: store.getters['auth/isAuthenticated'],
}))
const showModal = ref(false)
const selectedCell = ref(null)

// スナックバー
const snackbarShow = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('green')
const snackbarIcon = ref('mdi-check-circle')

const showSnackbar = (message, color = 'green', icon = 'mdi-check-circle') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbarIcon.value = icon
  snackbarShow.value = true
}

const onLectureSaved = (lectureName) => {
  showSnackbar(`「${lectureName}」を保存しました`)
}

const onLectureDeleted = () => {
  showSnackbar('講義を削除しました', 'grey', 'mdi-trash-can-outline')
}

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const todayLectures = computed(() => store.getters['timetable/todayLectures'])
const currentTimetable = computed(() => store.getters['timetable/currentTimetable'])
const totalCredits = computed(() => store.getters['timetable/totalCredits'])

const earnedCredits = computed(() => {
  return Object.values(currentTimetable.value || {}).reduce((sum, lec) => {
    return lec.creditStatus === 'earned' ? sum + (Number(lec.credits) || 0) : sum
  }, 0)
})

const failedCredits = computed(() => {
  return Object.values(currentTimetable.value || {}).reduce((sum, lec) => {
    return lec.creditStatus === 'failed' ? sum + (Number(lec.credits) || 0) : sum
  }, 0)
})

const userId = computed(() => store.getters['auth/userId'])

/** 今日の授業カードスタイル */
const colorMap = {
  orange: { bg: '#fff3e0', border: '#ff9800' },
  red: { bg: '#fce4ec', border: '#e91e63' },
  blue: { bg: '#e3f2fd', border: '#2196f3' },
  green: { bg: '#e8f5e9', border: '#4caf50' },
  purple: { bg: '#f3e5f5', border: '#9c27b0' },
  teal: { bg: '#e0f2f1', border: '#009688' },
  indigo: { bg: '#e8eaf6', border: '#3f51b5' },
  brown: { bg: '#efebe9', border: '#795548' },
}

const getTodayCardStyle = (lecture) => {
  const c = colorMap[lecture.color] || colorMap.orange
  return { backgroundColor: c.bg, borderLeftColor: c.border }
}

/** 時限の開始時刻 */
const periodStartMap = { 1: '09:10', 2: '10:40', 3: '13:10', 4: '14:50', 5: '16:20', 6: '18:00' }
const getPeriodStart = (period) => periodStartMap[period] || ''

/** 今日の日付ラベル */
const todayDateLabel = computed(() => {
  const d = new Date()
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日（${dayNames[d.getDay()]}）`
})

// 認証確定後に初回フェッチ（ログイン直後のみ）
watch(
  userId,
  (newId) => {
    if (newId) {
      store.dispatch('timetable/fetchTimetable')
    }
  },
  { immediate: true },
)

// keep-alive でページに戻ったとき: キャッシュがなければ再フェッチ
onActivated(() => {
  if (userId.value) {
    store.dispatch('timetable/fetchTimetable')
  }
})
// ページ離脱時の処理は不要（keep-alive でキャッシュが維持されるため）

const handleCellClick = ({ day, period }) => {
  if (!isAuthenticated.value) {
    void logFirebaseAnalyticsEvent('timetable_cell_click_guest', { day, period })
    router.push('/login')
    return
  }

  // 常にモーダルを開き、サクサク入力を担保する
  selectedCell.value = { day, period }
  showModal.value = true
}
</script>

<style scoped>
.timetable-page {
  padding: 1rem;
  padding-bottom: 80px;
}

/* ヘッダー */
.page-header {
  margin-bottom: 0.5rem;
}

/* total-credits deleted */

/* 今日の授業 */
.today-section {
  margin-bottom: 0.75rem;
}

.today-section-title {
  font-size: 0.85rem;
  font-weight: bold;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.today-date {
  font-size: 0.78rem;
  color: #aaa;
  font-weight: normal;
  margin-left: 4px;
}

.today-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.today-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  padding: 8px 12px;
  animation: slide-in 0.2s ease;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.today-card-period {
  font-size: 0.75rem;
  font-weight: bold;
  color: #ff9800;
  min-width: 28px;
  text-align: center;
}

.today-card-info {
  flex: 1;
  min-width: 0;
}

.today-card-name {
  font-size: 0.88rem;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-card-meta {
  display: flex;
  gap: 8px;
  font-size: 0.72rem;
  color: #888;
  margin-top: 2px;
}

.today-card-time {
  font-size: 0.75rem;
  font-weight: 600;
  color: #ff9800;
  white-space: nowrap;
}

.page-content {
  margin-top: 0;
}

/* 凡例 */
.lecture-legend {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
}

.legend-color.required {
  background-color: #e53935;
}

.legend-color.semi-required {
  background-color: #8e24aa;
}

.legend-color.elective {
  background-color: #ff9800;
  opacity: 0.5;
}
</style>
