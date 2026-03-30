<template>
  <v-container class="pa-0 bg-grey-lighten-4" style="min-height: 100vh">
    <v-btn icon variant="text" color="grey-darken-2" @click="router.back()">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <v-container
      class="pt-16 pb-8 d-flex flex-column align-center justify-center"
      style="max-width: 600px"
    >

      <v-card width="100%" elevation="2" rounded="xl" class="pa-6 mt-4">
        <div class="text-center mb-6">
          <v-icon size="48" color="orange" class="mb-2">mdi-card-account-phone-outline</v-icon>
          <h2 class="font-weight-bold text-grey-darken-3">ご応募・お問い合わせ</h2>
          <p class="text-grey-darken-1 text-subtitle-2 mt-1">{{ job?.companyName || '会社名' }}</p>
        </div>

        <div class="d-flex justify-center mb-6">
          <div
            class="bg-orange font-weight-bold text-white px-8 py-3 rounded-pill d-flex align-center text-h6"
          >
            <v-icon class="mr-2">mdi-phone</v-icon>
            {{ job?.contactNumber || '電話番号' }}
          </div>
        </div>

        <v-divider class="mb-6"></v-divider>

        <div class="mb-6">
          <div class="mb-2 text-subtitle-1 font-weight-bold d-flex align-center text-grey-darken-3">
            <v-icon color="orange" class="mr-2">mdi-clock-outline</v-icon>営業時間・受付時間
          </div>
          <div class="pl-8 text-body-1 text-grey-darken-3">
            {{ job?.responseHours || '営業時間・受付時間'}}
          </div>
        </div>

        <div class="mb-4">
          <div class="mb-2 text-subtitle-1 font-weight-bold d-flex align-center text-grey-darken-3">
            <v-icon color="orange" class="mr-2">mdi-information-outline</v-icon>担当者名
          </div>
          <div class="pl-8 text-body-1 text-grey-darken-3">
            {{ job?.personName || '担当者名'}}
          </div>
        </div>
      </v-card>
    </v-container>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const store = useStore()

const jobId = Number(route.params.id)

const job = computed(() => store.getters.currentJobWithBookmark)

onMounted(() => {
  store.dispatch('fetchJobById', jobId)
})
</script>
