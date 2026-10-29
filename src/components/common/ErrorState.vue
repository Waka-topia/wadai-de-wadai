<template>
  <v-alert type="error" variant="tonal" icon="mdi-alert-circle" class="mb-4 rounded-lg">
    {{ message }}
  </v-alert>
</template>

<script setup>
defineProps({
  message: { type: String, required: true },
})
</script>
