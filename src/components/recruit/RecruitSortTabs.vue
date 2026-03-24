<template>
  <div>
    <v-tabs v-model:model-value="tab" color="orange" bg-color="white" grow>
      <v-tab
        v-for="sortOption in sortOptions"
        :key="sortOption.value"
        :value="sortOption.value"
        class="font-weight-bold"
      >
        {{ sortOption.label }}
      </v-tab>
    </v-tabs>
    <v-tabs-window
      v-for="sortOption in sortOptions"
      :key="sortOption.value"
      v-model:model-value="tab"
    >
      <v-tabs-window-item :value="sortOption.value">
        <RecruitJobCard v-for="job in sortedJobs" :key="job.id" :job="job" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import RecruitJobCard from './RecruitJobCard.vue'

const store = useStore()
const tab = computed({
  get: () => store.state.jobs.sortKey,
  set: (value) => store.commit('setSortKey', value),
})
const sortedJobs = computed(() => store.getters.sortedJobs)

onMounted(() => {
  store.dispatch('fetchJobs')
})

const sortOptions = [
  { value: 'recommended', label: 'おすすめ順' },
  { value: 'newest', label: '新着順' },
  { value: 'highSalary', label: '時給の高い順' },
]
</script>
