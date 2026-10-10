<template>
  <div class="event-schedule">
    <!-- 空状態 -->
    <EmptyState
      v-if="displayEvents.length === 0 && props.events"
      class="no-events-container"
      icon="mdi-calendar-search"
      title="該当するイベントはありません"
      message="別のキーワードで試してみてください"
    />
    <EmptyState
      v-else-if="displayEvents.length === 0"
      class="no-events-container"
      icon="mdi-calendar-blank-outline"
      title="この日のイベントはありません"
      message="別の日をカレンダーから選択してください"
    />

    <!-- イベントカードリスト -->
    <div v-else class="d-flex flex-column ga-3">
      <v-card
        v-for="event in displayEvents"
        :key="event.eventId"
        rounded="lg"
        elevation="1"
        class="event-card"
        :class="{ 'proxy-event-card': isProxyEvent(event) }"
        @click="goToEventDetail(event.eventId)"
      >
        <!-- 右上インフォボタン（代理登録のみ） -->
        <div v-if="isProxyEvent(event)" class="info-btn-wrapper">
          <v-menu location="bottom" :close-on-content-click="false" max-width="300">
            <template #activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                icon="mdi-information-outline"
                size="small"
                variant="text"
                color="grey-lighten-1"
                @click.stop
              />
            </template>
            <v-card rounded="lg" class="pa-3" max-width="300" @click.stop>
              <p class="text-body-2 text-grey-darken-3 mb-0">
                Waka-topiaが大学公式情報を元に代理投稿しています。団体の代表者は詳細画面から引き継ぎが可能です。
              </p>
            </v-card>
          </v-menu>
        </div>

        <!-- メインコンテンツ -->
        <v-card-text class="pa-4">
          <div class="d-flex align-start">
            <!-- 時間カラム -->
            <div class="time-column text-center mr-4 flex-shrink-0">
              <div v-if="props.events" class="date-badge mb-1">
                {{ formatDate(event.date) }}
              </div>
              <p class="text-body-1 font-weight-bold text-orange mb-0">
                {{ event.startTime }}
              </p>
              <v-icon size="14" color="grey-lighten-1" class="my-1">mdi-arrow-down</v-icon>
              <p class="text-body-2 font-weight-medium text-grey-darken-1 mb-0">
                {{ event.endTime }}
              </p>
            </div>

            <!-- 区切り線 -->
            <div class="time-divider mr-4"></div>

            <!-- 情報カラム -->
            <div class="info-column flex-grow-1 overflow-hidden">
              <!-- 右端の矢印（代理登録のときは右上のインフォボタン）と重ならないよう右に余白を取る -->
              <p
                class="text-h6 font-weight-bold mb-1 text-truncate"
                :class="isProxyEvent(event) ? 'pr-8' : 'pr-6'"
              >
                {{ event.organizerName }}
              </p>
              <!-- 概要が無い・短いときもカードの高さが変わらないよう、常に 2 行分を確保する -->
              <p class="text-body-2 text-grey-darken-1 mb-2 pr-6 description-text">
                {{ event.description }}
              </p>
              <!-- バッジ（small チップ）の有無で高さが変わらないよう、行の高さをチップに合わせて固定する -->
              <div class="d-flex align-center ga-1 location-row">
                <v-icon size="16" color="orange" class="flex-shrink-0">mdi-map-marker</v-icon>
                <span class="text-body-2 font-weight-medium text-orange text-truncate flex-grow-1">
                  {{ event.location }}
                </span>
                <div class="d-flex ga-1 flex-shrink-0">
                  <EventStatusChips
                    :is-official="event.isOfficial"
                    :is-proxy="isProxyEvent(event)"
                  />
                </div>
              </div>
            </div>

            <!-- 詳細矢印。場所の行がカードの右端まで使えるよう、レイアウトの外に重ねて置く -->
            <v-icon size="20" color="grey-lighten-1" class="detail-chevron">
              mdi-chevron-right
            </v-icon>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useProxyEvent } from '@/composables/useProxyEvent'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { formatShortDateWeekday, parseDateKey } from '@/utils/dateFormatter'
import EmptyState from '@/components/common/EmptyState.vue'
import EventStatusChips from '@/components/event/EventStatusChips.vue'

const router = useRouter()
const store = useStore()

const { isProxyEvent } = useProxyEvent()

const goToEventDetail = (eventId) => {
  void logFirebaseAnalyticsEvent('event_schedule_item_click', { eventId: String(eventId) })
  router.push(`/eventcal/${eventId}`)
}

const props = defineProps({
  /** 選択中の日付 (YYYY-MM-DD) */
  selectedDate: {
    type: String,
    default: '',
  },
  /** 表示するイベントリスト (指定がない場合は selectedDate から取得) */
  events: {
    type: Array,
    default: null,
  },
})

/** 表示するイベント一覧（検索結果があればそれを、なければ選択日のイベントを使う） */
const displayEvents = computed(() => {
  if (props.events) {
    return props.events
  }
  return store.getters['event/sortedEventsByDate'](props.selectedDate)
})

/**
 * 日付文字列を M/D(曜) 形式にフォーマットする
 *
 * @param {string} dateStr - YYYY-MM-DD 形式の日付文字列
 * @returns {string} M/D(曜) 形式
 */
const formatDate = (dateStr) => (dateStr ? formatShortDateWeekday(parseDateKey(dateStr)) : '')
</script>

<style scoped>
.event-schedule {
  padding: 0 16px 16px;
}

/* --- 空状態 --- */
.no-events-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border-radius: 16px;
  border: 1px dashed #e0e0e0;
}

/* --- イベントカード --- */
.event-card {
  cursor: pointer;
  position: relative;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 1px solid #f0f0f0;
}

/* --- 代理登録インフォボタン --- */
.info-btn-wrapper {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}

.event-card:active {
  transform: translateY(0);
}

/* --- 代理登録カード --- */
.proxy-event-card {
  border-left: 3px solid #ff9800;
}

/* --- 時間カラム --- */
.time-column {
  min-width: 60px;
}

.date-badge {
  display: inline-block;
  background-color: #fff3e0;
  color: #ff9900;
  border: 1px solid #ffcc80;
  padding: 0px 4px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1.4;
}

/* --- 区切り線 --- */
.time-divider {
  width: 2px;
  min-height: 48px;
  background: linear-gradient(180deg, #ff9800 0%, #ffe0b2 100%);
  border-radius: 1px;
  align-self: stretch;
}

/* --- 概要テキスト --- */
.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  min-height: 3em;
}

.location-row {
  height: 24px;
}

/* --- 詳細矢印 --- */
.detail-chevron {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
}

/* --- 引き継ぎCTAのパルスアニメーション --- */
.pulse-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
