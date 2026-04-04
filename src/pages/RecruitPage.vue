<template>
  <div class="recruit-container">
    <RecruitSearchFilter />
    <v-container class="px-0 pb-16 pt-0">
      <BookMarkFilterTabs />
      <RecruitSortButtons />
      <RecruitJobCard v-for="job in filteredSortedJobs" :key="job.id" :job="job" />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import RecruitSearchFilter from '@/components/recruit/RecruitSearchFilter.vue'
import BookMarkFilterTabs from '@/components/recruit/BookMarkFilterTabs.vue'
import RecruitSortButtons from '@/components/recruit/RecruitSortButtons.vue'
import RecruitJobCard from '@/components/recruit/RecruitJobCard.vue'

const store = useStore()
const route = useRoute()
const userId = computed(() => store.state.auth?.userId)
const sortedJobs = computed(() => store.getters.sortedJobs)

const selectedTags = computed(() => {
  const tags = route.query.tags
  if (!tags) return []
  return Array.isArray(tags) ? tags : [tags]
})

const filteredSortedJobs = computed(() => {
  if (!selectedTags.value.length) return sortedJobs.value

  return sortedJobs.value.filter((job) => {
    if (!job.tags || !job.tags.length) return false
    return selectedTags.value.every((tag) => job.tags.includes(tag))
  })
})

onMounted(async () => {
  await store.dispatch('fetchJobs')
})

// onMountedに置くとuserIdがまだない状態で実行される可能性がある
watch(
  userId,
  (id) => {
    if (id) {
      store.dispatch('applyUserBookmarks')
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
