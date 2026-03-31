<template>
  <div>
    <div class="d-flex align-center bg-white rounded-t">
      <v-btn
        v-if="isAuthenticated"
        icon
        variant="text"
        :color="showBookmarkedOnly ? 'orange' : 'grey-lighten-1'"
        class="ml-2"
        @click="toggleShowBookmarkedOnly"
      >
        <v-icon size="28">
          {{ showBookmarkedOnly ? 'mdi-star' : 'mdi-star-outline' }}
        </v-icon>
      </v-btn>

      <v-divider v-if="isAuthenticated" vertical class="mx-2 my-2" />
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
import { computed, onMounted } from 'vue'
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
const sortedJobs = computed(() => store.getters.sortedJobs)

onMounted(() => {
  store.dispatch('fetchJobs')
})

const filteredJobs = computed(() => {
  const tag = route.query.tag
  if (!tag) return sortedJobs.value
  return sortedJobs.value.filter((job) => job.tags && job.tags.includes(tag))
})

const clearTagFilter = () => {
  router.push({ path: '/jobs' })
}

const sortOptions = [
  { value: 'recommended', label: 'おすすめ順' },
  { value: 'newest', label: '新着順' },
  { value: 'highSalary', label: '時給の高い順' },
]
</script>
