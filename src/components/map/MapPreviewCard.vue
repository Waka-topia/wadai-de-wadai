<template>
  <v-card
    flat
    class="rounded-lg overflow-hidden border position-relative"
    :class="{ 'cursor-pointer': clickable }"
    :height="height"
    :link="clickable"
    color="#E0E0E0"
    @click="clickable && emit('click')"
  >
    <!-- 地図そのものは操作できないようにし、ページのスクロールを妨げない -->
    <div class="map-preview-wrapper">
      <slot />
    </div>

    <div class="map-overlay" :class="{ 'map-overlay--clickable': clickable }" />

    <!-- 地図の上に重ねる案内など -->
    <slot name="overlay" />
  </v-card>
</template>

<script setup>
defineProps({
  height: { type: [String, Number], default: 200 },
  // カード全体をクリックできるか（ホバー時に暗くなる）
  clickable: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])
</script>

<style scoped>
.map-preview-wrapper {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.04);
  pointer-events: auto;
  transition: background-color 0.2s;
}

.map-overlay--clickable:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
