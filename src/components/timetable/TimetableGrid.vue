<template>
  <div class="timetable-grid-container">
    <!-- ローディング中 -->
    <div v-if="isLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="orange" size="40" />
    </div>

    <!-- 未ログイン時の案内バナー -->
    <div v-else-if="!isLoggedIn" class="guest-banner">
      <v-icon color="orange" size="28">mdi-account-lock-outline</v-icon>
      <div class="guest-banner-text">
        <div class="guest-banner-title">ログインして時間割を登録しよう</div>
        <div class="guest-banner-sub">自分の講義をカレンダーに保存できます</div>
      </div>
    </div>

    <div class="timetable-grid">
      <!-- 角のセル -->
      <div class="grid-header-cell corner"></div>

      <!-- 曜日ヘッダー -->
      <div
        v-for="day in days"
        :key="day.value"
        class="grid-header-cell day"
        :class="{ 'today-col-header': isToday(day.value) }"
      >
        <span>{{ day.label }}</span>
        <span v-if="isToday(day.value)" class="today-dot"></span>
      </div>

      <!-- 各時限の行 -->
      <template v-for="period in periods" :key="period">
        <!-- 時限ヘッダー -->
        <div
          class="grid-header-cell period"
          :class="{ 'current-period-header': isCurrentPeriod(period) }"
        >
          <span class="period-num">{{ period }}</span>
          <span class="period-time">{{ getPeriodStart(period) }}</span>
          <span class="period-end-time">{{ getPeriodEnd(period) }}</span>
        </div>

        <!-- 各曜日のセル -->
        <div
          v-for="day in days"
          :key="`${day.value}-${period}`"
          class="grid-cell"
          :class="{
            'today-col': isToday(day.value),
            'current-period-row': isCurrentPeriod(period),
            'today-current': isToday(day.value) && isCurrentPeriod(period),
          }"
          @click="$emit('cellClick', { day: day.value, period })"
        >
          <div
            v-if="getLecture(day.value, period)"
            class="lecture-card"
            :style="getLectureCardStyle(day.value, period)"
          >
            <!-- 必修バッジ + 講義名 -->
            <div class="lecture-header">
              <div class="lecture-name">{{ getLecture(day.value, period).name }}</div>
            </div>
            <div class="lecture-detail">
              <span v-if="getLecture(day.value, period).room" class="lecture-room">
                <v-icon size="10" style="opacity: 0.7">mdi-map-marker</v-icon>
                {{ getLecture(day.value, period).room }}
              </span>
              <span v-if="getLecture(day.value, period).year" class="lecture-year"
                >{{ getLecture(day.value, period).year }}年</span
              >
            </div>
          </div>
          <div v-else class="add-icon">
            <v-icon size="small" color="#ddd">mdi-plus</v-icon>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

defineProps({
  days: {
    type: Array,
    default: () => [
      { label: '月', value: 'mon' },
      { label: '火', value: 'tue' },
      { label: '水', value: 'wed' },
      { label: '木', value: 'thu' },
      { label: '金', value: 'fri' },
    ],
  },
  periods: {
    type: Array,
    default: () => [1, 2, 3, 4, 5, 6],
  },
})

defineEmits(['cellClick'])

const store = useStore()

const isLoading = computed(() => store.getters['timetable/isLoading'])
const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])

const getLecture = (day, period) => {
  return store.getters['timetable/getLecture'](day, period)
}

/** 時限の開始・終了時刻 */
const periodTimes = {
  1: { start: '09:10', end: '10:40' },
  2: { start: '10:40', end: '12:10' },
  3: { start: '13:10', end: '14:40' },
  4: { start: '14:50', end: '16:20' },
  5: { start: '16:20', end: '17:50' },
  6: { start: '18:00', end: '19:30' },
}

const getPeriodStart = (period) => periodTimes[period]?.start || ''
const getPeriodEnd = (period) => periodTimes[period]?.end || ''

/** 今日の曜日コードを返す（0=日, 1=月...） */
const dayCodeMap = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' }
const todayCode = computed(() => dayCodeMap[new Date().getDay()] || '')

const isToday = (dayValue) => todayCode.value === dayValue

/**
 * 現在の時限を判定する
 *
 * @param {number} period - 時限番号
 * @returns {boolean} 現在の時限ならtrue
 */
const isCurrentPeriod = (period) => {
  const now = new Date()
  const [sh, sm] = periodTimes[period].start.split(':').map(Number)
  const [eh, em] = periodTimes[period].end.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return nowMin >= startMin && nowMin <= endMin
}

/** カラーパレット（8色） */
const colorPalette = {
  orange: { bg: '#fff3e0', border: '#ff9800', text: '#e65100', sub: '#ef6c00' },
  red: { bg: '#fce4ec', border: '#e91e63', text: '#c2185b', sub: '#e91e63' },
  blue: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0', sub: '#1976d2' },
  green: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', sub: '#388e3c' },
  purple: { bg: '#f3e5f5', border: '#9c27b0', text: '#6a1b9a', sub: '#8e24aa' },
  teal: { bg: '#e0f2f1', border: '#009688', text: '#00695c', sub: '#00897b' },
  indigo: { bg: '#e8eaf6', border: '#3f51b5', text: '#283593', sub: '#3949ab' },
  brown: { bg: '#efebe9', border: '#795548', text: '#4e342e', sub: '#6d4c41' },
}

const getLectureCardStyle = (day, period) => {
  const lecture = getLecture(day, period)
  if (!lecture) return {}
  const color = colorPalette[lecture.color] || colorPalette.orange

  let leftBorderColor = color.border
  let leftBorderWidth = '4px'

  if (lecture.required === 'req' || lecture.required === 'required') {
    leftBorderColor = '#e53935' // 赤
    leftBorderWidth = '6px'
  } else if (lecture.required === 'semi' || lecture.required === 'semi-required') {
    leftBorderColor = '#8e24aa' // 紫
    leftBorderWidth = '6px'
  }

  return {
    backgroundColor: color.bg,
    borderLeftColor: leftBorderColor,
    borderLeftWidth: leftBorderWidth,
    '--lecture-text': color.text,
    '--lecture-sub': color.sub,
  }
}
</script>

<style scoped>
.timetable-grid-container {
  overflow-x: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
}

.guest-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff9f0;
  border: 1px solid #ffe0b2;
  border-radius: 10px;
  padding: 14px 16px;
  margin: 0 0 12px;
}

.guest-banner-title {
  font-size: 0.92rem;
  font-weight: bold;
  color: #e65100;
}

.guest-banner-sub {
  font-size: 0.78rem;
  color: #ef6c00;
  margin-top: 2px;
}

.timetable-grid {
  display: grid;
  grid-template-columns: 48px repeat(5, 1fr);
  width: 100%;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

/* ヘッダー共通 */
.grid-header-cell {
  background-color: #f8f9fa;
  padding: 8px 4px;
  text-align: center;
  font-weight: bold;
  font-size: 0.85rem;
  color: #666;
  border-bottom: 2px solid #eee;
  border-right: 1px solid #eee;
}

/* 曜日ヘッダー */
.grid-header-cell.day {
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3px;
  position: relative;
}

/* 今日の曜日ヘッダー */
.grid-header-cell.day.today-col-header {
  background: linear-gradient(135deg, #ff9800, #ff6f00);
  color: white;
}

.today-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: white;
  opacity: 0.8;
}

/* 時限ヘッダー */
.grid-header-cell.period {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1px;
  background-color: #f8f9fa;
  border-right: 2px solid #eee;
  padding: 6px 4px;
}

.grid-header-cell.period.current-period-header {
  background: linear-gradient(135deg, #ff9800, #ff6f00);
  color: white;
}

.period-num {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.current-period-header .period-num {
  color: white;
}

.period-time {
  font-size: 0.6rem;
  color: #999;
  line-height: 1;
}

.period-end-time {
  font-size: 0.58rem;
  color: #bbb;
  line-height: 1;
}

.current-period-header .period-time,
.current-period-header .period-end-time {
  color: rgba(255, 255, 255, 0.85);
}

/* セル */
.grid-cell {
  aspect-ratio: 1 / 1.3;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.grid-cell:hover {
  background-color: #fff9f0;
}

/* 今日の列 */
.grid-cell.today-col {
  background-color: #fffde7;
}

.grid-cell.today-col:hover {
  background-color: #fff3e0;
}

/* 現在時限の行 */
.grid-cell.current-period-row {
  background-color: #f3f8ff;
}

/* 今日かつ現在時限 */
.grid-cell.today-current {
  background-color: #fff8e1;
  box-shadow: inset 0 0 0 2px #ffcc02;
}

/* 講義カード */
.lecture-card {
  width: 100%;
  height: 100%;
  border-left: 4px solid #ff9800;
  border-radius: 5px;
  padding: 5px 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: box-shadow 0.15s;
}

.lecture-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.lecture-name {
  font-size: 0.72rem;
  font-weight: bold;
  color: var(--lecture-text, #e65100);
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.25;
  word-break: break-all;
}

.lecture-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  margin-top: 2px;
}

.lecture-room {
  font-size: 0.6rem;
  color: var(--lecture-sub, #ef6c00);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 1px;
  flex: 1;
}

.lecture-credits {
  font-size: 0.58rem;
  color: var(--lecture-sub, #ef6c00);
  white-space: nowrap;
  font-weight: 600;
  opacity: 0.8;
}

.add-icon {
  opacity: 0.35;
  transition: opacity 0.15s;
}

.grid-cell:hover .add-icon {
  opacity: 0.6;
}

/* 講義ヘッダー（バッジ＋名前） */
.lecture-header {
  display: flex;
  align-items: flex-start;
  gap: 3px;
  flex: 1;
  overflow: hidden;
}

/* 年次ラベル */
.lecture-year {
  font-size: 0.58rem;
  color: var(--lecture-sub, #ef6c00);
  white-space: nowrap;
  font-weight: 600;
  opacity: 0.8;
}
</style>
