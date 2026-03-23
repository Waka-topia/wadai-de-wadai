<template>
  <div class="recruit-container">
    <RecruitSearchFilter />
    <v-container class="px-0 pb-16 pt-0">
      <RecruitSortTabs class="mb-4" />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import RecruitSearchFilter from '@/components/recruit/RecruitSearchFilter.vue'
import RecruitSortTabs from '@/components/recruit/RecruitSortTabs.vue'

const store = useStore()
const userId = computed(() => store.state.auth?.userId)

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
