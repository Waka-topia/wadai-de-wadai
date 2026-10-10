<template>
  <div v-if="!showBookmarkedOnly" class="d-flex align-center my-2 mx-5" style="gap: 10px">
    <v-btn
      v-for="option in sortOptions"
      :key="option.value"
      :variant="currentSortKey === option.value ? 'flat' : 'elevated'"
      elevation="1"
      rounded="pill"
      class="font-weight-bold"
      :class="{ 'active-btn': currentSortKey === option.value }"
      @click="setSortKey(option.value)"
    >
      {{ option.label }}
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const store = useStore()

const showBookmarkedOnly = computed(() => store.state.jobs.showBookmarkedOnly)

const currentSortKey = computed({
  get: () => store.state.jobs.sortKey,
  set: (value) => {
    if (value !== undefined) {
      store.commit('setSortKey', value)
    }
  },
})

const setSortKey = (value) => {
  void logFirebaseAnalyticsEvent('recruit_sort_change', { sortKey: value })
  currentSortKey.value = value
}

const sortOptions = [
  { value: 'newest', label: '新着順' },
  { value: 'highSalary', label: '時給の高い順' },
]
</script>

<style scoped>
.active-btn {
  background-color: orange !important;
  color: white !important;
}
</style>
