<template>
  <v-progress-linear v-if="isLoading" color="orange" indeterminate></v-progress-linear>

  <v-sheet v-else-if="applicant" class="pa-4 pa-md-6" rounded>
    <v-card class="pa-4 pa-md-8">
      <!-- ヘッダー -->
      <v-card-title class="text-body-1 text-md-h4 mb-4 font-weight-bold px-0">
        <v-icon size="28" class="mr-2">mdi-checkbox-marked-circle</v-icon>
        代表者証明の申請は未完了です
      </v-card-title>

      <v-divider class="mb-6"></v-divider>

      <v-card-text class="px-0">
        <!-- 一時ID セクション -->
        <div class="mb-8">
          <h3 class="text-body-1 text-md-h6 mb-4 font-weight-bold">
            <v-icon size="20" class="mr-2">mdi-identifier</v-icon>
            一時ID
          </h3>

          <v-card class="pa-4 mb-4" color="orange-lighten-2" variant="outlined">
            <div class="d-flex align-center justify-space-between">
              <p class="text-body-2 text-md-body-1 mb-0 font-weight-bold text-grey-darken-4">
                {{ applicant.proveOwnerApplication?.tempId }}
              </p>
              <v-btn icon size="small" color="orange" @click="copyTempId">
                <v-icon>{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
              </v-btn>
            </div>
          </v-card>

          <!-- 手順 -->
          <div class="bg-grey-lighten-5 pa-4 rounded">
            <p class="text-body-2 font-weight-bold mb-3">申請の流れ:</p>
            <ol class="pl-4 text-body-2">
              <li>上の一時IDをコピー</li>
              <li>団体の公式SNSをチェック</li>
              <li>アプリ運営のアカウントにDMで送信</li>
              <li>審査完了を待機</li>
            </ol>
          </div>
        </div>

        <!-- 運営公式SNS セクション -->
        <div class="mb-8">
          <h3 class="text-body-1 text-md-h6 mb-3 font-weight-bold">
            <v-icon size="20" class="mr-2">mdi-account-check</v-icon>
            アプリ運営の公式SNS
          </h3>

          <div class="space-y-2">
            <v-card
              class="pa-4 mb-3"
              variant="outlined"
              style="cursor: pointer"
              @click="openLink('https://x.com/wakatopia_off')"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="24" color="blue">mdi-twitter</v-icon>
                  <div class="ml-3">
                    <p class="text-body-2 font-weight-bold mb-0">X（旧Twitter）</p>
                    <p class="text-caption mb-0">wakatopia_off</p>
                  </div>
                </div>
                <v-icon size="20" color="grey-lighten-1">mdi-open-in-new</v-icon>
              </div>
            </v-card>

            <v-card
              class="pa-4"
              variant="outlined"
              style="cursor: pointer"
              @click="openLink('https://instagram.com/wakatopia_official')"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="24" color="pink">mdi-instagram</v-icon>
                  <div class="ml-3">
                    <p class="text-body-2 font-weight-bold mb-0">Instagram</p>
                    <p class="text-caption mb-0">wakatopia_official</p>
                  </div>
                </div>
                <v-icon size="20" color="grey-lighten-1">mdi-open-in-new</v-icon>
              </div>
            </v-card>
          </div>
        </div>

        <!-- 注意事項 -->
        <v-alert variant="outlined" color="info" icon="mdi-clock-outline" class="mt-8">
          <p class="text-body-2 mb-0">
            審査には数日かかる場合があります。審査完了後、イベント登録フォームから公式アカウントとして登録できます。
          </p>
        </v-alert>
      </v-card-text>
    </v-card>
  </v-sheet>

  <v-sheet v-else class="pa-4 pa-md-6" rounded>
    <v-card class="pa-4 pa-md-8">
      <div class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1" class="mb-4">mdi-information-outline</v-icon>
        <p class="text-h6 mb-2">代表者証明を申請していません</p>
        <p class="text-body-2 text-grey-darken-1 mb-4">まずは代表者証明の申請を完了してください</p>
        <v-btn color="orange" to="/prove-owner"> 代表者証明を申請する </v-btn>
      </div>
    </v-card>
  </v-sheet>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { getProveOwnerApplicantService } from '@/services/eventService'

const store = useStore()
const applicant = ref(null)
const userId = computed(() => store.getters['auth/userId'])
const isLoading = ref(false)
const copied = ref(false)

const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const fetchApplicantData = async () => {
  try {
    isLoading.value = true

    applicant.value = await getProveOwnerApplicantService(userId.value)
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: error.message,
    }
  } finally {
    isLoading.value = false
  }
}

const copyTempId = async () => {
  try {
    const tempId = applicant.value?.proveOwnerApplication?.tempId
    if (tempId) {
      await navigator.clipboard.writeText(tempId)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: `コピーに失敗しました: ${error.message}`,
    }
  }
}

const openLink = (url) => {
  window.open(url, '_blank')
}

watch(
  () => userId.value,
  (newUserId) => {
    if (newUserId) {
      fetchApplicantData()
    }
  },
  { immediate: true },
)
</script>
