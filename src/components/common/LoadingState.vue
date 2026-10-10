<template>
  <div class="d-flex flex-column align-center text-center py-8">
    <v-progress-circular indeterminate color="orange" :size="size" />
    <p v-if="message" class="mt-4 text-body-2 text-grey">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  // スピナーの下に表示する文言（省略時はスピナーのみ）
  message: { type: String, default: '' },
  size: { type: [String, Number], default: 40 },
})
</script>
