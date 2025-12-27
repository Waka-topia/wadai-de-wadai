<template>
  <v-avatar class="mb-2" size="120">
    <v-img alt="ユーザーのアイコン" :src="getImageUrl(photoURL)" />
  </v-avatar>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const photoURL = computed(() => store.getters['auth/photoURL'])

const getImageUrl = (relativePath) => {
  if (relativePath) {
    return new URL(`../../assets/${relativePath}`, import.meta.url).href
  }
  return new URL('../../assets/userIcon/defaultIcon.png', import.meta.url).href
}
</script>
