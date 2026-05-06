<template>
  <div class="mb-6">
    <!-- Header with Refresh Button -->
    <div class="d-flex align-center mb-2">
      <v-icon color="#1976D2" class="mr-2">mdi-bus</v-icon>
      <span class="font-weight-bold">和歌山大学発 バス接近情報</span>
      <v-spacer></v-spacer>

      <v-btn
        variant="tonal"
        size="small"
        :disabled="!canRefresh"
        :loading="isFetching"
        color="indigo"
        @click="$emit('refresh')"
      >
        <!-- 更新ボタン(1分に1回のみ) -->
        <template v-if="canRefresh"> <v-icon left>mdi-refresh</v-icon></template>
        <template v-else> {{ cooldown }}s </template>
      </v-btn>
    </div>

    <!-- Routes Accordion -->
    <div v-for="(route, index) in uiRoutes" :key="index" class="mb-3">
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
        <span class="flex-grow-1 text-left text-truncate" style="min-width: 0">{{
          route.label
        }}</span>
      </v-btn>

      <!-- Content -->
      <div class="expand-wrapper" :class="{ expanded: route.expanded }">
        <div class="expand-inner bg-white border-s border-e border-b rounded-b-lg">
          <div class="pa-4">
            <div class="d-flex flex-column align-center text-center">
              <!-- 予測データが存在する場合 -->
              <template v-if="getRouteData(route.gtfsKey)">
                <div class="d-flex align-center justify-center flex-wrap mb-1">
                  <v-chip size="small" color="indigo" class="font-weight-bold mr-2 mb-1" label>
                    リアルタイム
                  </v-chip>

                  <!-- ステータスバッジ（始発 / 終点） -->
                  <v-chip
                    v-if="getStatusText(getRouteData(route.gtfsKey).status)"
                    size="small"
                    :color="getStatusColor(getRouteData(route.gtfsKey).status)"
                    class="font-weight-bold mr-2 mb-1"
                    label
                  >
                    {{ getStatusText(getRouteData(route.gtfsKey).status) }}
                  </v-chip>

                  <div class="text-h6 font-weight-bold mb-1">
                    {{ formatTime(getRouteData(route.gtfsKey).targetTime) }}
                    {{ getTimeLabel(getRouteData(route.gtfsKey).timeType) }}予定
                  </div>
                </div>

                <!-- リアルタイム カウントダウン -->
                <div class="text-h3 font-weight-bold text-blue mb-2">
                  <span class="text-h2">{{ getCountdown(route.gtfsKey).minutes }}</span>
                  <span class="text-h6">分</span>
                  <span class="text-h4 mx-1">{{ getCountdown(route.gtfsKey).seconds }}</span>
                  <span class="text-h6"
                    >秒{{ getTimeLabel(getRouteData(route.gtfsKey).timeType) }}</span
                  >
                </div>

                <!-- 遅れ情報の表示（あれば） -->
                <div
                  v-if="getRouteData(route.gtfsKey).delay > 60"
                  class="mt-1 py-1 px-3 bg-red-lighten-5 text-red-darken-2 rounded-pill d-inline-flex align-center"
                >
                  <v-icon size="small" class="mr-1">mdi-alert-circle-outline</v-icon>
                  <span class="text-caption font-weight-bold">
                    約 {{ Math.floor(getRouteData(route.gtfsKey).delay / 60) }} 分遅れ
                  </span>
                </div>

                <!-- 地図表示ボタン（後ほど実装） -->
                <div class="mt-4 w-100">
                  <v-btn
                    color="blue-darken-1"
                    variant="flat"
                    block
                    rounded="pill"
                    prepend-icon="mdi-map-marker-radius"
                    @click="$emit('show-map', route.key)"
                  >
                    現在地を地図で確認
                  </v-btn>
                </div>
              </template>

              <!-- データが存在しないまたはデータ取得先が次のバスを持っていない場合 -->
              <template v-else>
                <div class="py-4 text-grey-darken-1">
                  <v-icon size="large" class="mb-2">mdi-bus-off</v-icon>
                  <div>現在、運行中のデータを受信していません</div>
                  <div class="text-caption mt-1">（本日の運行終了、または発車時刻の数分前）</div>
                </div>
              </template>

              <!-- Link to full timetable -->
              <div class="mt-4 text-right w-100 border-top pt-2">
                <v-btn
                  variant="text"
                  density="compact"
                  color="grey"
                  class="px-0"
                  href="https://transfer-cloud.navitime.biz/wakayamabus/courses?busstop=00220063"
                  target="_blank"
                >
                  公式時刻表を見る <v-icon end size="small">mdi-open-in-new</v-icon>
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
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const props = defineProps({
  targetBuses: {
    type: Object,
    default: () => ({ routeUniv: [], routeJr: [] }),
  },
  isFetching: Boolean,
  cooldown: Number,
  canRefresh: Boolean,
})

defineEmits(['refresh', 'show-map'])

const uiRoutes = ref([
  {
    key: 'BusUniv',
    gtfsKey: 'routeUniv',
    label: '和歌山大学→和歌山大学前駅・ふじと台',
    color: '#42A5F5',
    expanded: false,
  },
  {
    key: 'BusJr',
    gtfsKey: 'routeJr',
    label: '和歌山大学→JR和歌山駅',
    color: '#0D47A1',
    expanded: false,
  },
])

const currentUnixSec = ref(Math.floor(Date.now() / 1000))
let intervalId = null

const toggleRoute = (index) => {
  const route = uiRoutes.value[index]
  void logFirebaseAnalyticsEvent('home_bus_route_toggle', {
    routeKey: route.key,
    expanded: !route.expanded,
  })
  route.expanded = !route.expanded
}

// 「今有効なバス」を動的に取得
const getRouteData = (gtfsKey) => {
  if (!props.targetBuses) return null
  const buses = props.targetBuses[gtfsKey]

  if (!buses || !Array.isArray(buses) || buses.length === 0) return null

  // 予定時刻を「60秒」過ぎるまでは表示をキープし、60秒を過ぎたら自動的に配列の「次のバス」に切り替える
  const activeBus = buses.find((bus) => bus.targetTime > currentUnixSec.value - 60)

  return activeBus || null
}

const getStatusText = (status) => {
  if (status === 'origin') return '始発'
  if (status === 'destination') return '終点'
  return ''
}

const getStatusColor = (status) => {
  if (status === 'origin') return 'green-darken-1'
  if (status === 'destination') return 'blue-grey-darken-1'
  return 'grey'
}

const getTimeLabel = (timeType) => {
  return timeType === 'arrival' ? '着' : '発'
}

const getCountdown = (gtfsKey) => {
  const data = getRouteData(gtfsKey)
  if (!data || !data.targetTime) return { minutes: '--', seconds: '--' }

  const diffSec = data.targetTime - currentUnixSec.value

  // 予定時刻を過ぎてからの60秒間は、0分0秒で待機させる
  if (diffSec <= 0) return { minutes: '0', seconds: '00' }

  const m = Math.floor(diffSec / 60)
  const s = String(diffSec % 60).padStart(2, '0')
  return { minutes: m, seconds: s }
}

const formatTime = (unixSec) => {
  if (!unixSec) return '--:--'
  const d = new Date(unixSec * 1000)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

onMounted(() => {
  intervalId = setInterval(() => {
    currentUnixSec.value = Math.floor(Date.now() / 1000)
  }, 1000)
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

.border-top {
  border-top: 1px solid #eeeeee;
}
</style>
