<template>
  <div class="mb-6">
    <div class="d-flex align-center mb-2">
      <v-icon color="#1976D2" class="mr-2">mdi-bus</v-icon>
      <span class="font-weight-bold">バス情報</span>
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
        theme="dark"
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
              <div class="d-flex align-center flex-wrap justify-center mb-1">
                 <!-- Bus Route Badges -->
                <div v-if="getBusBadges(route).length > 0" class="d-flex align-center flex-wrap mr-2">
                  <v-chip
                    v-for="(badge, i) in getBusBadges(route)"
                    :key="i"
                    size="x-small"
                    :color="badge.color"
                    class="font-weight-bold mr-1 mb-1"
                    label
                  >
                    {{ badge.label }}
                  </v-chip>
                </div>
                <div class="text-h6 font-weight-bold">{{ route.nextDepartureTime }}発</div>
              </div>

              <!-- row 2: Countdown (Main) -->
              <div class="text-h3 font-weight-bold text-blue mb-2">
                <span class="text-h2">{{ route.nextDepartureIn }}</span>
                <span class="text-h6">分</span>
                <span class="text-h4 mx-1">{{ route.nextDepartureSeconds }}</span>
                <span class="text-h6">秒</span>
              </div>

              <!-- row 3: Next Bus Info (Separated & Aligned) -->
              <div v-if="route.nextBus" class="mt-2 py-1 px-3 bg-grey-lighten-4 rounded-pill d-inline-flex align-center">
                <span class="text-caption text-grey-darken-1 mr-2">次発</span>
                <span class="text-caption font-weight-bold text-grey-darken-2">
                  {{ route.nextBus.time }}発
                </span>
              </div>

              <!-- Link to full timetable -->
              <div class="mt-2 text-right">
                <v-btn
                  variant="text"
                  density="compact"
                  color="grey"
                  class="px-0"
                  href="https://transfer.navitime.biz/wakayamabus/pc/diagram/BusCourseSearch?busstopId=00220063"
                  target="_blank"
                >
                  時刻表を見る <v-icon end size="small">mdi-open-in-new</v-icon>
                </v-btn>
              </div>
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
    key: 'BusUniv', // Correct PascalCase key
    label: '和歌山大学→和歌山大学前駅・ふじと台',
    color: '#42A5F5',
    expanded: false,
    nextDepartureIn: '--',
    nextDepartureSeconds: '--',
    nextDepartureTime: '--:--',
    nextDepartureFeatures: [],
    nextDepartureDest: null,
    nextBus: null,
  },
  {
    key: 'BusJr', // Correct PascalCase key
    label: '和歌山大学→JR和歌山駅',
    color: '#0D47A1',
    expanded: false,
    nextDepartureIn: '--',
    nextDepartureSeconds: '--',
    nextDepartureTime: '--:--',
    nextDepartureFeatures: [],
    nextDepartureDest: null,
    nextBus: null,
  },
])

const getBusBadges = (route) => {
  const badges = []
  if (!route.nextDepartureDest) return badges

  // BusUniv: Station Only
  if (route.nextDepartureDest === 'station_only') {
    badges.push({ label: '駅止', color: 'red' })
  }

  // BusUniv: Fujitodai (Standard)
  if (route.nextDepartureDest === 'fujitodai') {
    badges.push({ label: 'ふじと台 (和大前駅経由)', color: 'teal' })
  }

  // BusJr: Via Nobutoki
  if (route.nextDepartureFeatures && route.nextDepartureFeatures.includes('via_nobutoki')) {
    badges.push({ label: '延時・市役所', color: 'blue-grey' })
  }

  // BusJr: Via Jiromaru
  if (route.nextDepartureFeatures && route.nextDepartureFeatures.includes('via_jiromaru')) {
    badges.push({ label: '次郎丸', color: 'brown' })
  }

  return badges
}

const toggleRoute = (index) => {
  routes.value[index].expanded = !routes.value[index].expanded
}

const updateTimetable = () => {
  routes.value.forEach((route) => {
    const departures = timetableService.getNextDepartures(route.key, 2)

    if (departures.length > 0) {
      const next = departures[0]
      route.nextDepartureTime = next.departureTime
      const t = next.timeUntil
      route.nextDepartureIn = t.minutes
      route.nextDepartureSeconds = t.seconds.toString().padStart(2, '0')

      // Rich info
      route.nextDepartureFeatures = next.features || []
      route.nextDepartureDest = next.dest

      // Next Bus Logic
      if (departures.length > 1) {
        const nextBus = departures[1]
        route.nextBus = {
          time: nextBus.departureTime,
        }
      } else {
        route.nextBus = null
      }
    } else {
      route.nextDepartureTime = '終了'
      route.nextDepartureIn = '--'
      route.nextDepartureSeconds = '--'
      route.nextDepartureFeatures = []
      route.nextDepartureDest = null
      route.nextBus = null
    }
  })
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

.transition-border-radius {
  transition:
    border-radius 0.3s ease-out,
    background-color 0.2s !important;
}

.z-10 {
  z-index: 10;
}
</style>
