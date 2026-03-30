<template>
  <v-avatar class="mb-2" size="120">
    <v-img alt="ユーザーのアイコン" :src="props.photoUrlResolved" />
  </v-avatar>
</template>

<script setup>
const props = defineProps({
  photoUrlResolved: {
    type: String,
    required: true,
  },
})
</script>
