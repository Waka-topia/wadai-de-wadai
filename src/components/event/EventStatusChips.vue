<template>
  <v-chip v-if="isOfficial" size="small" color="blue" variant="flat" label class="font-weight-bold">
    <v-icon start size="14">mdi-check-decagram</v-icon>
    公式
  </v-chip>
  <v-chip
    v-if="isProxy"
    size="small"
    color="orange"
    variant="flat"
    label
    class="font-weight-bold text-white"
  >
    <v-icon start size="14">mdi-clipboard-text-outline</v-icon>
    代理登録
  </v-chip>
</template>

<script setup>
defineProps({
  // 団体の代表者が登録・引き継いだ公式イベントか
  isOfficial: { type: Boolean, default: false },
  // 運営が代理登録したイベントか
  isProxy: { type: Boolean, default: false },
})
</script>
