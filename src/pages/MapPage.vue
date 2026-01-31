<template>
  <div class="map-page-container">
    <BaseMap />

    <!-- Floating Back Button -->
    <v-btn
      icon
      class="back-btn"
      color="white"
      elevation="2"
      @click="$router.push('/')"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import BaseMap from '@/components/map/BaseMap.vue'
</script>

<style scoped>
.map-page-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
}
</style>
