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
        <template v-if="canRefresh"> <v-icon left>mdi-refresh</v-icon>更新 </template>
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
              <!-- 予測データ(リアルタイム または 時刻表)が存在する場合 -->
              <template v-if="getActiveBus(route)">
                <div class="d-flex align-center justify-center flex-wrap mb-1">
                  <!-- データの出所を示すバッジ -->
                  <v-chip
                    size="small"
                    :color="getActiveBus(route).isRealtime ? 'indigo' : 'blue-grey-darken-1'"
                    :variant="getActiveBus(route).isRealtime ? 'elevated' : 'outlined'"
                    class="font-weight-bold mr-2 mb-1"
                    label
                  >
                    <v-icon start size="small" class="mr-1">
                      {{
                        getActiveBus(route).isRealtime
                          ? 'mdi-satellite-uplink'
                          : 'mdi-calendar-clock'
                      }}
                    </v-icon>
                    {{ getActiveBus(route).isRealtime ? 'リアルタイム' : '時刻表予測' }}
                  </v-chip>

                  <!-- ステータスバッジ（リアルタイムデータ等で始発/終点が明確な場合のみ表示） -->
                  <v-chip
                    v-if="getActiveBus(route).status && getStatusText(getActiveBus(route).status)"
                    size="small"
                    :color="getStatusColor(getActiveBus(route).status)"
                    class="font-weight-bold mr-2 mb-1"
                    label
                  >
                    {{ getStatusText(getActiveBus(route).status) }}
                  </v-chip>

                  <div class="text-h6 font-weight-bold mb-1">
                    {{ formatTime(getActiveBus(route).targetTime) }}
                    {{ getTimeLabel(getActiveBus(route).timeType) }}予定
                  </div>
                </div>

                <!-- 経路情報の表示（時刻表データなど付加情報がある場合のみ表示） -->
                <div
                  v-if="getActiveBus(route).extraInfo"
                  class="text-caption text-grey-darken-2 font-weight-bold mb-2"
                >
                  <v-icon size="x-small" class="mr-1">mdi-map-marker-path</v-icon>
                  {{ getActiveBus(route).extraInfo }}
                </div>

                <!-- リアルタイム カウントダウン -->
                <div
                  class="text-h3 font-weight-bold mb-2"
                  :class="getActiveBus(route).isRealtime ? 'text-blue' : 'text-blue-grey-darken-2'"
                >
                  <span class="text-h2">{{ getCountdown(route).minutes }}</span>
                  <span class="text-h6">分</span>
                  <span class="text-h4 mx-1">{{ getCountdown(route).seconds }}</span>
                  <span class="text-h6">秒{{ getTimeLabel(getActiveBus(route).timeType) }}</span>
                </div>

                <!-- 遅れ情報の表示（リアルタイムかつ遅延がある場合のみ） -->
                <div
                  v-if="getActiveBus(route).isRealtime && getActiveBus(route).delay > 60"
                  class="mt-1 py-1 px-3 bg-red-lighten-5 text-red-darken-2 rounded-pill d-inline-flex align-center"
                >
                  <v-icon size="small" class="mr-1">mdi-alert-circle-outline</v-icon>
                  <span class="text-caption font-weight-bold">
                    約 {{ Math.floor(getActiveBus(route).delay / 60) }} 分遅れ
                  </span>
                </div>
              </template>

              <!-- データが存在しない（本日の運行が完全に終了）場合 -->
              <template v-else>
                <div class="py-4 text-grey-darken-1">
                  <v-icon size="large" class="mb-2">mdi-bus-off</v-icon>
                  <div class="font-weight-bold">本日のバスの運行は終了しました</div>
                  <div class="text-caption mt-1">（※明日の予定は公式時刻表をご確認ください）</div>
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
import { rawTimetables } from '@/data/rawTimetables'

// ----------------------------------------------------
// 実践的な祝日判定ライブラリのインポート
// ※ ターミナルで `npm install japanese-holidays` を実行してください。
// もしプロジェクト独自の祝日判定関数がある場合は、この部分を差し替えてください。
// ----------------------------------------------------
import { isHoliday } from 'japanese-holidays'

const props = defineProps({
  targetBuses: {
    type: Object,
    default: () => ({ routeUniv: [], routeJr: [] }),
  },
  isFetching: Boolean,
  cooldown: Number,
  canRefresh: Boolean,
})

defineEmits(['refresh'])

// UI描画用の静的データ
const uiRoutes = ref([
  {
    key: 'BusUniv',
    gtfsKey: 'routeUniv',
    staticKey: 'BusUniv',
    label: '和歌山大学→和歌山大学前駅・ふじと台',
    color: '#42A5F5',
    expanded: false,
  },
  {
    key: 'BusJr',
    gtfsKey: 'routeJr',
    staticKey: 'BusJr',
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

// ----------------------------------------------------
// 🚌 静的時刻表（rawTimetables）から直近のバスを探す関数
// ----------------------------------------------------
const getStaticBus = (staticKey, currentSec) => {
  const now = new Date(currentSec * 1000)

  // 土日・祝日を正確に判定してダイヤグラムを切り替える
  const day = now.getDay()
  const isWeekend = day === 0 || day === 6
  const isPublicHoliday = !!isHoliday(now) // 祝日・振替休日を判定

  const dayType = isWeekend || isPublicHoliday ? 'weekend' : 'weekday'

  const timetable = rawTimetables[staticKey]?.[dayType]
  if (!timetable) return null

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  let nextBus = null

  // 現在時刻から24時まで、直近のバスを1件探す
  for (let h = currentHour; h <= 24; h++) {
    const minutes = timetable[h] || []

    for (const minStr of minutes) {
      const m = parseInt(minStr, 10)
      // 同じ時間台でも、すでに過ぎた分数はスキップ
      if (h === currentHour && m <= currentMinute) continue

      // 条件に合う直近のバスを発見
      const suffix = minStr.replace(/[0-9]/g, '')
      let extraInfo = ''

      // サフィックスから経由地・行き先を翻訳
      if (staticKey === 'BusUniv') {
        extraInfo = suffix.includes('e') ? '和歌山大学前駅 止まり' : 'ふじと台 行き'
      } else if (staticKey === 'BusJr') {
        if (suffix.includes('n')) extraInfo = '延時・市役所経由'
        if (suffix.includes('j')) extraInfo = '次郎丸経由'
      }

      const targetDate = new Date(now)
      targetDate.setHours(h, m, 0, 0)

      nextBus = {
        isRealtime: false,
        targetTime: Math.floor(targetDate.getTime() / 1000),
        extraInfo: extraInfo,
        // 思い込みを排除し、静的時刻表からの予測データにはステータスバッジを付けない
        status: null,
        timeType: 'departure',
      }
      break
    }
    if (nextBus) break
  }

  return nextBus
}

// ----------------------------------------------------
// 🚀 現在有効なバスを取得する（ハイブリッド判定）
// ----------------------------------------------------
const getActiveBus = (route) => {
  // 1. まずはGTFSリアルタイムデータを探す
  if (props.targetBuses) {
    const rtBuses = props.targetBuses[route.gtfsKey]
    if (rtBuses && Array.isArray(rtBuses) && rtBuses.length > 0) {
      // 予定時刻を60秒過ぎるまでは表示キープ
      const activeRT = rtBuses.find((bus) => bus.targetTime > currentUnixSec.value - 60)
      if (activeRT) {
        return { ...activeRT, isRealtime: true }
      }
    }
  }

  // 2. リアルタイムデータがない場合は、時刻表データへフォールバック
  const staticBus = getStaticBus(route.staticKey, currentUnixSec.value)
  if (staticBus) {
    return staticBus
  }

  // 3. どちらもない（運行終了）
  return null
}

// --- ヘルパー関数 ---
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

const getCountdown = (route) => {
  const data = getActiveBus(route)
  if (!data || !data.targetTime) return { minutes: '--', seconds: '--' }

  const diffSec = data.targetTime - currentUnixSec.value
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
