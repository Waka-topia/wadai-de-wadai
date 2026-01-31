<template>
  <div class="map-container">
    <div ref="mapContainer" class="map" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, markRaw } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapLibre GL JS Version: ^5.17.0 (Verified in package.json)
// MapTiler API Documentation: https://docs.maptiler.com/maplibre-gl-js/

const mapContainer = ref(null)
const map = ref(null)
const geolocateControl = ref(null)

// Wakayama University Coordinates
const center = [135.15167, 34.26583] // Lng, Lat
const zoom = 15

// MapTiler API Key from environment variable
const apiKey = import.meta.env.VITE_MAPTILER_API_KEY

const emit = defineEmits(['userLocationUpdate', 'locationError'])

/**
 * 位置情報の更新ハンドラ
 *
 * @param {object} event - Geolocateイベント
 */
function handleGeolocate(event) {
  const position = {
    lng: event.coords.longitude,
    lat: event.coords.latitude,
    accuracy: event.coords.accuracy,
  }
  emit('userLocationUpdate', position)
  console.log('User position updated:', position)
}

/**
 * 位置情報エラーハンドラ
 *
 * @param {object} event - エラーイベント
 */
function handleGeolocateError(event) {
  const error = new Error(event.message || '位置情報の取得に失敗しました')
  emit('locationError', error)
  console.error('Location error:', error)
}

onMounted(() => {
  // Validate API Key
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('MapTiler API Key is not set. Please add VITE_MAPTILER_API_KEY to .env file.')
    return
  }

  // Initialize Map with MapTiler Vector Tiles
  const initialState = {
    lng: center[0],
    lat: center[1],
    zoom: zoom,
  }

  map.value = markRaw(
    new maplibregl.Map({
      container: mapContainer.value,
      // MapTiler Basic Style (Minimal, customizable)
      // Alternative styles: 'streets-v2', 'outdoor-v2', 'satellite-v2'
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${apiKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      attributionControl: false, // 後でcompactモードで追加
    }),
  )

  // Attribution control をコンパクトモード(iアイコン)で追加
  map.value.addControl(
    new maplibregl.AttributionControl({
      compact: true, // デフォルトで「i」アイコン表示、クリックで展開
    }),
    'bottom-right',
  )

  // Add navigation controls (zoom, rotation)
  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')

  // GeolocateControlを追加(位置情報の取得・表示)
  geolocateControl.value = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true, // 高精度モード
    },
    trackUserLocation: true, // ユーザーの移動を追跡
    showUserHeading: true, // デバイスの向きを表示
    showAccuracyCircle: true, // 精度円を表示
  })

  map.value.addControl(geolocateControl.value, 'top-right')

  // イベントリスナーを追加
  geolocateControl.value.on('geolocate', handleGeolocate)
  geolocateControl.value.on('error', handleGeolocateError)

  // Force attribution to be collapsed on load
  map.value.on('load', () => {
    const attribControl = document.querySelector('.maplibregl-ctrl-attrib')
    if (attribControl) {
      // Remove the 'maplibregl-compact-show' class if it exists
      attribControl.classList.remove('maplibregl-compact-show')
      // Ensure it has the compact class
      attribControl.classList.add('maplibregl-compact')
    }

    // マップ読み込み後、自動的に位置情報の取得を開始
    geolocateControl.value.trigger()
  })
})

onUnmounted(() => {
  if (geolocateControl.value) {
    geolocateControl.value.off('geolocate', handleGeolocate)
    geolocateControl.value.off('error', handleGeolocateError)
  }

  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%; /* Ensure it fills the parent */
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

/* Force attribution control to stay collapsed (i icon only) */
:deep(.maplibregl-ctrl-attrib.maplibregl-compact) {
  /* Keep it collapsed by default */
  min-height: 20px;
}

:deep(.maplibregl-ctrl-attrib.maplibregl-compact::after) {
  /* Ensure the toggle button (i icon) is visible */
  content: '';
  display: block;
}

:deep(.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner) {
  /* Hide the text by default */
  display: none;
}

:deep(.maplibregl-ctrl-attrib.maplibregl-compact:hover .maplibregl-ctrl-attrib-inner),
:deep(.maplibregl-ctrl-attrib.maplibregl-compact:focus .maplibregl-ctrl-attrib-inner) {
  /* Show text on hover or click */
  display: block;
}

/* GeolocateControlのスタイルカスタマイズ */
:deep(.maplibregl-ctrl-geolocate) {
  background-color: white;
  border-radius: 4px;
}

:deep(.maplibregl-ctrl-geolocate:hover) {
  background-color: #f5f5f5;
}

/* ユーザー位置マーカーの色をカスタマイズ */
:deep(.maplibregl-user-location-dot) {
  background-color: #2196f3;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}

:deep(.maplibregl-user-location-accuracy-circle) {
  background-color: rgba(33, 150, 243, 0.2);
  border: 2px solid rgba(33, 150, 243, 0.5);
}
</style>
