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

// Wakayama University Coordinates
const center = [135.15167, 34.26583] // Lng, Lat
const zoom = 15

// MapTiler API Key from environment variable
const apiKey = import.meta.env.VITE_MAPTILER_API_KEY

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
    zoom: zoom
  }

  map.value = markRaw(new maplibregl.Map({
    container: mapContainer.value,
    // MapTiler Basic Style (Minimal, customizable)
    // Alternative styles: 'streets-v2', 'outdoor-v2', 'satellite-v2'
    style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${apiKey}`,
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom,
    attributionControl: false // 後でcompactモードで追加
  }))

  // Attribution control をコンパクトモード（iアイコン）で追加
  map.value.addControl(
    new maplibregl.AttributionControl({
      compact: true // デフォルトで「i」アイコン表示、クリックで展開
    }),
    'bottom-right'
  )

  // Add navigation controls (zoom, rotation)
  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')

  // Force attribution to be collapsed on load
  map.value.on('load', () => {
    const attribControl = document.querySelector('.maplibregl-ctrl-attrib')
    if (attribControl) {
      // Remove the 'maplibregl-compact-show' class if it exists
      attribControl.classList.remove('maplibregl-compact-show')
      // Ensure it has the compact class
      attribControl.classList.add('maplibregl-compact')
    }
  })
})

onUnmounted(() => {
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

</style>
