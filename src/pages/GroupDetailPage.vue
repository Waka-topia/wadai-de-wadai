<template>
  <v-container fluid class="pa-0">
    <div class="group-detail-container position-relative bg-white">
      <v-btn
        icon
        variant="text"
        color="black"
        class="position-absolute top-0 left-0"
        style="z-index: 10"
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-img :src="defaultImage" height="220" cover class="top-image" />

      <div v-if="loading" class="text-center py-10">
        <v-progress-circular indeterminate color="orange" size="48" />
        <p class="mt-4 text-grey">団体情報を読み込み中...</p>
      </div>

      <div v-else-if="errorMessage" class="text-center py-10 text-error">
        <v-icon size="48" color="error">mdi-alert-circle</v-icon>
        <p class="mt-4">{{ errorMessage }}</p>
      </div>

      <div v-else-if="group" class="px-5 pt-5 pb-10">
        <div class="text-h5 font-weight-bold mb-4">
          {{ group.name }}
        </div>

        <!-- カテゴリー -->
        <div class="mb-5">
          <div class="section-label mb-3">カテゴリー</div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip color="orange" class="font-weight-bold text-white">
              {{ mainCategoryLabel }}
            </v-chip>

            <v-chip variant="outlined" color="orange" class="font-weight-medium">
              {{ subCategoryLabel }}
            </v-chip>
          </div>
        </div>

        <!-- 活動内容 -->
        <div class="mb-6">
          <div class="section-label mb-3">活動内容</div>

          <div class="activity-box pa-4">
            <div class="d-flex align-center">
              <v-icon size="18" color="orange" class="mr-2"> mdi-tag-outline </v-icon>

              <span>
                {{ detailCategoryLabel || '現在、活動内容はまだ掲載されていません。' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 団体紹介 -->
        <div class="mb-6">
          <div class="section-label mb-3">団体紹介</div>

          <div class="pa-4 group-description">
            {{ group.description || '現在、団体紹介はまだ掲載されていません。' }}
          </div>
        </div>

        <!-- Instagram -->
        <div v-if="group.instagramUrl">
          <v-btn
            class="insta-btn text-white font-weight-bold mt-2"
            height="52"
            elevation="3"
            rounded="pill"
            block
            @click="openInstagram"
          >
            <v-icon start>mdi-instagram</v-icon>
            Instagramを見る
            <v-icon end size="18">mdi-open-in-new</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-else class="text-center py-10">団体情報が見つかりませんでした。</div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getGroupService } from '@/services/groupService'
import defaultImage from '@/assets/groups/noimage.jpg'

const route = useRoute()

const group = ref(null)
const loading = ref(true)
const errorMessage = ref('')

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

const normalize = (value) => (value || '').trim()

const mainCategoryLabel = computed(() => {
  return mainCategoryLabelMap[normalize(group.value?.mainCategory)] || ''
})

const subCategoryLabel = computed(() => {
  return subCategoryLabelMap[normalize(group.value?.subCategory)] || ''
})

const detailCategoryLabel = computed(() => {
  return normalize(group.value?.detailCategory) || ''
})

const openInstagram = () => {
  if (!group.value?.instagramUrl) return
  window.open(group.value.instagramUrl, '_blank')
}

onMounted(async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const groupId = route.params.id
    const result = await getGroupService(groupId)

    if (!result) {
      errorMessage.value = '団体情報が見つかりませんでした。'
      return
    }

    group.value = result
  } catch (error) {
    errorMessage.value = error.message || '団体情報の取得に失敗しました。'
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-label {
  font-size: 1rem;
  font-weight: 700;
  color: #222;
}

.group-description {
  background: #f8f8f8;
  border-radius: 12px;
  white-space: pre-line;
  line-height: 1.8;
}

.insta-btn {
  background: linear-gradient(45deg, #feda75cc, #fa7e1ecc, #d62976cc, #962fbfcc, #4f5bd5cc);
}
</style>
