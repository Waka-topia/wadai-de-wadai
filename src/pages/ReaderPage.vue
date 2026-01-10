<template>
  <div class="d-flex flex-column justify-center align-center my-10" v-if="isAuthenticated">
    <QrScannerComponent></QrScannerComponent>
  </div>

  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import QrScannerComponent from '@/components/templates/QRScanner.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
</script>
