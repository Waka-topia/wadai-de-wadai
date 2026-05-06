<template>
  <v-container class="pa-4 pb-16 home-container">
    <!-- みんなのシラバス検索へのリンクカード -->
    <v-card
      class="mb-4 rounded-xl elevation-2 syllabus-banner"
      to="/syllabus-search"
      :ripple="true"
      @click="logSyllabusBannerClick"
    >
      <v-card-text class="d-flex align-center pa-4">
        <v-avatar color="teal-lighten-4" size="48" class="mr-4">
          <v-icon color="teal-darken-2" size="28">mdi-book-search</v-icon>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold text-teal-darken-2 mb-1">
            みんなのシラバスを検索
          </div>
          <div class="text-caption text-grey-darken-1" style="line-height: 1.4">
            過去のシラバスや楽単度をチェックし、<br />自分の時間割へ一発登録できます。
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
      </v-card-text>
    </v-card>

    <TrainInfo />

    <BusInfo
      :target-buses="targetBuses"
      :is-fetching="isFetching"
      :cooldown="cooldown"
      :can-refresh="canRefresh"
      @refresh="refresh"
      @show-map="openBusMap"
    />

    <CampusMap />
    <OtherFunctions />
    <!-- <WakayamaMatch /> -->

    <!-- 地図ダイアログの追加 -->
    <v-dialog v-model="isMapVisible" fullscreen transition="dialog-bottom-transition">
      <v-card class="map-dialog-card">
        <MapPage
          v-if="isMapVisible"
          :bus-position="activeBusPosition"
          :active-route="activeRoute"
          @close="isMapVisible = false"
        />

        <v-btn icon class="close-map-btn" color="white" elevation="4" @click="isMapVisible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { getBusPosition } from '@/utils/busMatcher'
import { useBusRealtime } from '@/composables/useBusRealtime'

import TrainInfo from '@/components/home/TrainInfo.vue'
import BusInfo from '@/components/home/BusInfo.vue'
import CampusMap from '@/components/home/CampusMap.vue'
import OtherFunctions from '@/components/home/OtherFunctions.vue'
// import WakayamaMatch from '@/components/home/WakayamaMatch.vue'
import MapPage from '@/pages/MapPage.vue'

useFirebasePageView('view_home', {})

const logSyllabusBannerClick = () => {
  void logFirebaseAnalyticsEvent('home_syllabus_search_banner_click', {})
}

const isMapVisible = ref(false)
const activeBusPosition = ref(null)
const activeRoute = ref('') // 'routeUniv' または 'routeJr'

const { realtimeBusData, targetBuses, isFetching, cooldown, canRefresh, refresh } = useBusRealtime()

/**
 * 地図を表示するボタン（BusInfo内のボタン）が押された時の処理
 *
 * @param {String} routeKey - 'BusUniv' (路線Univ) または 'BusJr' (路線Jr)
 */
const openBusMap = (routeKey) => {
  console.log(`🗺️ 地図表示リクエスト: ${routeKey}`)

  activeRoute.value = routeKey === 'BusUniv' ? 'routeUniv' : 'routeJr'

  const targetBus = routeKey === 'BusUniv' ? targetBuses.value.routeUniv : targetBuses.value.routeJr

  if (targetBus && targetBus.tripId) {
    console.log(`🆔 対象TripID: ${targetBus.tripId}`)

    const position = getBusPosition(realtimeBusData.value, targetBus.tripId)

    if (position) {
      console.log('📍 座標特定成功:', position)
      activeBusPosition.value = position
      isMapVisible.value = true
    } else {
      console.warn('⚠️ 座標が見つかりませんでした(VehiclePosition不足)')
      alert('現在このバスの現在地が配信されていません。')
    }
  } else {
    console.warn('⚠️ 対象路線の運行バスが特定できていません')
    alert('現在、運行中の該当バスが見つかりませんでした。')
  }
}
</script>

<style scoped>
.home-container {
  background-color: #fff8e1; /* Light beige background */
  min-height: 100vh;
}
.syllabus-banner {
  border: 1px solid #e0e0e0;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.syllabus-banner:active {
  transform: scale(0.98);
}
.map-dialog-card {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.close-map-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2000;
}
</style>
