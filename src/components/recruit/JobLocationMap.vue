<template>
  <div class="mb-6">
    <SectionHeader title="勤務地マップ" icon="mdi-map-marker-radius" icon-color="orange" />

    <MapPreviewCard height="250" clickable @click="openGoogleMaps">
      <div ref="mapContainer" class="map-container" />

      <template #overlay>
        <div class="map-action-chip">
          Google Mapsで開く
          <v-icon size="small" class="ml-1">mdi-open-in-new</v-icon>
        </div>
      </template>
    </MapPreviewCard>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import { useMapLibre } from '@/composables/useMapLibre'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { openExternalLink } from '@/utils/externalLink'
import SectionHeader from '@/components/common/SectionHeader.vue'
import MapPreviewCard from '@/components/map/MapPreviewCard.vue'

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

// 勤務地を中心にした操作不可のプレビュー地図に、勤務地のマーカーを置く
useMapLibre(
  mapContainer,
  { center: [props.lng, props.lat], zoom: 15, interactive: false },
  (map) => {
    new maplibregl.Marker({ color: '#FF9800' }).setLngLat([props.lng, props.lat]).addTo(map)
  },
)

const googleMapsUrl = computed(() => {
  // destination に緯度経度を指定してルート検索モードにする
  return `https://www.google.com/maps/dir/?api=1&destination=${props.lat},${props.lng}`
})

const openGoogleMaps = () => {
  void logFirebaseAnalyticsEvent('job_location_map_open_google', {})
  openExternalLink(googleMapsUrl.value)
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
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
