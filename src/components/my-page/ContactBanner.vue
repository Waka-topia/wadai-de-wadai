<template>
  <v-card class="mt-4 mx-4 survey-banner" elevation="2" rounded="lg" @click="goSurvey">
    <div class="survey-banner__inner d-flex align-center pa-4">
      <div class="survey-banner__time d-flex flex-column align-center justify-center mr-4">
        <span class="text-caption font-weight-bold text-white">所要時間</span>
        <span class="text-body-1 font-weight-bold text-white">2〜3分</span>
      </div>
      <div class="survey-banner__text">
        <p class="text-caption text-white mb-1">"使ってる人の声"で進化します！</p>
        <p class="text-body-1 font-weight-bold text-white mb-0">
          ユーザーアンケート<br />ご協力のお願い
        </p>
      </div>
      <v-icon class="ml-auto" color="white">mdi-chevron-right</v-icon>
    </div>
  </v-card>
</template>

<script setup>
import { inquiryFormUrl } from '@/config/constants'
import { openExternalLink } from '@/utils/externalLink'

const goSurvey = () => {
  openExternalLink(inquiryFormUrl)
}
</script>

<style scoped>
.survey-banner {
  cursor: pointer;
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
}

.survey-banner__time {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 64px;
}
</style>
