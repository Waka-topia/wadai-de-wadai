<template>
  <div class="mb-6">
    <div class="d-flex align-center mb-2">
      <v-icon color="green" class="mr-2">mdi-train</v-icon>
      <span class="font-weight-bold">電車情報</span>
    </div>

    <div v-for="(route, index) in routes" :key="index" class="mb-3">
      <!-- Button -->
      <v-btn
        block
        :color="route.color"
        class="text-none justify-start position-relative z-10 transition-border-radius"
        height="48"
        :class="route.expanded ? 'rounded-t-lg rounded-b-0' : 'rounded-lg'"
        flat
        :theme="route.theme"
        @click="toggleRoute(index)"
      >
        <v-icon start class="transition-transform" :class="{ 'rotate-90': route.expanded }">
          mdi-chevron-right
        </v-icon>
        <span class="flex-grow-1 text-left">{{ route.label }}</span>
      </v-btn>

      <!-- Content -->
      <div class="expand-wrapper" :class="{ expanded: route.expanded }">
        <div class="expand-inner bg-white border-s border-e border-b rounded-b-lg">
          <div class="pa-4">
            <!-- Centered Layout -->
            <div class="d-flex flex-column align-center text-center">
              <!-- row 1: Badge & Time -->
              <div class="d-flex align-center mb-1">
                <v-chip
                  v-if="route.nextDepartureType"
                  size="small"
                  :color="getTypeColor(route.nextDepartureType)"
                  class="font-weight-bold mr-2"
                  label
                >
                  {{ getTypeName(route.nextDepartureType) }}
                </v-chip>
                <div class="text-h6 font-weight-bold">{{ route.nextDepartureTime }}発</div>
              </div>

              <!-- row 2: Countdown (Main) -->
              <div class="text-h3 font-weight-bold text-green mb-2">
                <span class="text-h2">{{ route.nextDepartureIn }}</span>
                <span class="text-h6">分</span>
                <span class="text-h4 mx-1">{{ route.nextDepartureSeconds }}</span>
                <span class="text-h6">秒</span>
              </div>

              <!-- row 3: Next Train Info (Separated & Aligned) -->
              <div
                v-if="route.nextTrain"
                class="mt-2 py-1 px-3 bg-grey-lighten-4 rounded-pill d-inline-flex align-center"
              >
                <span class="text-caption text-grey-darken-1 mr-2">次発</span>
                <span class="text-caption font-weight-bold text-grey-darken-1 mr-2">
                  {{ getTypeName(route.nextTrain.type) }}
                </span>
                <span class="text-caption font-weight-bold text-grey-darken-2">
                  {{ route.nextTrain.time }}発
                </span>
              </div>

              <!-- row 4: Features Icons (Optional, kept small) -->
              <div v-if="route.nextDepartureFeatures.includes('women_only')" class="mb-2">
                <v-icon color="pink" size="small" class="mx-1" title="女性専用車両"
                  >mdi-human-female</v-icon
                >
              </div>

              <!-- Link -->
              <v-btn
                variant="text"
                density="compact"
                color="grey"
                class="px-2"
                size="small"
                href="https://www.nankai.co.jp/traffic/jikoku-wa.html#wa"
                target="_blank"
              >
                時刻表を見る <v-icon end size="x-small">mdi-open-in-new</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import timetableService from '@/services/timetableService'

const routes = ref([
  {
    key: 'TrainNamba',
    label: '和歌山大学駅→なんば駅行き',
    color: '#4CAF50',
    theme: 'light',
    expanded: false,
    nextDepartureIn: '--',
    nextDepartureSeconds: '--',
    nextDepartureTime: '--:--',
    afterNextDepartureTime: '--:--',
    nextDepartureType: null,
    nextDepartureFeatures: [],
    nextTrain: null,
  },
  {
    key: 'TrainWakayamashi',
    label: '和歌山大学駅→和歌山市駅行き',
    color: '#1B5E20',
    theme: 'dark',
    expanded: false,
    nextDepartureIn: '--',
    nextDepartureSeconds: '--',
    nextDepartureTime: '--:--',
    afterNextDepartureTime: '--:--',
    nextDepartureType: null,
    nextDepartureFeatures: [],
    nextTrain: null,
  },
])

const toggleRoute = (index) => {
  routes.value[index].expanded = !routes.value[index].expanded
}

const updateTimetable = () => {
  routes.value.forEach((route) => {
    // Fetch upcoming departures
    const departures = timetableService.getNextDepartures(route.key, 2)

    if (departures.length > 0) {
      const next = departures[0]
      route.nextDepartureTime = next.departureTime
      route.nextDepartureIn = next.timeUntil.minutes
      route.nextDepartureSeconds = next.timeUntil.seconds.toString().padStart(2, '0')

      // Update rich info
      route.nextDepartureType = next.type
      route.nextDepartureFeatures = next.features || []

      // Next Train Info (The one after the immediate upcoming one)
      if (departures.length > 1) {
        const nextTrain = departures[1]
        route.nextTrain = {
          time: nextTrain.departureTime,
          type: nextTrain.type,
        }
      } else {
        route.nextTrain = null
      }
    } else {
      route.nextDepartureTime = '終了'
      route.nextDepartureIn = '--'
      route.nextDepartureSeconds = '--'
      route.nextDepartureType = null
      route.nextDepartureFeatures = []
      route.nextTrain = null
    }
  })
}

// Helper functions for UI
const getTypeColor = (type) => {
  switch (type) {
    case 'limited_express_southern':
      return 'orange'
    case 'limited_express':
      return 'orange'
    case 'express':
      return 'red'
    case 'sub_express':
      return 'green'
    default:
      return 'grey'
  }
}

const getTypeName = (type) => {
  switch (type) {
    case 'limited_express_southern':
      return '特急サザン'
    case 'limited_express':
      return '特急'
    case 'express':
      return '急行'
    case 'sub_express':
      return '区急'
    default:
      return '普通'
  }
}

let intervalId

onMounted(() => {
  updateTimetable()
  // Update every second for seconds precision
  intervalId = setInterval(updateTimetable, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.expand-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition:
    grid-template-rows 0.3s ease-out,
    visibility 0s 0.3s,
    opacity 0.3s ease-out;
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
}

.expand-wrapper.expanded {
  grid-template-rows: 1fr;
  visibility: visible;
  opacity: 1;
  transition:
    grid-template-rows 0.3s ease-out,
    visibility 0s 0s,
    opacity 0.3s ease-out;
}

.expand-inner {
  overflow: hidden;
}

.rotate-90 {
  transform: rotate(90deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}

/* Explicitly animate border-radius to prevent jerky change */
.transition-border-radius {
  transition:
    border-radius 0.3s ease-out,
    background-color 0.2s !important;
}

/* Ensure z-index layering works so content slides from under */
.z-10 {
  z-index: 10;
}
</style>
