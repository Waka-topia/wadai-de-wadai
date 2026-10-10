<template>
  <div class="d-flex flex-column align-center text-center py-8 px-4">
    <v-icon size="56" color="grey-lighten-1" class="mb-3">{{ icon }}</v-icon>
    <p class="text-body-1 font-weight-bold text-grey-darken-1 mb-1">{{ title }}</p>
    <p v-if="message" class="text-caption text-grey">{{ message }}</p>
    <!-- 次の操作を促すボタンなど -->
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  // mdi アイコン名
  icon: { type: String, default: 'mdi-information-outline' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
})
</script>
