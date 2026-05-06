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
              <template v-if="getRouteInfo(route).mainBus">
                <!-- 1. トップ表示：〇〇:〇〇発予定 -->
                <div class="text-h5 font-weight-bold mb-3 text-grey-darken-4">
                  {{ formatTime(getRouteInfo(route).mainBus.targetTime) }}
                  {{ getTimeLabel(getRouteInfo(route).mainBus.timeType) }}予定
                </div>

                <!-- 2. Flexコンテナ：時刻表 と リアルタイム予測 を横並び比較 -->
                <v-row dense class="mb-4 w-100">
                  <!-- 【左】時刻表 -->
                  <v-col cols="6">
                    <div
                      class="h-100 bg-grey-lighten-4 rounded pa-2 border border-grey-lighten-2 d-flex flex-column justify-center align-center"
                    >
                      <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">
                        <v-icon size="small" class="mr-1">mdi-calendar-clock</v-icon>時刻表
                      </div>
                      <div v-if="getRouteInfo(route).staticBus">
                        <div class="text-h6 font-weight-bold text-grey-darken-3">
                          {{ formatTime(getRouteInfo(route).staticBus.targetTime) }}
                        </div>
                        <div
                          class="text-caption text-grey-darken-2"
                          style="font-size: 0.7rem !important; line-height: 1.2"
                        >
                          {{ getRouteInfo(route).staticBus.extraInfo || '通常便' }}
                        </div>
                      </div>
                      <div v-else class="text-caption text-grey mt-1">本日の運行終了</div>
                    </div>
                  </v-col>

                  <!-- 【右】リアルタイム予測 -->
                  <v-col cols="6">
                    <div
                      class="h-100 rounded pa-2 border d-flex flex-column justify-center align-center"
                      :class="
                        getRouteInfo(route).rtBus
                          ? 'bg-blue-lighten-5 border-blue-lighten-3'
                          : 'bg-grey-lighten-4 border-grey-lighten-2'
                      "
                    >
                      <div
                        class="text-caption font-weight-bold mb-1"
                        :class="
                          getRouteInfo(route).rtBus ? 'text-blue-darken-2' : 'text-grey-darken-1'
                        "
                      >
                        <v-icon size="small" class="mr-1">mdi-satellite-uplink</v-icon
                        >リアルタイム予測
                      </div>
                      <div v-if="getRouteInfo(route).rtBus">
                        <div class="text-h6 font-weight-bold text-blue-darken-3">
                          {{ formatTime(getRouteInfo(route).rtBus.targetTime) }}
                        </div>
                        <div
                          v-if="getRouteInfo(route).rtBus.delay > 60"
                          class="text-caption font-weight-bold text-red-darken-1"
                          style="font-size: 0.7rem !important; line-height: 1.2"
                        >
                          約{{ Math.floor(getRouteInfo(route).rtBus.delay / 60) }}分遅れ
                        </div>
                        <div
                          v-else
                          class="text-caption font-weight-bold text-green-darken-2"
                          style="font-size: 0.7rem !important; line-height: 1.2"
                        >
                          ほぼ定刻
                        </div>
                      </div>
                      <div v-else class="text-caption text-grey mt-1">データなし</div>
                    </div>
                  </v-col>
                </v-row>

                <!-- 3. カウントダウン表示 -->
                <div
                  class="text-h3 font-weight-bold mb-2"
                  :class="getRouteInfo(route).rtBus ? 'text-blue' : 'text-blue-grey-darken-2'"
                >
                  <span class="text-h2">{{ getCountdown(route).minutes }}</span>
                  <span class="text-h6">分</span>
                  <span class="text-h4 mx-1">{{ getCountdown(route).seconds }}</span>
                  <span class="text-h6">秒</span>
                </div>
              </template>

              <!-- データがどちらも存在しない（本日の運行が完全に終了）場合 -->
              <template v-else>
                <div class="py-4 text-grey-darken-1">
                  <v-icon size="large" class="mb-2">mdi-bus-off</v-icon>
                  <div class="font-weight-bold">本日のバスの運行は終了しました</div>
                  <div class="text-caption mt-1">（※明日の予定は公式時刻表をご確認ください）</div>
                </div>
              </template>

              <!-- 公式時刻表リンク -->
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
// 【修正】Vite(Vue3)環境でエラーにならない安全なインポート構文
// ----------------------------------------------------
import * as JapaneseHolidays from 'japanese-holidays'

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
  // 【修正】メソッド呼び出しに変更
  const isPublicHoliday = !!JapaneseHolidays.isHoliday(now)

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
// 🚀 両方のデータ（リアルタイムと時刻表）を取得し整理する関数
// ----------------------------------------------------
const getRouteInfo = (route) => {
  let rtBus = null
  let staticBus = null

  // 1. リアルタイムデータの取得
  if (props.targetBuses) {
    const rtBuses = props.targetBuses[route.gtfsKey]
    if (rtBuses && Array.isArray(rtBuses) && rtBuses.length > 0) {
      // 予定時刻を60秒過ぎるまでは表示キープ
      rtBus = rtBuses.find((bus) => bus.targetTime > currentUnixSec.value - 60)
    }
  }

  // 2. 時刻表データの取得
  staticBus = getStaticBus(route.staticKey, currentUnixSec.value)

  // 3. メイン表示用のバスを決定（リアルタイム優先、なければ時刻表）
  const mainBus = rtBus || staticBus

  return {
    rtBus,
    staticBus,
    mainBus,
  }
}

// --- ヘルパー関数 ---
const getTimeLabel = (timeType) => {
  return timeType === 'arrival' ? '着' : '発'
}

const getCountdown = (route) => {
  const info = getRouteInfo(route)
  if (!info.mainBus || !info.mainBus.targetTime) return { minutes: '--', seconds: '--' }

  const diffSec = info.mainBus.targetTime - currentUnixSec.value
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
