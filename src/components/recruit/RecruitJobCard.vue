<template>
  <v-card
    class="recruit-job-card mb-4 mx-5 mt-5"
    rounded="lg"
    elevation="1"
    @click="router.push(`/jobs/${job.id}`)"
  >
    <div class="placeholder-image d-flex align-center justify-center position-relative">
      <v-icon size="64" color="grey-lighten-1">mdi-image-outline</v-icon>

      <div class="position-absolute" style="top: 8px; right: 8px" @click.stop>
        <BookMarkButton :job-id="job.id" :is-bookmarked="!!job.isBookmarked" />
      </div>
    </div>

    <v-card-text class="pa-4">
      <v-chip size="small" color="orange" variant="outlined" class="mb-2 font-weight-bold">
        {{ job.employmentType }}
      </v-chip>

      <div class="text-caption text-grey-darken-1 mb-1">
        {{ job.companyName }}
      </div>

      <div class="text-body-1 font-weight-bold mb-3">
        {{ job.title }}
      </div>

      <div class="d-flex align-center mb-1">
        <v-icon size="18" color="orange" class="mr-2">mdi-map-marker</v-icon>
        <span class="text-body-2">{{ job.location }}</span>
      </div>

      <div class="d-flex align-center mb-1">
        <v-icon size="18" color="orange" class="mr-2">mdi-currency-jpy</v-icon>
        <span class="text-body-2 font-weight-bold">
          {{ job.salaryType }}
        </span>
        <span class="text-body-2 text-orange">
          {{ job.salaryMin.toLocaleString() }}円 〜 {{ job.salaryMax.toLocaleString() }}円
        </span>
      </div>

      <div class="d-flex align-center">
        <v-icon size="18" color="orange" class="mr-2">mdi-domain</v-icon>
        <span class="text-body-2">{{ job.jobDuties }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BookMarkButton from './BookMarkButton.vue'

const router = useRouter()

defineProps({
  job: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.placeholder-image {
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
}
</style>
