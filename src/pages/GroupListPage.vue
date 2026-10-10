<template>
  <div class="group-container">
    <div class="px-4 pt-4">
      <GroupFilter :groups="groups" @update:filters="searchFilters = $event" />
    </div>

    <v-container class="px-0 pb-16 pt-4">
      <GroupCard v-for="group in filteredGroups" :key="group.id" :group="group" />
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import GroupFilter from '@/components/group/GroupFilter.vue'
import GroupCard from '@/components/group/GroupCard.vue'
import { getAllGroupsService } from '@/services/groupService'

const groups = ref([])

const searchFilters = ref({
  keyword: '',
  mainCategory: null,
  subCategory: null,
  detailCategory: null,
})

const categoryMap = {
  circle: 'サークル',
  club: '部活',
  committee: '委員会',
  project: 'プロジェクト',
  sports: 'スポーツ',
  culture: '文化',
}

const toJapanese = (value) => categoryMap[value] || value

const normalizeValue = (value) => (value || '').trim()
const normalizeText = (value) => (value || '').toLowerCase().trim()

const filteredGroups = computed(() => {
  return groups.value.filter((group) => {
    const keyword = normalizeText(searchFilters.value.keyword)

    const mainCategoryJa = toJapanese(group.mainCategory)
    const subCategoryJa = toJapanese(group.subCategory)
    const detailCategoryJa = toJapanese(group.detailCategory)

    const keywordMatch =
      !keyword ||
      normalizeText(group.name).includes(keyword) ||
      normalizeText(group.description).includes(keyword) ||
      normalizeText(mainCategoryJa).includes(keyword) ||
      normalizeText(subCategoryJa).includes(keyword) ||
      normalizeText(detailCategoryJa).includes(keyword) ||
      (group.tags || []).some((tag) => normalizeText(tag).includes(keyword))

    const mainCategoryMatch =
      !searchFilters.value.mainCategory ||
      normalizeValue(mainCategoryJa) === normalizeValue(searchFilters.value.mainCategory)

    const subCategoryMatch =
      !searchFilters.value.subCategory ||
      normalizeValue(subCategoryJa) === normalizeValue(searchFilters.value.subCategory)

    const detailCategoryMatch =
      !searchFilters.value.detailCategory ||
      normalizeValue(detailCategoryJa) === normalizeValue(searchFilters.value.detailCategory)

    return keywordMatch && mainCategoryMatch && subCategoryMatch && detailCategoryMatch
  })
})

onMounted(async () => {
  groups.value = await getAllGroupsService()
  console.log(groups.value)
})
</script>

<style scoped>
.group-container {
  background-color: #f9f8f4;
  min-height: 100vh;
}
</style>
