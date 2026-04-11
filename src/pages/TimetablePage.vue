<template>
  <div class="timetable-page">
    <header class="page-header">
      <TimetableHeaderControls v-if="isAuthenticated" />

      <div v-if="isAuthenticated" class="d-flex justify-center mt-3 mb-1">
        <v-btn-toggle
          v-model="activeQuarter"
          color="orange"
          variant="outlined"
          density="compact"
          mandatory
        >
          <v-btn value="all" class="px-4 font-weight-bold">半期全体</v-btn>
          <v-btn v-if="currentSemester === 'first'" value="1Q" class="px-5 font-weight-bold"
            >1Qのみ</v-btn
          >
          <v-btn v-if="currentSemester === 'first'" value="2Q" class="px-5 font-weight-bold"
            >2Qのみ</v-btn
          >
          <v-btn v-if="currentSemester === 'second'" value="3Q" class="px-5 font-weight-bold"
            >3Qのみ</v-btn
          >
          <v-btn v-if="currentSemester === 'second'" value="4Q" class="px-5 font-weight-bold"
            >4Qのみ</v-btn
          >
        </v-btn-toggle>
      </div>

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
          <span class="font-weight-bold text-teal-darken-3"
            >登録: {{ totalCredits }}単位(半期計)</span
          >
          <span v-if="earnedCredits > 0" class="ml-2 font-weight-bold text-teal-darken-1"
            >(取得: {{ earnedCredits }})</span
          >
          <span v-if="failedCredits > 0" class="ml-2 font-weight-bold text-error"
            >(落単: {{ failedCredits }})</span
          >
        </div>
      </div>
    </header>

    <main class="page-content">
      <TimetableGrid @cell-click="handleCellClick" />
    </main>

    <v-bottom-sheet v-model="showChoiceSheet" max-width="600">
      <v-card rounded="t-xl" class="pa-4 pb-6">
        <div class="d-flex justify-center mb-3">
          <div style="width: 36px; height: 4px; border-radius: 2px; background: #ddd" />
        </div>
        <div class="text-subtitle2 font-weight-bold text-center mb-4">
          {{ pendingCellLabel }}に追加する方法を選んでください
        </div>
        <div class="d-flex flex-column ga-3">
          <v-btn
            color="orange"
            class="text-white font-weight-bold"
            variant="flat"
            size="large"
            rounded="lg"
            prepend-icon="mdi-book-search"
            @click="handleChoiceSyllabus"
          >
            みんなのシラバスから検索
          </v-btn>
          <v-btn
            color="orange"
            class="text-orange font-weight-bold"
            variant="outlined"
            size="large"
            rounded="lg"
            prepend-icon="mdi-pencil"
            @click="handleChoiceManual"
          >
            自分で入力する
          </v-btn>
        </div>
      </v-card>
    </v-bottom-sheet>

    <LectureEditorModal
      v-model="showModal"
      :selected-cell="selectedCell"
      @saved="onLectureSaved"
      @deleted="onLectureDeleted"
    />

    <section v-if="isAuthenticated && todayLectures.length > 0" class="today-section">
      <div class="today-section-title">
        <v-icon size="16" color="orange">mdi-calendar-today</v-icon>今日の授業<span
          class="today-date"
          >{{ todayDateLabel }}</span
        >
      </div>
      <div class="today-cards">
        <div
          v-for="lecture in todayLectures"
          :key="lecture.id"
          class="today-card"
          :style="getTodayCardStyle(lecture)"
        >
          <div class="today-card-period">{{ lecture.period }}限</div>
          <div class="today-card-info">
            <div class="today-card-name">{{ lecture.name }}</div>
            <div class="today-card-meta">
              <span v-if="lecture.room"
                ><v-icon size="11" style="opacity: 0.7">mdi-map-marker</v-icon
                >{{ lecture.room }}</span
              >
              <span v-if="lecture.teacher">{{ lecture.teacher }}</span>
            </div>
          </div>
          <div class="today-card-time">{{ getPeriodStart(lecture.period) }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onActivated } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import TimetableHeaderControls from '@/components/timetable/TimetableHeaderControls.vue'
import TimetableGrid from '@/components/timetable/TimetableGrid.vue'
import LectureEditorModal from '@/components/timetable/LectureEditorModal.vue'

const store = useStore()
const router = useRouter()

useFirebasePageView('view_timetable', () => ({ loggedIn: store.getters['auth/isAuthenticated'] }))
const showModal = ref(false)
const selectedCell = ref(null)
const showChoiceSheet = ref(false)
const pendingCell = ref(null)

const { showSnackbar } = useSnackbar()

const onLectureSaved = (lectureName) =>
  showSnackbar(`「${lectureName}」を保存しました`, 'success', { icon: 'mdi-check-circle' })
const onLectureDeleted = () =>
  showSnackbar('講義を削除しました', 'success', { icon: 'mdi-check-circle' })

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const todayLectures = computed(() => store.getters['timetable/todayLectures'])
const currentTimetable = computed(() => store.getters['timetable/currentTimetable'])
const totalCredits = computed(() => store.getters['timetable/totalCredits'])

const currentSemester = computed(() => store.getters['timetable/semester'])
const activeQuarter = computed({
  get: () => store.state.timetable.displayQuarter || 'all',
  set: (val) => store.commit('timetable/SET_DISPLAY_QUARTER', val),
})

const earnedCredits = computed(() => {
  // 配列化されたためフラットにして計算
  const arr = Object.values(currentTimetable.value || {}).flat()
  return arr.reduce(
    (sum, lec) => (lec.creditStatus === 'earned' ? sum + (Number(lec.credits) || 0) : sum),
    0,
  )
})

const failedCredits = computed(() => {
  const arr = Object.values(currentTimetable.value || {}).flat()
  return arr.reduce(
    (sum, lec) => (lec.creditStatus === 'failed' ? sum + (Number(lec.credits) || 0) : sum),
    0,
  )
})

const userId = computed(() => store.getters['auth/userId'])

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

const periodStartMap = { 1: '09:10', 2: '10:40', 3: '13:10', 4: '14:50', 5: '16:20', 6: '18:00' }
const getPeriodStart = (period) => periodStartMap[period] || ''

const todayDateLabel = computed(() => {
  const d = new Date()
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日（${dayNames[d.getDay()]}）`
})

watch(
  userId,
  (newId) => {
    if (newId) store.dispatch('timetable/fetchTimetable')
  },
  { immediate: true },
)
onActivated(() => {
  if (userId.value) store.dispatch('timetable/fetchTimetable')
})

const dayLabels = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金' }
const pendingCellLabel = computed(() => {
  if (!pendingCell.value) return ''
  const { day, period } = pendingCell.value
  return `${dayLabels[day] || ''}曜日 ${period}限`
})

const handleCellClick = ({ day, period, lectureId }) => {
  if (!isAuthenticated.value) {
    void logFirebaseAnalyticsEvent('timetable_cell_click_guest', { day, period })
    router.push('/login')
    return
  }
  if (lectureId) {
    selectedCell.value = { day, period, lectureId }
    showModal.value = true
  } else {
    pendingCell.value = { day, period, lectureId: null }
    showChoiceSheet.value = true
  }
}

const handleChoiceSyllabus = () => {
  showChoiceSheet.value = false
  const { day, period } = pendingCell.value
  void logFirebaseAnalyticsEvent('lecture_add_choice_syllabus', { day, period })
  router.push({ path: '/syllabus-search', state: { targetDay: day, targetPeriod: period } })
}

const handleChoiceManual = () => {
  showChoiceSheet.value = false
  selectedCell.value = pendingCell.value
  showModal.value = true
}
</script>

<style scoped>
.timetable-page {
  padding: 1rem;
  padding-bottom: 80px;
}
.page-header {
  margin-bottom: 0.5rem;
}
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
