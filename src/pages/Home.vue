<template>
  <v-container class="pa-4 pb-16 home-container">
    <TrainInfo />
    <BusInfo />
    <CampusMap />
    <OtherFunctions />
    <WakayamaMatch />
  </v-container>
</template>

<script setup>
import TrainInfo from '@/components/home/TrainInfo.vue'
import BusInfo from '@/components/home/BusInfo.vue'
import CampusMap from '@/components/home/CampusMap.vue'
import OtherFunctions from '@/components/home/OtherFunctions.vue'
import WakayamaMatch from '@/components/home/WakayamaMatch.vue'
</script>

<style scoped>
.home-container {
  background-color: #fff8e1; /* Light beige background */
  min-height: 100vh;
}
</style>
