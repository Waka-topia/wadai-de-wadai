<template>
  <v-avatar class="mb-2" size="120">
    <v-img alt="ユーザーのアイコン" :src="props.userIconUrl" />
  </v-avatar>
</template>

<script setup>
const props = defineProps({
  userIconUrl: {
    type: String,
    required: true,
  },
})
</script>
