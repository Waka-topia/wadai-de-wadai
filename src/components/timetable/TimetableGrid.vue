<template>
  <div class="timetable-grid-container">
    <div v-if="isLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="orange" size="40" />
    </div>

    <div v-else-if="!isLoggedIn" class="guest-banner">
      <v-icon color="orange" size="28">mdi-account-lock-outline</v-icon>
      <div class="guest-banner-text">
        <div class="guest-banner-title">ログインして時間割を登録しよう</div>
        <div class="guest-banner-sub">自分の講義をカレンダーに保存できます</div>
      </div>
    </div>

    <div class="timetable-grid">
      <div class="grid-header-cell corner"></div>

      <div
        v-for="day in days"
        :key="day.value"
        class="grid-header-cell day"
        :class="{ 'today-col-header': isToday(day.value) }"
      >
        <span>{{ day.label }}</span>
        <span v-if="isToday(day.value)" class="today-dot"></span>
      </div>

      <template v-for="period in periods" :key="period">
        <div
          class="grid-header-cell period"
          :class="{ 'current-period-header': isCurrentPeriod(period) }"
        >
          <span class="period-num">{{ period }}</span>
          <span class="period-time">{{ getPeriodStart(period) }}</span>
          <span class="period-end-time">{{ getPeriodEnd(period) }}</span>
        </div>

        <div
          v-for="day in days"
          :key="`${day.value}-${period}`"
          class="grid-cell"
          :class="{
            'today-col': isToday(day.value),
            'current-period-row': isCurrentPeriod(period),
            'today-current': isToday(day.value) && isCurrentPeriod(period),
          }"
          @click="onCellClick(day.value, period)"
        >
          <template v-if="getLectures(day.value, period).length > 0">
            <div
              v-for="lecture in getLectures(day.value, period)"
              :key="lecture.id"
              class="lecture-card"
              :style="getLectureCardStyle(lecture)"
              @click.stop="onCellClick(day.value, period, lecture.id)"
            >
              <div class="lecture-header">
                <div class="lecture-name">{{ lecture.name }}</div>
              </div>
              <div class="lecture-detail">
                <span v-if="lecture.room" class="lecture-room">
                  <v-icon size="10" style="opacity: 0.7">mdi-map-marker</v-icon>
                  {{ lecture.room }}
                </span>
                <span v-if="lecture.year" class="lecture-year">{{ lecture.year }}年</span>
              </div>
            </div>
          </template>

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
import {
  getWeekdayCode,
  lectureColorPalette,
  periodTimes,
  requiredColors,
  weekdays,
} from '@/config/timetable'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

defineProps({
  days: {
    type: Array,
    default: () => [...weekdays],
  },
  periods: { type: Array, default: () => [1, 2, 3, 4, 5, 6] },
})

const emit = defineEmits(['cellClick'])
const store = useStore()

// IDを含めてEmitする
const onCellClick = (day, period, lectureId = null) => {
  if (isLoggedIn.value) void logFirebaseAnalyticsEvent('timetable_grid_cell_click', { day, period })
  emit('cellClick', { day, period, lectureId })
}

const isLoading = computed(() => store.getters['timetable/isLoading'])
const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])

// 配列を取得するGetterに変更
const getLectures = (day, period) => store.getters['timetable/getLectures'](day, period)

const getPeriodStart = (period) => periodTimes[period]?.start || ''
const getPeriodEnd = (period) => periodTimes[period]?.end || ''

const todayCode = computed(() => getWeekdayCode())
const isToday = (dayValue) => todayCode.value === dayValue

const isCurrentPeriod = (period) => {
  const now = new Date()
  const [sh, sm] = periodTimes[period].start.split(':').map(Number)
  const [eh, em] = periodTimes[period].end.split(':').map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em
}

const getLectureCardStyle = (lecture) => {
  if (!lecture) return {}
  const color = lectureColorPalette[lecture.color] || lectureColorPalette.orange
  let leftBorderColor = color.border
  let leftBorderWidth = '4px'

  if (lecture.required === 'req' || lecture.required === 'required') {
    leftBorderColor = requiredColors.req
    leftBorderWidth = '6px'
  } else if (lecture.required === 'semi' || lecture.required === 'semi-required') {
    leftBorderColor = requiredColors.semi
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
  grid-template-columns: 44px repeat(5, 1fr);
  grid-auto-rows: auto;
  width: 100%;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: #eee;
  gap: 1px;
}

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
.grid-header-cell.day {
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3px;
  position: relative;
}
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
.grid-header-cell.period {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1px;
  background-color: #f8f9fa;
  padding: 4px 2px;
  height: 100%;
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

/* セルのスタイル（複数対応） */
.grid-cell {
  background-color: white;
  aspect-ratio: 1 / 1.35;
  min-height: 0;
  padding: 2px;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  overflow: hidden;
  gap: 2px; /* 複数カードがある場合の隙間 */
}
/* PC ではセルが横に広くなり、縦横比のままだと縦に間延びするので高さを固定する（スマホのセルより少し高い程度） */
@media (min-width: 960px) {
  .grid-cell {
    aspect-ratio: auto;
    height: 96px;
  }
}
.grid-cell:hover {
  background-color: #fff9f0;
}
.grid-cell.today-col {
  background-color: #fffde7;
}
.grid-cell.today-col:hover {
  background-color: #fff3e0;
}
.grid-cell.current-period-row {
  background-color: #f3f8ff;
}
.grid-cell.today-current {
  background-color: #fff8e1;
  box-shadow: inset 0 0 0 2px #ffcc02;
}

/* 講義カード */
.lecture-card {
  flex: 1; /* 複数ある場合は均等に分割、1つの場合は全高 */
  min-height: 0;
  border-left: 4px solid #ff9800;
  border-radius: 4px;
  padding: 4px 3px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.lecture-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.lecture-name {
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--lecture-text, #e65100);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.25;
  word-break: break-all;
  margin-bottom: 2px;
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
.add-icon {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.35;
  transition: opacity 0.15s;
}
.grid-cell:hover .add-icon {
  opacity: 0.6;
}
.lecture-header {
  display: flex;
  align-items: flex-start;
  gap: 3px;
  flex: 1;
  overflow: hidden;
}
.lecture-year {
  font-size: 0.58rem;
  color: var(--lecture-sub, #ef6c00);
  white-space: nowrap;
  font-weight: 600;
  opacity: 0.8;
}
</style>
