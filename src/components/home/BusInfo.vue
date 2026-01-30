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
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey">次の発車まで</div>

                <!-- Bus Route Badges -->
                <div v-if="(route.nextDepartureFeatures && route.nextDepartureFeatures.length > 0) || route.nextDepartureDest === 'station_only' || route.nextDepartureDest === 'fujitodai'" class="mb-1 d-flex align-center flex-wrap">
                    <!-- BusUniv: Station Only -->
                    <v-chip v-if="route.nextDepartureDest === 'station_only'" size="x-small" color="red" class="font-weight-bold mr-1 mb-1" label>
                      駅止
                    </v-chip>

                    <!-- BusUniv: Fujitodai (Standard) -->
                    <v-chip v-if="route.nextDepartureDest === 'fujitodai'" size="x-small" color="teal" class="font-weight-bold mr-1 mb-1" label>
                      ふじと台 (和大前駅経由)
                    </v-chip>

                    <!-- BusJr: Via Nobutoki -->
                    <v-chip v-if="route.nextDepartureFeatures.includes('via_nobutoki')" size="x-small" color="blue-grey" class="font-weight-bold mr-1 mb-1" label>
                      延時・市役所
                    </v-chip>

                    <!-- BusJr: Via Jiromaru -->
                    <v-chip v-if="route.nextDepartureFeatures.includes('via_jiromaru')" size="x-small" color="brown" class="font-weight-bold mr-1 mb-1" label>
                      次郎丸
                    </v-chip>
                </div>

                <div class="text-h4 font-weight-bold text-blue d-flex align-baseline">
                  {{ route.nextDepartureIn }}<span class="text-body-1 ml-1">分</span>
                  <span class="text-h5 ml-2">{{ route.nextDepartureSeconds }}</span><span class="text-body-1 ml-1">秒</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-h4 font-weight-bold">{{ route.nextDepartureTime }} 発</div>
                <div class="text-caption text-grey">次は {{ route.afterNextDepartureTime }}</div>
              </div>
            </div>

            <!-- Link to full timetable -->
            <div class="mt-2 text-right">
                 <v-btn variant="text" density="compact" color="primary" class="px-0" href="https://transfer.navitime.biz/wakayamabus/pc/diagram/BusCourseSearch?busstopId=00220063" target="_blank">
                    和歌山バス時刻表 <v-icon end size="small">mdi-open-in-new</v-icon>
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
    key: 'BusUniv', // Correct PascalCase key
    label: '和歌山大学→和歌山大学前駅・ふじと台',
    color: '#42A5F5',
    expanded: false,
    nextDepartureIn: '--',
    nextDepartureSeconds: '--',
    nextDepartureTime: '--:--',
    afterNextDepartureTime: '--:--',
    nextDepartureFeatures: [],
    nextDepartureDest: null,
  },
  {
    key: 'BusJr', // Correct PascalCase key
    label: '和歌山大学→JR和歌山駅',
    color: '#0D47A1',
    expanded: false,
    nextDepartureIn: '--',
    nextDepartureSeconds: '--',
    nextDepartureTime: '--:--',
    afterNextDepartureTime: '--:--',
    nextDepartureFeatures: [],
    nextDepartureDest: null,
  },
])

const toggleRoute = (index) => {
  routes.value[index].expanded = !routes.value[index].expanded
}

const updateTimetable = () => {
  routes.value.forEach(route => {
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
    } else {
      route.nextDepartureTime = '終了'
      route.nextDepartureIn = '--'
      route.nextDepartureSeconds = '--'
      route.nextDepartureFeatures = []
      route.nextDepartureDest = null
    }

    if (departures.length > 1) {
      route.afterNextDepartureTime = departures[1].departureTime
    } else {
      route.afterNextDepartureTime = '終了'
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
  transition: grid-template-rows 0.3s ease-out, visibility 0s 0.3s, opacity 0.3s ease-out;
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
}

.expand-wrapper.expanded {
  grid-template-rows: 1fr;
  visibility: visible;
  opacity: 1;
  transition: grid-template-rows 0.3s ease-out, visibility 0s 0s, opacity 0.3s ease-out;
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
  transition: border-radius 0.3s ease-out, background-color 0.2s !important;
}

.z-10 {
  z-index: 10;
}
</style>
