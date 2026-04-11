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
  </div>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const { showSnackbar } = useSnackbar()

const onFilterClick = (filterType) => {
  void logFirebaseAnalyticsEvent('recruit_filter_click', { filterType })
  try {
    showSnackbar(`${filterType}の絞り込み機能は現在準備中です`, 'warning', {
      icon: 'mdi-alert-circle',
    })
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  }
}

const onSearch = () => {
  void logFirebaseAnalyticsEvent('recruit_search_icon_click', {})
  try {
    showSnackbar('検索機能は現在準備中です', 'warning', { icon: 'mdi-alert-circle' })
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  }
}
</script>

<style scoped>
.search-filter-bg {
  background-color: #ff9800;
}
</style>
