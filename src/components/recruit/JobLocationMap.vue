<template>
  <div class="mb-6">
    <SectionHeader title="勤務地マップ" icon="mdi-map-marker-radius" icon-color="orange" />

    <v-card
      flat
      class="rounded-lg overflow-hidden border position-relative cursor-pointer"
      height="250"
      color="#E0E0E0"
      @click="openGoogleMaps"
    >
      <div ref="mapContainer" class="map-preview-wrapper" />

      <div class="map-overlay d-flex align-center justify-center"></div>

      <div class="map-action-chip">
        Google Mapsで開く
        <v-icon size="small" class="ml-1">mdi-open-in-new</v-icon>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, markRaw } from 'vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { openExternalLink } from '@/utils/externalLink'
import SectionHeader from '@/components/common/SectionHeader.vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  companyName: {
    type: String,
    default: '勤務地',
  },
})

const mapContainer = ref(null)
const map = ref(null)
const apiKey = import.meta.env.VITE_MAPTILER_API_KEY

const googleMapsUrl = computed(() => {
  // destination に緯度経度を指定してルート検索モードにする
  return `https://www.google.com/maps/dir/?api=1&destination=${props.lat},${props.lng}`
})

const openGoogleMaps = () => {
  void logFirebaseAnalyticsEvent('job_location_map_open_google', {})
  openExternalLink(googleMapsUrl.value)
}

onMounted(() => {
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') return

  map.value = markRaw(
    new maplibregl.Map({
      container: mapContainer.value,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${apiKey}`,
      center: [props.lng, props.lat],
      zoom: 15,
      interactive: false,
      attributionControl: false,
    }),
  )

  new maplibregl.Marker({ color: '#FF9800' }).setLngLat([props.lng, props.lat]).addTo(map.value)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.map-preview-wrapper {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.02);
  pointer-events: auto;
  transition: background-color 0.2s;
}

.map-overlay:hover {
  background-color: rgba(0, 0, 0, 0.08);
}

.map-action-chip {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: #ffffff;
  color: orange;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
  pointer-events: none;
}
</style>
