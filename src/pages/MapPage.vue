<template>
  <div class="map-page-container">
    <BaseMap ref="baseMapRef" @user-location-update="handleLocationUpdate" />

    <!-- Top Bar with Controls -->
    <div class="top-bar">
      <!-- Back Button -->
      <v-btn icon class="control-btn" color="white" elevation="2" @click="goHomeFromMap">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-spacer />

      <!-- Map Controls Group -->
      <div class="controls-group">
        <!-- Current Location Button -->
        <v-btn
          icon
          class="control-btn"
          color="white"
          elevation="2"
          :loading="locating"
          @click="goToCurrentLocation"
        >
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Location Info Card (optional) -->
    <v-card v-if="currentLocation" class="location-info" elevation="2">
      <v-card-text class="pa-2">
        <div class="text-caption">現在地</div>
        <div class="text-body-2">
          {{ currentLocation.lat.toFixed(5) }}, {{ currentLocation.lng.toFixed(5) }}
        </div>
        <div class="text-caption text-grey">精度: {{ currentLocation.accuracy.toFixed(0) }}m</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import BaseMap from '@/components/map/BaseMap.vue'

const router = useRouter()

useFirebasePageView('view_map', {})

const baseMapRef = ref(null)
const currentLocation = ref(null)
const locating = ref(false)

/**
 * 位置情報更新ハンドラ
 *
 * @param {{ lng: number; lat: number; accuracy: number }} position - 位置情報
 */
function handleLocationUpdate(position) {
  currentLocation.value = position
  // console.log('Location updated:', position)
}

const goHomeFromMap = () => {
  void logFirebaseAnalyticsEvent('map_back_home_click', {})
  router.push('/')
}

/** 現在地に移動 */
function goToCurrentLocation() {
  void logFirebaseAnalyticsEvent('map_current_location_click', {})
  locating.value = true
  // GeolocateControlのtriggerを呼び出す
  // BaseMapのGeolocateControlを直接操作
  const mapComponent = baseMapRef.value
  if (mapComponent && mapComponent.$el) {
    const geolocateBtn = mapComponent.$el.querySelector('.maplibregl-ctrl-geolocate')
    if (geolocateBtn) {
      geolocateBtn.click()
    }
  }
  setTimeout(() => {
    locating.value = false
  }, 1000)
}
</script>

<style scoped>
.map-page-container {
  width: 100vw;
  height: 100vh;
  position: fixed; /* fixed positioning for true fullscreen */
  top: 0;
  left: 0;
  overflow: hidden;
}

/* Top Bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 12px;
  z-index: 1000; /* High z-index to stay above map */
  pointer-events: none; /* Allow map interactions through the bar */
}

.top-bar > * {
  pointer-events: auto; /* Re-enable pointer events for buttons */
}

/* Control Buttons */
.control-btn {
  margin: 0 4px;
}

.controls-group {
  display: flex;
  gap: 8px;
}

/* Location Info Card */
.location-info {
  position: absolute;
  bottom: 20px;
  left: 12px;
  max-width: 250px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .top-bar {
    padding: 8px;
  }

  .location-info {
    bottom: 16px;
    left: 8px;
    max-width: 200px;
  }
}
</style>
