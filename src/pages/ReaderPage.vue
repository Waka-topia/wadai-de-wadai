<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center align-center my-10">
    <QRScanner></QRScanner>
  </div>

  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import QRScanner from "@/components/templates/QRScanner.vue";
import RecommendLogin from '@/components/templates/RecommendLogin.vue';

const store = useStore();
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
</script>
