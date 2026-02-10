<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="font-weight-bold">キャンパスマップ</span>
      </div>
      <router-link
        to="/map"
        class="text-decoration-none text-orange d-flex align-center text-body-2"
      >
        マップ全体を見る
        <v-icon size="small">mdi-chevron-right</v-icon>
      </router-link>
    </div>

    <!-- Map Preview Widget -->
    <v-card
      flat
      class="rounded-lg overflow-hidden border position-relative"
      height="200"
      color="#E0E0E0"
    >
      <!-- BaseMap with pointer-events disabled to prevent scroll hijacking -->
      <div class="map-preview-wrapper">
        <BaseMap />
      </div>

      <!-- Overlay to prevent map controls interaction but allow scrolling -->
      <div class="map-overlay"></div>
    </v-card>
  </div>
</template>

<script setup>
import BaseMap from '@/components/map/BaseMap.vue'
</script>

<style scoped>
.map-preview-wrapper {
  width: 100%;
  height: 100%;
  pointer-events: none; /* Disable map interaction */
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.05); /* Slight tint */
  pointer-events: auto;
  /* cursor: pointer; removed to indicate not clickable */
}
</style>
