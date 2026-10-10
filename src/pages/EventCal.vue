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

        <StepFlow class="mb-3" :steps="bannerSteps" />

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

    <!-- 検索バーエリア -->
    <SearchField v-model="searchQuery" class="mx-4 mt-4" placeholder="団体名で検索" />

    <!-- 検索情報の表示 -->
    <div v-if="searchQuery" class="mx-4 mt-2">
      <span class="text-caption font-weight-bold text-grey-darken-1">検索結果を表示中</span>
    </div>

    <VueCal
      v-show="!searchQuery"
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

    <div v-show="!searchQuery">
      <v-divider class="my-4"></v-divider>

      <!-- 日付ナビゲーション（前日・表示中の日付・翌日・今日へ戻る） -->
      <div class="date-nav">
        <v-btn icon variant="text" size="small" aria-label="前の日" @click="changeDate(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div class="date-display">
          <span class="text-body-1 font-weight-bold text-no-wrap">{{ formattedDate }}</span>
        </div>
        <v-btn icon variant="text" size="small" aria-label="次の日" @click="changeDate(1)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          color="orange-darken-2"
          rounded="pill"
          class="font-weight-bold"
          :disabled="isToday"
          @click="setToday"
        >
          今日
        </v-btn>
      </div>
    </div>

    <EventSchedule v-model:selected-date="selectedDate" :events="searchedEvents" />

    <!-- イベント追加フォーム -->
    <BaseBottomSheet title="新歓イベントの登録">
      <template #activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          class="text-white font-weight-bold fab-btn py-7 px-5 d-flex align-center justify-center"
          color="orange"
          variant="elevated"
          elevation="4"
          rounded="pill"
          @click="logFirebaseAnalyticsEvent('event_edit_form_open', {})"
        >
          団体向けフォーム
        </v-btn>
      </template>
      <template #default="{ close, isOpen }">
        <EventForm v-if="isOpen" @success="close" />
      </template>
    </BaseBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import BaseBottomSheet from '@/components/common/BaseBottomSheet.vue'
import SearchField from '@/components/common/SearchField.vue'
import EventForm from '@/components/event/EventForm.vue'
import EventSchedule from '@/components/event/EventSchedule.vue'
import StepFlow from '@/components/event/StepFlow.vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { eventDateMax, eventDateMin } from '@/config/constants'
import { formatMonthDayWeekday, parseDateKey, toDateKey } from '@/utils/dateFormatter'

const store = useStore()

// --- 検索機能 ---
const searchQuery = ref('')

// 検索対象の期間（今月から前後何か月分か）
const searchMonthRange = 1

/**
 * 今月から月数をずらした月の 1 日を返す
 *
 * @param {number} offset - ずらす月数（負の値で過去）
 * @returns {Date} その月の 1 日
 */
const getMonthStart = (offset) => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth() + offset, 1)
}

/**
 * 検索結果を表示する期間（前月の 1 日〜翌月の末日）を返す
 *
 * @returns {{ start: string; end: string }} YYYY-MM-DD 形式の開始日と終了日
 */
const getSearchPeriod = () => ({
  start: toDateKey(getMonthStart(-searchMonthRange)),
  // 翌々月の 1 日の前日 = 翌月の末日
  end: toDateKey(new Date(getMonthStart(searchMonthRange + 1).getTime() - 1)),
})

// イベントは月単位で読み込むため、検索を始めたら期間内の月をまとめて読み込む
watch(
  () => !!searchQuery.value,
  (isSearching) => {
    if (!isSearching) return
    for (let offset = -searchMonthRange; offset <= searchMonthRange; offset++) {
      const monthKey = toDateKey(getMonthStart(offset)).substring(0, 7)
      store.dispatch('event/fetchEvents', { monthKey })
    }
  },
)

/** 検索ワードに基づいてイベントをフィルタリングする */
const searchedEvents = computed(() => {
  if (!searchQuery.value) return null
  const query = searchQuery.value.toLowerCase()
  const rawEvents = store.getters['event/allEvents']
  const { start, end } = getSearchPeriod()

  return rawEvents
    .filter((event) => {
      const isInPeriod = event.date >= start && event.date <= end
      const matchesQuery =
        event.organizerName?.toLowerCase().includes(query) ||
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      return isInPeriod && matchesQuery
    })
    .sort((a, b) => {
      // 日付と開始時間でソート
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.startTime.localeCompare(b.startTime)
    })
})

// --- 告知バナーの表示制御 ---
const bannerDismissedKey = 'event_claim_banner_dismissed'
const isLoggedIn = computed(() => !!store.getters['auth/userId'])
const bannerDismissed = ref(localStorage.getItem(bannerDismissedKey) === 'true')

/** バナーを表示するかどうかの判定 ログイン済みかつ、バナーを閉じていない場合に表示 */
const showClaimBanner = computed(() => isLoggedIn.value && !bannerDismissed.value)

// 代表者証明をすると得られるメリットの流れ
const bannerSteps = [
  { label: '代表者証明', icon: 'mdi-account-check', color: 'orange' },
  { label: '公式マーク', icon: 'mdi-check-decagram', color: 'blue' },
  { label: '上位表示', icon: 'mdi-arrow-up-bold-circle', color: 'green' },
]

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

/** 選択中の日付を日本語フォーマットで表示する（狭い画面でも折り返さないよう日付だけにする） */
const formattedDate = computed(() => formatMonthDayWeekday(parseDateKey(selectedDate.value)))

/** 今日を選択中か（「今日」ボタンを押せなくするために使う） */
const isToday = computed(() => selectedDate.value === toDateKey(new Date()))

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

const selectedDate = ref(toDateKey(new Date()))

watch(selectedDate, (newDate) => {
  const monthKey = newDate.substring(0, 7)
  store.dispatch('event/fetchEvents', { monthKey })
})

useFirebasePageView('view_event_calendar', () => ({
  initialDate: selectedDate.value,
}))

const minDate = ref(parseDateKey(eventDateMin))
const maxDate = ref(parseDateKey(eventDateMax))

const onCellClick = (date) => {
  const dateString = toDateKey(date)
  selectedDate.value = dateString

  logFirebaseAnalyticsEvent('calendar_date_click', {
    selectedDate: dateString,
  })
}

const setToday = () => {
  const todayString = toDateKey(new Date())
  selectedDate.value = todayString

  logFirebaseAnalyticsEvent('calendar_set_today', {
    currentDate: todayString,
  })
}

const changeDate = (days) => {
  const currentDate = parseDateKey(selectedDate.value)
  currentDate.setDate(currentDate.getDate() + days)
  const newDateString = toDateKey(currentDate)
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
/* --- 日付ナビゲーション --- */
.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
  padding: 0 16px;
}

.date-display {
  display: flex;
  align-items: center;
  padding: 6px 12px;
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

/* --- FABボタン --- */
.fab-btn {
  position: fixed;
  bottom: 100px;
  right: 16px;
  z-index: 1000;
}

/* PC では下部バーが無いので下へ寄せる。ただし高さ 40px のフッターに隠れないよう、その上に出す */
@media (min-width: 960px) {
  .fab-btn {
    bottom: 56px;
    right: 24px;
  }
}
</style>
