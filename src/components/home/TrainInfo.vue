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
            <!-- Next Departure Info -->
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey">次の発車まで</div>

                <!-- Train Type Badge -->
                <div v-if="route.nextDepartureType" class="mb-1 d-flex align-center">
                  <v-chip
                    size="x-small"
                    :color="getTypeColor(route.nextDepartureType)"
                    class="font-weight-bold mr-1"
                    label
                  >
                    {{ getTypeName(route.nextDepartureType) }}
                  </v-chip>
                  <v-icon
                    v-if="route.nextDepartureFeatures.includes('reserved_seat')"
                    color="orange"
                    size="small"
                    title="座席指定"
                    >mdi-seat-recline-extra</v-icon
                  >
                  <v-icon
                    v-if="route.nextDepartureFeatures.includes('women_only')"
                    color="pink"
                    size="small"
                    class="ml-1"
                    title="女性専用車両"
                    >mdi-human-female</v-icon
                  >
                </div>

                <div class="text-h4 font-weight-bold text-green d-flex align-baseline">
                  {{ route.nextDepartureIn }}<span class="text-body-1 ml-1">分</span>
                  <span class="text-h5 ml-2">{{ route.nextDepartureSeconds }}</span
                  ><span class="text-body-1 ml-1">秒</span>
                </div>
              </div>

              <div class="text-right">
                <div class="text-h5 font-weight-bold">{{ route.nextDepartureTime }} 発</div>
                <div class="text-caption text-grey">次は {{ route.afterNextDepartureTime }}</div>
              </div>
            </div>

            <!-- Next Southern Display (Only for Namba) -->
            <div
              v-if="route.nextSouthern"
              class="mt-3 px-3 py-2 bg-orange-lighten-5 rounded-lg d-flex align-center justify-space-between"
            >
              <div class="d-flex align-center text-caption text-orange-darken-4 font-weight-bold">
                <v-icon size="small" start color="orange-darken-4">mdi-star-circle</v-icon>
                次発サザン
              </div>
              <div class="text-body-2 font-weight-bold text-orange-darken-4">
                {{ route.nextSouthern.time }}発
                <span class="text-caption ml-1">(約{{ route.nextSouthern.minutes }}分後)</span>
              </div>
            </div>

            <!-- Link to full timetable -->
            <div class="mt-2 text-right">
              <v-btn
                variant="text"
                density="compact"
                color="primary"
                class="px-0"
                href="https://www.nankai.co.jp/traffic/jikoku-wa.html#wa"
                target="_blank"
              >
                南海電鉄時刻表 <v-icon end size="small">mdi-open-in-new</v-icon>
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
    nextSouthern: null, // New object for next Southern info
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
    nextSouthern: null,
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

      // Next Southern Logic for Namba
      if (route.key === 'TrainNamba') {
        route.nextSouthern = timetableService.getNextSouthern(route.key)
      }
    } else {
      route.nextDepartureTime = '終了'
      route.nextDepartureIn = '--'
      route.nextDepartureSeconds = '--'
      route.nextDepartureType = null
      route.nextDepartureFeatures = []
      route.nextSouthern = null
    }

    if (departures.length > 1) {
      route.afterNextDepartureTime = departures[1].departureTime
    } else {
      route.afterNextDepartureTime = '終了'
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
