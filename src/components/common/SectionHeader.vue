<template>
  <div class="d-flex align-center justify-space-between mb-2">
    <div class="d-flex align-center">
      <v-icon v-if="icon" :color="iconColor" class="mr-2">{{ icon }}</v-icon>
      <span class="font-weight-bold">{{ title }}</span>
    </div>
    <!-- 右端のリンクなど -->
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  // 見出しの左に表示する mdi アイコン名（省略時はアイコンなし）
  icon: { type: String, default: '' },
  iconColor: { type: String, default: undefined },
})
</script>
