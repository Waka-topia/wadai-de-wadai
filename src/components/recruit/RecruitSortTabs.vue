<template>
  <div>
    <div v-if="route.query.tag" class="px-4 py-3 d-flex align-center">
      <v-chip color="orange" variant="outlined" class="mr-2">
        #{{ route.query.tag }}
      </v-chip>
      <v-btn size="small" variant="text" color="orange" @click="clearTagFilter">
        絞り込み解除
      </v-btn>
    </div>

    <v-tabs v-model:model-value="tab" color="orange" bg-color="white" grow>
      <v-tab
        v-for="sortOption in sortOptions"
        :key="sortOption.value"
        :value="sortOption.value"
        class="font-weight-bold"
      >
    <div class="d-flex align-center bg-white rounded-t">
      <v-btn
        v-if="isAuthenticated"
        icon
        variant="text"
        :color="showBookmarkedOnly ? 'orange' : 'grey-lighten-1'"
        class="ml-2"
        @click="toggleShowBookmarkedOnly"
      >
        <v-icon size="28">{{ showBookmarkedOnly ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
      </v-btn>

      <v-divider v-if="isAuthenticated" vertical class="mx-2 my-2"> </v-divider>

      <v-tabs v-model:model-value="tab" color="orange" bg-color="transparent" grow>
        <v-tab
          v-for="sortOption in sortOptions"
          :key="sortOption.value"
          :value="sortOption.value"
          class="font-weight-bold"
        >
          {{ sortOption.label }}
        </v-tab>
      </v-tabs>
    </div>

    <v-tabs-window
      v-for="sortOption in sortOptions"
      v-model:model-value="tab"
      :key="sortOption.value"
    >
      <v-tabs-window-item :value="sortOption.value">
        <RecruitJobCard v-for="job in filteredJobs" :key="job.id" :job="job" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import RecruitJobCard from './RecruitJobCard.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()

const tab = computed({
  get: () => store.state.jobs.sortKey,
  set: (value) => store.commit('setSortKey', value),
})

const isAuthenticated = computed(() => !!store.state.auth?.userId)

const showBookmarkedOnly = computed(() => store.state.jobs.showBookmarkedOnly)
const toggleShowBookmarkedOnly = () => {
  store.commit('setShowBookmarkedOnly', !showBookmarkedOnly.value)
}

const sortedJobs = computed(() => store.getters.sortedJobs)

const filteredJobs = computed(() => {
  const tag = route.query.tag
  if (!tag) return sortedJobs.value
  return sortedJobs.value.filter((job) => job.tags && job.tags.includes(tag))
})

const clearTagFilter = () => {
  router.push({ path: '/jobs' })
}

const sortOptions = [
  { value: 'newest', label: '新着順' },
  { value: 'highSalary', label: '時給の高い順' },
]
</script>
