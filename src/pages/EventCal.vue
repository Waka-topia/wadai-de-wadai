<template>
  <div class="event-list">
    <!-- 団体代表者向け告知バナー -->
    <v-card
      v-if="showClaimBanner"
      class="claim-banner mx-4 mt-4 mb-0"
      rounded="lg"
      variant="outlined"
      color="orange"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-avatar color="orange" size="36" class="mr-3">
              <v-icon color="white" size="20">mdi-bullhorn</v-icon>
            </v-avatar>
            <p class="text-body-1 font-weight-bold mb-0">団体の代表者さんへ</p>
          </div>
          <v-btn icon size="x-small" variant="text" @click="dismissBanner">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="d-flex ga-3 mb-3 banner-steps">
          <div class="banner-step">
            <v-icon size="20" color="orange" class="mb-1">mdi-account-check</v-icon>
            <p class="text-caption font-weight-bold mb-0">代表者証明</p>
          </div>
          <v-icon size="16" color="grey-lighten-1" class="align-self-center">
            mdi-chevron-right
          </v-icon>
          <div class="banner-step">
            <v-icon size="20" color="blue" class="mb-1">mdi-check-decagram</v-icon>
            <p class="text-caption font-weight-bold mb-0">公式マーク</p>
          </div>
          <v-icon size="16" color="grey-lighten-1" class="align-self-center">
            mdi-chevron-right
          </v-icon>
          <div class="banner-step">
            <v-icon size="20" color="green" class="mb-1">mdi-arrow-up-bold-circle</v-icon>
            <p class="text-caption font-weight-bold mb-0">上位表示</p>
          </div>
        </div>

        <v-btn
          color="orange"
          variant="flat"
          block
          class="text-white font-weight-bold"
          to="/prove-owner"
          @click="onBannerCtaClick"
        >
          <v-icon start>mdi-arrow-right-circle</v-icon>
          代表者証明を始める
        </v-btn>
      </v-card-text>
    </v-card>

    <VueCal
      class="vuecal"
      :disable-views="['years', 'year', 'week', 'day']"
      :events="events"
      :max-date="maxDate"
      :min-date="minDate"
      :selected-date="selectedDate"
      active-view="month"
      hide-view-selector
      locale="en"
      start-week-on-sunday
      @cell-click="onCellClick"
    ></VueCal>

    <v-divider class="my-4"></v-divider>

    <v-btn class="font-weight-bold set-today-btn" rounded variant="outlined" @click="setToday">
      <v-icon start size="18">mdi-calendar-today</v-icon>
      今日の新歓イベント
    </v-btn>

    <!-- 改善された日付ナビゲーション -->
    <div class="date-nav">
      <v-btn icon variant="text" size="small" @click="changeDate(-1)">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="date-display">
        <v-icon size="18" color="orange" class="mr-2">mdi-calendar</v-icon>
        <span class="text-body-1 font-weight-bold">{{ formattedDate }}</span>
      </div>
      <v-btn icon variant="text" size="small" @click="changeDate(1)">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <EventSchedule v-model:selected-date="selectedDate" />

    <EditEventFormButton />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import EventSchedule from '@/components/event/EventSchedule.vue'
import EditEventFormButton from '@/components/event/EditEventFormButton.vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { useFirebasePageView } from '@/composables/useFirebasePageView'

const store = useStore()

// --- 告知バナーの表示制御 ---
const bannerDismissedKey = 'event_claim_banner_dismissed'
const isLoggedIn = computed(() => !!store.getters['auth/userId'])
const bannerDismissed = ref(localStorage.getItem(bannerDismissedKey) === 'true')

/** バナーを表示するかどうかの判定 ログイン済みかつ、バナーを閉じていない場合に表示 */
const showClaimBanner = computed(() => isLoggedIn.value && !bannerDismissed.value)

/** バナーを閉じてlocalStorageに記録する */
const dismissBanner = () => {
  bannerDismissed.value = true
  localStorage.setItem(bannerDismissedKey, 'true')
  void logFirebaseAnalyticsEvent('event_claim_banner_dismiss', {})
}

/** バナーのCTAボタンクリック時のアナリティクスイベント */
const onBannerCtaClick = () => {
  void logFirebaseAnalyticsEvent('event_claim_banner_cta_click', {})
}

/** 選択中の日付を日本語フォーマットで表示する */
const formattedDate = computed(() => {
  const d = new Date(selectedDate.value)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[d.getDay()]
  return `${month}月${day}日（${weekday}）の新歓イベント`
})

const events = computed(() => {
  const storeEvents = store.getters['event/allEvents']
  return storeEvents.map((event) => ({
    start: new Date(`${event.date}T${event.startTime}`),
    end: new Date(`${event.date}T${event.endTime}`),
    title: event.organizerName,
    class: event.class,
    location: event.location,
    description: event.description,
    organizerName: event.organizerName,
    eventId: event.eventId,
    organizerId: event.organizerId,
  }))
})

const toDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDate = ref(toDateString(new Date()))

watch(selectedDate, (newDate) => {
  const monthKey = newDate.substring(0, 7)
  store.dispatch('event/fetchEvents', { monthKey })
})

useFirebasePageView('view_event_calendar', () => ({
  initialDate: selectedDate.value,
}))

const minDate = ref(new Date('2025-04-01'))
const maxDate = ref(new Date('2026-05-31'))

const onCellClick = (date) => {
  const dateString = toDateString(date)
  selectedDate.value = dateString

  logFirebaseAnalyticsEvent('calendar_date_click', {
    selectedDate: dateString,
  })
}

const setToday = () => {
  const todayString = toDateString(new Date())
  selectedDate.value = todayString

  logFirebaseAnalyticsEvent('calendar_set_today', {
    currentDate: todayString,
  })
}

const changeDate = (days) => {
  const currentDate = new Date(selectedDate.value)
  currentDate.setDate(currentDate.getDate() + days)
  const newDateString = toDateString(currentDate)
  selectedDate.value = newDateString
  void logFirebaseAnalyticsEvent('calendar_nav_click', {
    direction: days > 0 ? 'next' : 'prev',
    targetDate: newDateString,
  })
}

onMounted(() => {
  const monthKey = selectedDate.value.substring(0, 7)
  store.dispatch('event/fetchEvents', { monthKey })
})
</script>

<style>
/* --- レイアウト --- */
.event-list {
  height: 100%;
}

/* --- バナーステップ --- */
.banner-steps {
  justify-content: center;
}

.banner-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
}

/* --- 日付ナビゲーション --- */
.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 16px;
}

.date-display {
  display: flex;
  align-items: center;
  background: #fff8e1;
  border-radius: 20px;
  padding: 6px 16px;
}

/* --- VueCal コンテナ --- */
.vuecal {
  border-radius: 16px;
  border: 1px solid #ddd;
  background-color: #fff;
  overflow: hidden;
  height: auto;
  margin: 16px 16px 0;
}

/* --- タイトルバー（月ナビゲーション） --- */
.vuecal__title-bar {
  background-color: transparent;
  padding: 12px 8px;
  min-height: 48px;
}

.vuecal__title {
  font-weight: 600;
  font-size: 0.8em;
  color: #333;
}

.vuecal__arrow {
  color: #666;
  padding: 4px 8px;
  font-size: 1.1em;
  transition: color 0.2s ease;
}

.vuecal__arrow:hover {
  color: #ff9900;
}

/* --- 曜日ヘッダー --- */
.vuecal__weekdays-headings {
  padding: 0 8px;
}

.vuecal__heading {
  color: #999;
  font-size: 0.85em;
  font-weight: 500;
  height: 2.4em;
}

/* --- カレンダーグリッド --- */
.vuecal__body {
  padding: 0 4px 4px;
}

.vuecal__cell::before {
  border: none !important;
}

.vuecal__cell {
  padding: 4px 0;
  min-height: 44px;
}

.vuecal__cell-content {
  width: 36px;
  height: 36px;
  max-width: 36px;
  max-height: 36px;
  border-radius: 50%;
  font-size: 0.9em;
  color: #333;
  transition: background-color 0.2s ease;
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 0;
  flex-shrink: 0;
}

/* --- 今日のセル（選択されていない場合は通常表示） --- */
.vuecal__cell--today {
  background-color: transparent !important;
}

/* --- 選択セル（常に1つだけオレンジ円） --- */
.vuecal__cell--selected {
  background-color: transparent !important;
}

.vuecal__cell--selected .vuecal__cell-content {
  border: 2px solid #ff9900;
  background-color: #ff9900;
  color: #fff;
  font-weight: 600;
}

/* --- スコープ外の日付 --- */
.vuecal__cell--out-of-scope {
  opacity: 0.3;
}

.vuecal__cell--out-of-scope .vuecal__cell-content {
  color: #ccc;
}

/* --- イベントインジケーター（ドット表示） --- */
.vuecal__cell-events-count {
  width: 6px;
  height: 6px;
  min-width: 6px;
  padding: 0;
  margin-top: 2px;
  border-radius: 50%;
  background-color: #ff9900;
  color: transparent;
  font-size: 0;
  line-height: 0;
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.vuecal__event {
  display: none;
}

.vuecal__no-event {
  display: none;
}
</style>
