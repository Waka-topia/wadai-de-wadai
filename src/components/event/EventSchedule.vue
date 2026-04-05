<template>
  <div class="event-schedule">
    <!-- 空状態 -->
    <div v-if="filteredEvents.length === 0" class="no-events-container">
      <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-calendar-blank-outline</v-icon>
      <p class="text-body-1 font-weight-bold text-grey-darken-1 mb-1">
        この日のイベントはありません
      </p>
      <p class="text-caption text-grey">別の日をカレンダーから選択してください</p>
    </div>

    <!-- イベントカードリスト -->
    <div v-else class="d-flex flex-column ga-3">
      <v-card
        v-for="event in filteredEvents"
        :key="event.eventId"
        rounded="lg"
        elevation="1"
        class="event-card"
        @click="goToEventDetail(event.eventId)"
      >
        <!-- 上部バッジエリア -->
        <div v-if="event.isOfficial || isProxyEvent(event)" class="badge-area px-4 pt-3 pb-0">
          <div class="d-flex ga-2 flex-wrap">
            <v-chip
              v-if="event.isOfficial"
              size="small"
              color="blue"
              variant="flat"
              class="font-weight-bold"
              label
            >
              <v-icon start size="14">mdi-check-decagram</v-icon>
              公式認定
            </v-chip>
            <v-chip
              v-if="isProxyEvent(event)"
              size="small"
              color="orange"
              variant="flat"
              class="font-weight-bold text-white"
              label
            >
              <v-icon start size="14">mdi-account-question-outline</v-icon>
              代理登録 — 代表者の方はこちら
            </v-chip>
          </div>
          <p
            v-if="isProxyEvent(event)"
            class="text-caption text-grey-darken-1 mt-2 mb-0 proxy-note"
          >
            <v-icon size="12" color="grey" class="mr-1">mdi-information-outline</v-icon>
            Waka-topiaが大学公式情報を元に代理投稿しています。団体の代表者は詳細画面から引き継ぎが可能です。
          </p>
        </div>

        <!-- メインコンテンツ -->
        <v-card-text class="pa-4">
          <div class="d-flex align-start">
            <!-- 時間カラム -->
            <div class="time-column text-center mr-4 flex-shrink-0">
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
              <p class="text-h6 font-weight-bold mb-1 text-truncate">
                {{ event.organizerName }}
              </p>
              <p
                v-if="event.description"
                class="text-body-2 text-grey-darken-3 mb-2 description-text"
              >
                {{
                  event.description.length > 50
                    ? event.description.substring(0, 50) + '...'
                    : event.description
                }}
              </p>
              <div class="d-flex align-center">
                <v-icon size="16" color="orange" class="mr-1">mdi-map-marker</v-icon>
                <span class="text-body-2 font-weight-medium text-orange">
                  {{ event.location }}
                </span>
              </div>
            </div>

            <!-- 詳細矢印 -->
            <v-icon size="20" color="grey-lighten-1" class="align-self-center ml-2 flex-shrink-0">
              mdi-chevron-right
            </v-icon>
          </div>
        </v-card-text>

        <!-- 代理登録イベント用の引き継ぎCTA -->
        <div v-if="isProxyEvent(event)" class="claim-cta px-4 pb-3">
          <v-divider class="mb-3" />
          <div class="d-flex align-center">
            <v-icon size="18" color="orange" class="mr-2 pulse-icon"
              >mdi-hand-pointing-right</v-icon
            >
            <span class="text-body-2 font-weight-bold text-orange">
              タップして引き継ぎ → 公式マーク＆上位表示
            </span>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { adminUserId } from '@/config/constants'
import { hashValue } from '@/utils/crypto'

const router = useRouter()
const store = useStore()

const hashedAdminUserId = ref('')

onMounted(async () => {
  hashedAdminUserId.value = await hashValue(adminUserId)
})

/**
 * イベントが運営による代理登録かどうかを判定する
 *
 * @param {object} event イベントデータ
 * @returns {boolean} 運営代理登録の場合true
 */
const isProxyEvent = (event) => {
  return event.createdBy === hashedAdminUserId.value
}

const goToEventDetail = (eventId) => {
  void logFirebaseAnalyticsEvent('event_schedule_item_click', { eventId: String(eventId) })
  router.push(`/eventcal/${eventId}`)
}

const props = defineProps({
  selectedDate: {
    type: String,
    default: '',
  },
})

const filteredEvents = computed(() => {
  return store.getters['event/sortedEventsByDate'](props.selectedDate)
})
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 1px solid #f0f0f0;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}

.event-card:active {
  transform: translateY(0);
}

/* --- 時間カラム --- */
.time-column {
  min-width: 52px;
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
