<template>
  <v-card class="pa-4 rounded-xl filter-card" elevation="0">
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="keyword"
          label="団体を検索"
          placeholder="団体名・説明・カテゴリーなど"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          bg-color="white"
          color="#ff9800"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="mainCategory"
          :items="mainCategoryOptions"
          label="メインカテゴリー"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          bg-color="white"
          color="#ff9800"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="subCategory"
          :items="subCategoryOptions"
          label="サブカテゴリー"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          bg-color="white"
          color="#ff9800"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="detailCategory"
          :items="detailCategoryOptions"
          label="詳細カテゴリー"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          bg-color="white"
          color="#ff9800"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:filters'])

const keyword = ref('')
const mainCategory = ref(null)
const subCategory = ref(null)
const detailCategory = ref(null)

const categoryMap = {
  circle: 'サークル',
  club: '部活',
  committee: '委員会',
  project: 'プロジェクト',
  sports: 'スポーツ',
  culture: '文化',
}

const toJapanese = (value) => categoryMap[value] || value

const mainCategoryOptions = computed(() => {
  return [...new Set(props.groups.map((group) => toJapanese(group.mainCategory)).filter(Boolean))]
})

const subCategoryOptions = computed(() => {
  return [...new Set(props.groups.map((group) => toJapanese(group.subCategory)).filter(Boolean))]
})

const detailCategoryOptions = computed(() => {
  return [...new Set(props.groups.map((group) => toJapanese(group.detailCategory)).filter(Boolean))]
})

watch(
  [keyword, mainCategory, subCategory, detailCategory],
  () => {
    emit('update:filters', {
      keyword: keyword.value,
      mainCategory: mainCategory.value,
      subCategory: subCategory.value,
      detailCategory: detailCategory.value,
    })
  },
  { immediate: true },
)
</script>

<style scoped>
.filter-card {
  background: white;
}
</style>
