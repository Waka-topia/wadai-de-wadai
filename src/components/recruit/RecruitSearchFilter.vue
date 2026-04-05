<template>
  <div class="search-filter-bg pa-4">
    <v-card class="mx-1" rounded="xl">
      <div class="d-flex align-center">
        <v-list class="flex-grow-1 pa-0" bg-color="transparent">
          <v-list-item class="px-2" @click="onFilterClick('area')">
            <template #prepend>
              <v-icon color="orange" size="20">mdi-map-marker</v-icon>
            </template>
            <v-list-item-title class="text-body-2 text-grey">
              駅・エリアを選択してください
            </v-list-item-title>
          </v-list-item>

          <v-divider class="mx-2" />

          <v-list-item class="px-2" @click="onFilterClick('jobType')">
            <template #prepend>
              <v-icon color="orange" size="20">mdi-domain</v-icon>
            </template>
            <v-list-item-title class="text-body-2 text-grey">
              職種を選択してください
            </v-list-item-title>
          </v-list-item>

          <v-divider class="mx-2" />

          <v-list-item class="px-2" @click="onFilterClick('features')">
            <template #prepend>
              <v-icon color="orange" size="20">mdi-heart</v-icon>
            </template>
            <v-list-item-title class="text-body-2 text-grey">
              給与/雇用形態/その他特徴を選択してください
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-btn icon variant="text" color="orange" size="large" @click="onSearch">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const onFilterClick = (filterType) => {
  void logFirebaseAnalyticsEvent('recruit_filter_click', { filterType })
  try {
    snackbar.value = {
      show: true,
      message: `${filterType}の絞り込み機能は現在準備中です`,
      color: 'warning',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: `エラー: ${error.message}`,
      color: 'error',
    }
  }
}

const onSearch = () => {
  void logFirebaseAnalyticsEvent('recruit_search_icon_click', {})
  try {
    snackbar.value = {
      show: true,
      message: '検索機能は現在準備中です',
      color: 'warning',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: `エラー: ${error.message}`,
      color: 'error',
    }
  }
}
</script>

<style scoped>
.search-filter-bg {
  background-color: #ff9800;
}
</style>
