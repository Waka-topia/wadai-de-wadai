<template>
  <v-container class="pa-4 pb-16 home-container">
    <TrainInfo />
    <BusInfo />
    <CampusMap />
    <OtherFunctions />
  </v-container>
</template>

<script setup>
import TrainInfo from '@/components/home/TrainInfo.vue'
import BusInfo from '@/components/home/BusInfo.vue'
import CampusMap from '@/components/home/CampusMap.vue'
import OtherFunctions from '@/components/home/OtherFunctions.vue'
</script>

<style scoped>
.home-container {
  background-color: #FFF8E1; /* Light beige background */
  min-height: 100vh;
}
</style>
