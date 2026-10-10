<template>
  <p class="text-caption text-uppercase text-grey-darken-1 font-weight-bold mb-3">
    <v-icon size="13" class="mr-1 mb-1">{{ icon }}</v-icon>
    {{ title }}
  </p>
</template>

<script setup>
defineProps({
  // mdi アイコン名
  icon: { type: String, required: true },
  title: { type: String, required: true },
})
</script>
