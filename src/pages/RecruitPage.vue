<template>
  <div class="recruit-container">
    <RecruitSearchFilter />
    <v-container class="px-0 pb-16 pt-0">
      <RecruitSortTabs class="mb-4" />
    </v-container>
  </div>
</template>

<script setup>
import RecruitSearchFilter from '@/components/recruit/RecruitSearchFilter.vue'
import RecruitSortTabs from '@/components/recruit/RecruitSortTabs.vue'
</script>

<style scoped>
.recruit-container {
  background-color: #f9f8f4;
  min-height: 100vh;
}
</style>
