<template>
  <v-card class="group-card mb-4 mx-5 mt-5" rounded="lg" elevation="1" @click="goToGroupDetail">
    <div class="group-image">
      <v-img :src="defaultImage" width="100%" height="100%" cover />
    </div>

    <v-card-text class="pa-4">
      <v-chip size="small" color="orange" variant="outlined" class="mb-2 font-weight-bold">
        {{ mainCategoryLabel }}
      </v-chip>

      <div class="text-body-1 font-weight-bold mb-3">
        {{ group.name }}
      </div>

      <div class="d-flex align-center mb-1">
        <v-icon size="18" color="orange" class="mr-2">mdi-shape</v-icon>
        <span class="text-body-2">{{ subCategoryLabel }}</span>
      </div>

      <div class="d-flex align-center">
        <v-icon size="18" color="orange" class="mr-2"> mdi-tag-outline </v-icon>
        <span class="text-body-2">
          {{ detailCategoryLabel }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import defaultImage from '@/assets/groups/noimage.jpg'

const router = useRouter()

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
})

const mainCategoryLabelMap = {
  circle: 'サークル',
  club: '部活',
  committee: '委員会',
  project: 'プロジェクト',
}

const subCategoryLabelMap = {
  sports: 'スポーツ',
  culture: '文化',
}

const normalizedMainCategory = computed(() => (props.group.mainCategory || '').trim())
const normalizedSubCategory = computed(() => (props.group.subCategory || '').trim())
const normalizedDetailCategory = computed(() => (props.group.detailCategory || '').trim())

const mainCategoryLabel = computed(
  () => mainCategoryLabelMap[normalizedMainCategory.value] || normalizedMainCategory.value,
)

const subCategoryLabel = computed(
  () => subCategoryLabelMap[normalizedSubCategory.value] || normalizedSubCategory.value,
)

const detailCategoryLabel = computed(() => normalizedDetailCategory.value)

const goToGroupDetail = () => {
  router.push(`/groups/${props.group.id}`)
}
</script>

<style scoped>
.group-image {
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
}
</style>
