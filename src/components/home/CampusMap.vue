<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="font-weight-bold">キャンパスマップ</span>
      </div>
      <router-link to="/map" class="text-decoration-none text-orange d-flex align-center text-body-2">
        マップ全体を見る
        <v-icon size="small">mdi-chevron-right</v-icon>
      </router-link>
    </div>

    <v-card flat class="rounded-lg overflow-hidden border" min-height="200" color="#E0E0E0">
      <div class="d-flex fill-height align-center justify-center text-grey">
        <v-icon size="48" class="mb-2">mdi-map-marker-off</v-icon>
        <span>Map Image Placeholder</span>
      </div>
    </v-card>
  </div>
</template>

<script setup>
// View only component
</script>
