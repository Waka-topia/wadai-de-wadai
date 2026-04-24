<template>
  <v-btn
    class="text-white font-weight-bold fab-btn py-7 px-5 d-flex align-center justify-center"
    color="orange"
    variant="elevated"
    elevation="4"
    rounded="pill"
    @click="emit('click')"
  >
    団体向けフォーム
  </v-btn>
</template>

<script setup>
const emit = defineEmits(['click'])
</script>

<style scoped>
.fab-btn {
  position: fixed;
  bottom: 100px;
  right: 16px;
  z-index: 1000;
}
</style>
