<template>
  <div class="event-schedule">
    <div v-if="filteredEvents.length === 0" class="no-events">イベントはありません</div>

    <div v-else class="d-flex flex-column ga-2">
      <div
        v-for="event in filteredEvents"
        :key="event.eventId"
        :to="'/eventcal/' + event.eventId"
        class="border-md rounded-lg"
        @click="goToEventDetail(event.eventId)"
      >
        <v-row class="py-4">
          <v-col
            class="text-center justify-center align-center font-weight-bold text-body-2"
            cols="3"
          >
            <div>
              {{ event.startTime }}
            </div>
            <div>〜</div>
            <div>
              {{ event.endTime }}
            </div>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="9">
            <div>
              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip
                  v-if="event.isOfficial"
                  size="x-small"
                  color="blue"
                  variant="flat"
                  class="font-weight-bold"
                >
                  公式
                </v-chip>
                <v-chip
                  v-if="isProxyEvent(event)"
                  size="x-small"
                  color="orange"
                  variant="outlined"
                  class="font-weight-bold"
                  prepend-icon="mdi-clipboard-text-outline"
                >
                  代理登録
                </v-chip>
                <p class="text-h6 font-weight-bold">{{ event.organizerName }}</p>
              </div>
              <p class="text-caption font-weight-bold text-grey-lighten-2 text-truncate">
                {{ event.description }}
              </p>
              <p class="text-body-2 font-weight-bold text-orange">
                <v-icon color="orange">mdi-map-marker</v-icon>{{ event.location }}
              </p>
              <p v-if="isProxyEvent(event)" class="text-caption text-blue mt-1 mb-0">
                <v-icon size="12" color="blue" class="mr-1">mdi-arrow-right-circle</v-icon>
                団体の代表者は管理権限を引き継げます
              </p>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { adminUserId } from '@/config/constants'

const router = useRouter()
const store = useStore()

/**
 * イベントが運営による代理登録かどうかを判定する
 *
 * @param {object} event イベントデータ
 * @returns {boolean} 運営代理登録の場合true
 */
const isProxyEvent = (event) => event.createdBy === adminUserId

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
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.no-events {
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
