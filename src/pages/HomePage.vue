<template>
  <v-container class="pa-4 pb-16 home-container">
    <v-card
      class="mb-4 rounded-xl elevation-2 syllabus-banner"
      to="/syllabus-search"
      :ripple="true"
      @click="logSyllabusBannerClick"
    >
      <v-card-text class="d-flex align-center pa-4">
        <v-avatar color="teal-lighten-4" size="48" class="mr-4">
          <v-icon color="teal-darken-2" size="28">mdi-book-search</v-icon>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold text-teal-darken-2 mb-1">
            みんなのシラバスを検索
          </div>
          <div class="text-caption text-grey-darken-1" style="line-height: 1.4">
            過去のシラバスや楽単度をチェックし、<br />自分の時間割へ一発登録できます。
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
      </v-card-text>
    </v-card>

    <TrainInfo />
    <BusInfo />

    <div class="min-h-[300px] relative mb-4">
      <CampusMap v-if="isMapVisible" />
      <v-skeleton-loader
        v-else
        type="image"
        height="300"
        class="rounded-lg elevation-1"
      ></v-skeleton-loader>
    </div>

    <OtherFunctions />
    </v-container>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import TrainInfo from '@/components/home/TrainInfo.vue'
import BusInfo from '@/components/home/BusInfo.vue'
import OtherFunctions from '@/components/home/OtherFunctions.vue'
// import WakayamaMatch from '@/components/home/WakayamaMatch.vue'

const CampusMap = defineAsyncComponent(() => import('@/components/home/CampusMap.vue'))

useFirebasePageView('view_home', {})

const logSyllabusBannerClick = () => {
  void logFirebaseAnalyticsEvent('home_syllabus_search_banner_click', {})
}

// map遅延表示用
const isMapVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isMapVisible.value = true
  }, 2000)
})
</script>

<style scoped>
.home-container {
  background-color: #fff8e1; /* Light beige background */
  min-height: 100vh;
}
.syllabus-banner {
  border: 1px solid #e0e0e0;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.syllabus-banner:active {
  transform: scale(0.98);
}
</style>
