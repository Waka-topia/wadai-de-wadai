<template>
  <div class="mb-6">
    <SectionHeader title="キャンパスマップ">
      <template #action>
        <router-link
          to="/map"
          class="text-decoration-none text-orange d-flex align-center text-body-2"
        >
          マップ全体を見る
          <v-icon size="small">mdi-chevron-right</v-icon>
        </router-link>
      </template>
    </SectionHeader>

    <MapPreviewCard>
      <BaseMap />
    </MapPreviewCard>
  </div>
</template>

<script setup>
import BaseMap from '@/components/map/BaseMap.vue'
import MapPreviewCard from '@/components/map/MapPreviewCard.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
</script>
