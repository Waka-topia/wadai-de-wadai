<template>
  <div class="recruit-container">
    <RecruitSearchFilter />
    <v-container class="px-0 pb-16 pt-0">
      <BookMarkFilterTabs />
      <RecruitSortButtons />
      <RecruitJobCard v-for="job in sortedJobs" :key="job.id" :job="job" />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import RecruitSearchFilter from '@/components/recruit/RecruitSearchFilter.vue'
import BookMarkFilterTabs from '@/components/recruit/BookMarkFilterTabs.vue'
import RecruitSortButtons from '@/components/recruit/RecruitSortButtons.vue'
import RecruitJobCard from '@/components/recruit/RecruitJobCard.vue'

const store = useStore()
const userId = computed(() => store.state.auth?.userId)
const sortedJobs = computed(() => store.getters['jobs/sortedJobs'])

onMounted(async () => {
  await store.dispatch('jobs/fetchJobs')
})

// onMountedに置くとuserIdがまだない状態で実行される可能性がある
watch(
  userId,
  (id) => {
    if (id) {
      store.dispatch('jobs/applyUserBookmarks')
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.recruit-container {
  background-color: #f9f8f4;
  min-height: 100vh;
}
</style>
