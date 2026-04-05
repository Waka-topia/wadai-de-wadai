<template>
  <div class="event-list">
    <!-- 団体代表者向け告知バナー -->
    <v-alert
      v-if="showClaimBanner"
      variant="tonal"
      color="orange"
      closable
      class="mx-4 mt-4 mb-0"
      rounded="lg"
      @click:close="dismissBanner"
    >
      <template #prepend>
        <v-icon>mdi-bullhorn</v-icon>
      </template>
      <p class="text-body-2 font-weight-bold mb-1">新歓イベントの管理者を募集中！</p>
      <p class="text-caption mb-2">
        代表者証明で公式マーク付き＆上位表示。代理登録されたイベントを引き継いで自由に管理できます。
      </p>
      <v-btn
        size="small"
        color="orange"
        variant="flat"
        class="text-white font-weight-bold"
        to="/prove-owner"
        @click="onBannerCtaClick"
      >
        代表者証明をする
      </v-btn>
    </v-alert>

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

    <v-divider class="my-5"></v-divider>

    <v-btn class="font-weight-bold set-today-btn" rounded variant="outlined" @click="setToday">
      <v-icon left>mdi-calendar-today</v-icon>
      今日の新歓イベント
    </v-btn>

    <div class="nav-buttons">
      <button class="nav-btn" @click="changeDate(-1)">&#x3C;</button>
      <h3 class="title">{{ selectedDate }} の新歓イベント</h3>
      <button class="nav-btn" @click="changeDate(1)">&#x3E;</button>
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
/* --- レイアウト（既存） --- */
.event-list {
  height: 100%;
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-btn:hover {
  color: #ff9800;
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
