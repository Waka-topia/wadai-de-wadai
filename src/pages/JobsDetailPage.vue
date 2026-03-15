<template>
  <v-container fluid class="pa-0">
    <div v-if="!job && !error" class="text-center mt-16">
      <v-progress-circular indeterminate color="orange" size="64"></v-progress-circular>
      <p class="mt-4 text-grey">求人情報を読み込み中...</p>
    </div>

    <div v-else-if="error" class="text-center mt-16 text-error">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <p class="mt-4">{{ error }}</p>
    </div>

    <div v-else class="bg-white">
      <v-img
        height="250"
        src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
        cover
        class="align-end"
        transition="false"
      >
        <v-btn
          icon
          variant="text"
          color="white"
          class="position-absolute top-0 left-0"
          @click="$router.back()"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-img>

      <div class="pt-6 px-6 pb-4">
        <div class="d-flex align-center">
          <v-chip color="orange" class="font-weight-bold mr-3">{{ job.employmentType }}</v-chip>
          <div class="text-subtitle-1 text-grey-darken-1">{{ job.companyName }}</div>
        </div>
      </div>

      <div class="text-black text-h5 font-weight-bold text-wrap px-6 py-4">
        {{ job.title }}
      </div>

      <div class="mx-5 my-4 border rounded-lg overflow-hidden">
        <div class="d-flex align-stretch">
          <div class="d-flex align-center pa-2" style="width: 100px">
            <v-chip label size="small" color="grey-darken-4" class="font-weight-bold border">
              勤務地
            </v-chip>
          </div>
          <div class="pa-3 d-flex align-center border-l">{{ job.location }}</div>
        </div>
        <v-divider />
        <div class="d-flex align-stretch">
          <div class="d-flex align-center pa-2" style="width: 100px">
            <v-chip label size="small" color="grey-darken-4" class="font-weight-bold border">
              給与
            </v-chip>
          </div>
          <div class="pa-3 d-flex align-center border-l">
            {{ job.salaryType }} {{ job.salaryMin?.toLocaleString() }}円 〜
            {{ job.salaryMax?.toLocaleString() }}円
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-stretch">
          <div class="d-flex align-center pa-2" style="width: 100px">
            <v-chip label size="small" color="grey-darken-4" class="font-weight-bold border">
              勤務時間
            </v-chip>
          </div>
          <div class="pa-3 d-flex align-center border-l">
            {{ job.startTime }} ~ {{ job.endTime }}
          </div>
        </div>
      </div>

      <div
        class="mx-5 my-4 rounded-lg text-black font-weight-bold text-wrap px-6 py-4 bg-grey-lighten-2"
      >
        {{ job.description }}
      </div>

      <div class="text-black text-h5 font-weight-bold text-wrap px-6 py-4">基本情報</div>

      <div class="text-black text-h6 font-weight-bold text-wrap px-6 py-4">仕事内容</div>
      <div class="px-6">
        {{ job.jobDuties }}
      </div>

      <div class="text-h9 font-weight-bold text-wrap px-6 py-4">【仕事内容】</div>
      <div class="px-6">
        {{ job.jobDuties }}
      </div>

      <div class="text-black text-h6 font-weight-bold text-wrap px-6 py-4">勤務地・面接場所</div>

      <div class="px-6">
        <div class="mb-4">{{ job.location }}</div>
        <div v-if="job.lat && job.lng" class="mx-4">
          <JobLocationMap :lat="job.lat" :lng="job.lng" :company-name="job.companyName" />
        </div>
      </div>

      <div class="text-black text-h6 font-weight-bold text-wrap px-6 py-4">勤務日数</div>

      <div class="text-black text-h6 font-weight-bold text-wrap px-6 py-4">勤務時間</div>

      <div class="text-black text-h6 font-weight-bold text-wrap px-6 py-4">休日休暇</div>

      <div
        class="position-fixed d-flex align-center justify-center w-100 px-4"
        style="z-index: 10; bottom: calc(10% + 24px); left: 0"
      >
        <v-btn
          color="orange"
          variant="elevated"
          size="large"
          width="100%"
          height="50"
          max-width="300"
          rounded="pill"
          class="text-white font-weight-bold mr-4"
        >
          応募する
        </v-btn>
        <BookMarkButton :job-id="job.id" :is-bookmarked="!!job.isBookmarked" />
      </div>

      <div style="height: 120px"></div>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import BookMarkButton from '@/components/recruit/BookMarkButton.vue'
import JobLocationMap from '@/components/recruit/JobLocationMap.vue'

const route = useRoute()
const store = useStore()

const jobId = Number(route.params.id)

const job = computed(() => store.getters.currentJobWithBookmark)

const error = computed(() => store.state.jobs.error)

onMounted(() => {
  store.dispatch('fetchJobById', jobId)
})
</script>
