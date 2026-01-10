<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center align-center my-10">
    <HelloHome :display-name="displayName" />
  </div>

  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import HelloHome from '@/components/templates/HelloHome.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const displayName = computed(() => store.getters['auth/user'].displayName)
</script>
