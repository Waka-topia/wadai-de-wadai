<template>
  <v-container class="py-8">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="$router.back()">
      求人一覧に戻る
    </v-btn>

    <div v-if="!job && !error" class="text-center mt-16">
      <v-progress-circular indeterminate color="orange" size="64"></v-progress-circular>
      <p class="mt-4 text-grey">求人情報を読み込み中...</p>
    </div>

    <div v-else-if="error" class="text-center mt-16 text-error">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <p class="mt-4">{{ error }}</p>
    </div>

    <v-card v-else class="mx-auto" max-width="800" rounded="lg">
      <v-img
        height="250"
        src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
        cover
        class="align-end"
        transition="false"
      >
        <v-sheet
          color="rgba(255, 255, 255, 0.7)"
          class="d-flex justify-space-between align-center px-4 py-2"
        >
          <v-card-title class="text-black text-h5 font-weight-bold text-truncate">
            {{ job.title }}
          </v-card-title>

          <BookMarkButton :job-id="job.id" :is-bookmarked="!!job.isBookmarked" />
        </v-sheet>
      </v-img>

      <v-card-text class="pt-6 px-6">
        <div class="d-flex align-center mb-4">
          <v-chip color="orange" class="font-weight-bold mr-3">{{ job.employmentType }}</v-chip>
          <div class="text-subtitle-1 text-grey-darken-1">{{ job.companyName }}</div>
        </div>

        <v-divider class="mb-4"></v-divider>

        <div class="text-body-1 mb-3">
          <v-icon color="orange" class="mr-2">mdi-map-marker</v-icon>
          <strong>勤務地:</strong> {{ job.location }}
        </div>
        <div class="text-body-1 mb-3">
          <v-icon color="orange" class="mr-2">mdi-currency-jpy</v-icon>
          <strong>給与:</strong> {{ job.salaryType }} {{ job.salaryMin?.toLocaleString() }}円 〜
          {{ job.salaryMax?.toLocaleString() }}円
        </div>
        <div class="text-body-1 mt-4">
          <strong>業務内容:</strong><br />
          <p class="mt-2 text-grey-darken-3">{{ job.jobDuties }}</p>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 w-100">
        <v-btn
          color="orange"
          variant="elevated"
          size="large"
          class="text-white font-weight-bold flex-grow-1 mr-4"
        >
          この求人に応募する
        </v-btn>

        <BookMarkButton :job-id="job.id" :is-bookmarked="!!job.isBookmarked" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import BookMarkButton from '@/components/recruit/BookMarkButton.vue'

const route = useRoute()
const store = useStore()

const jobId = Number(route.params.id)

const job = computed(() => store.getters.currentJobWithBookmark)

const error = computed(() => store.state.jobs.error)

onMounted(() => {
  store.dispatch('fetchJobById', jobId)
})
</script>
