<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <v-icon color="orange" class="mr-2">mdi-map-marker-radius</v-icon>
        <span class="font-weight-bold">勤務地マップ</span>
      </div>
      <a
        :href="googleMapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-decoration-none text-orange d-flex align-center text-body-2"
      >
        Google Mapsで経路を見る
        <v-icon size="small">mdi-open-in-new</v-icon>
      </a>
    </div>

    <v-card
      flat
      class="rounded-lg overflow-hidden border position-relative cursor-pointer"
      height="250"
      color="#E0E0E0"
      @click="openGoogleMaps"
    >
      <div ref="mapContainer" class="map-preview-wrapper" />

      <div class="map-overlay d-flex align-center justify-center"></div>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, markRaw } from 'vue'
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

// Google Mapsの経路検索（目的地）URLを生成
const googleMapsUrl = computed(() => {
  // destination に緯度経度を指定してルート検索モードにする
  return `https://www.google.com/maps/dir/?api=1&destination=${props.lat},${props.lng}`
})

const openGoogleMaps = () => {
  window.open(googleMapsUrl.value, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') return

  map.value = markRaw(
    new maplibregl.Map({
      container: mapContainer.value,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${apiKey}`,
      center: [props.lng, props.lat],
      zoom: 15,
      interactive: false, // ★追加: マップの操作（ズーム・パン等）を完全に無効化
      attributionControl: false,
    }),
  )

  // マーカーを追加（オレンジ色にカスタマイズ）
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
  background-color: rgba(0, 0, 0, 0.02); /* ほんの少しだけ暗くする */
  pointer-events: auto; /* オーバーレイ側でクリックイベントを受け取る */
  transition: background-color 0.2s;
}

.map-overlay:hover {
  background-color: rgba(0, 0, 0, 0.08); /* ホバー時に少し暗くして押せる感を出す */
}
</style>
