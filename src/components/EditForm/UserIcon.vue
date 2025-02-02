<template>
  <v-avatar size="120" class="mb-2">
    <v-img :src="getImageUrl(photoURL)" alt="ユーザーのアイコン" />
  </v-avatar>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const photoURL = computed(() => store.getters["auth/photoURL"])

const getImageUrl = (relativePath) => {
  if (relativePath) {
    return new URL(`../../assets/${relativePath}`, import.meta.url).href;
  }
  return 'https://via.placeholder.com/120';
}
</script>
