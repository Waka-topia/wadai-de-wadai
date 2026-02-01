<template>
  <div class="map-container">
    <div ref="mapContainer" class="map" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, markRaw } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { campusBuildings } from '@/data/campusBuildings'

// MapLibre GL JS Version: ^5.17.0 (Verified in package.json)
// MapTiler API Documentation: https://docs.maptiler.com/maplibre-gl-js/

const mapContainer = ref(null)
const map = ref(null)
const mapLoaded = ref(false)
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
  // console.log('User position updated:', position)
}

/**
 * 位置情報エラーハンドラ
 *
 * @param {object} event - エラーイベント
 */
function handleGeolocateError(event) {
  const error = new Error(event.message || '位置情報の取得に失敗しました')
  emit('locationError', error)
  // console.error('Location error:', error)
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

  // Add navigation controls (zoom, rotation) - 右下に配置
  map.value.addControl(new maplibregl.NavigationControl(), 'bottom-right')

  // GeolocateControlを追加(位置情報の取得・表示) - 右下に配置
  geolocateControl.value = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true, // 高精度モード
    },
    trackUserLocation: true, // ユーザーの移動を追跡
    showUserHeading: true, // デバイスの向きを表示
    showAccuracyCircle: true, // 精度円を表示
  })

  map.value.addControl(geolocateControl.value, 'bottom-right')

  // イベントリスナーを追加
  geolocateControl.value.on('geolocate', handleGeolocate)
  geolocateControl.value.on('error', handleGeolocateError)

  // Force attribution to be collapsed on load
  map.value.on('load', () => {
    // 建物ラベルのソースを追加
    map.value.addSource('building-labels', {
      type: 'geojson',
      data: campusBuildings,
    })

    // 建物ラベルのレイヤーを追加
    map.value.addLayer({
      id: 'building-labels',
      type: 'symbol',
      source: 'building-labels',
      minzoom: 14, // ズームレベル14以上で表示
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 13,
        'text-variable-anchor': ['center', 'top', 'bottom'],
        'text-radial-offset': 0.5,
        'text-justify': 'auto',
        // 'text-font': ['Noto Sans Regular'], // 必要であればフォント指定
      },
      paint: {
        'text-color': '#555555',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      },
    })

    mapLoaded.value = true // マップロード完了

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

  // [DEBUG] クリックした場所の座標を表示
  map.value.on('click', (e) => {
    const { lng, lat } = e.lngLat
    // console.log(`Clicked: [${lng}, ${lat}]`)

    // 座標を表示するポップアップ
    new maplibregl.Popup({ closeButton: false })
      .setLngLat(e.lngLat)
      .setHTML(
        `
        <div class="coordinate-popup" style="text-align: center; cursor: pointer;">
          <div style="font-size: 10px; color: #666; margin-bottom: 2px;">座標 (Click to Copy)</div>
          <div style="font-family: monospace; font-weight: bold; color: #1976D2;">
            [${lng.toFixed(6)}, ${lat.toFixed(6)}]
          </div>
        </div>
        `,
      )
      .addTo(map.value)
      .getElement()
      .addEventListener('click', () => {
        navigator.clipboard
          .writeText(`Coordinates: { lat: ${lat}, lng: ${lng} }`)
          .then(() => {
            console.log('Coordinates copied to clipboard')
            // 簡単なフィードバック（オプション）
            // alert('Copied!')
          })
          .catch((err) => console.error('Failed to copy:', err))
      })
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
