<template>
  <v-container class="fill-height d-flex align-start justify-center" fluid>
    <!-- 申請データあり -->
    <v-card v-if="applicant" class="pa-6 pa-md-8 w-100" max-width="560" rounded="xl" elevation="1">
      <v-progress-linear
        v-if="isLoading"
        color="orange-darken-2"
        indeterminate
        absolute
        top
      ></v-progress-linear>

      <!-- ヒーロー -->
      <div class="text-center mb-6">
        <v-avatar color="green-lighten-5" size="72" class="mb-4">
          <v-icon size="36" color="green-darken-2">mdi-clipboard-check</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold text-grey-darken-3">申請を受け付けました</h2>
        <p class="text-body-2 text-grey-darken-1 mt-2">以下の手順で審査を完了させてください</p>
      </div>

      <!-- スクリーンショット促進バナー -->
      <v-alert color="amber-darken-2" variant="tonal" icon="mdi-camera" rounded="lg" class="mb-6">
        <p class="text-body-2 font-weight-bold mb-1">このページは一度だけ表示されます</p>
        <p class="text-caption mb-0">
          一時IDをスクリーンショットまたはメモに保存してから次に進んでください。
        </p>
      </v-alert>

      <!-- 一時IDセクション -->
      <SectionLabel icon="mdi-identifier" title="あなたの一時ID" />
      <v-card color="orange-lighten-5" variant="flat" rounded="lg" class="pa-4 mb-6">
        <div class="d-flex align-center justify-space-between ga-3">
          <p
            class="text-body-1 font-weight-bold text-grey-darken-4 text-break mb-0"
            style="word-break: break-all"
          >
            {{ applicant.proveOwnerApplication?.tempId }}
          </p>
          <v-btn
            icon
            size="small"
            color="orange-darken-2"
            variant="tonal"
            class="flex-shrink-0"
            @click="copyTempId"
          >
            <v-icon>{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
          </v-btn>
        </div>
      </v-card>

      <v-divider class="mb-6" />

      <!-- 手順セクション -->
      <SectionLabel icon="mdi-format-list-numbered" title="申請の流れ" />
      <StepFlow class="mb-6" :steps="applicationSteps" vertical />

      <v-divider class="mb-6" />

      <!-- 運営公式SNSセクション -->
      <SectionLabel icon="mdi-account-check" title="アプリ運営の公式SNS" />
      <div class="d-flex flex-column ga-2 mb-6">
        <v-card
          variant="outlined"
          rounded="lg"
          class="pa-4"
          style="cursor: pointer"
          @click="openLink(xUrl)"
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
          variant="outlined"
          rounded="lg"
          class="pa-4"
          style="cursor: pointer"
          @click="openLink(instagramUrl)"
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

      <!-- 注意事項 -->
      <v-alert variant="outlined" color="info" icon="mdi-clock-outline">
        <p class="text-body-2 mb-0">
          審査には数日かかる場合があります。審査完了後、イベント登録フォームから公式アカウントとして登録できます。
        </p>
      </v-alert>
    </v-card>

    <!-- ローディング中（applicant未取得） -->
    <v-card
      v-else-if="isLoading"
      class="pa-6 pa-md-8 w-100 text-center"
      max-width="560"
      rounded="xl"
      elevation="1"
    >
      <LoadingState message="読み込み中..." />
    </v-card>

    <!-- 空状態（申請なし） -->
    <v-card v-else class="pa-6 pa-md-8 w-100" max-width="560" rounded="xl" elevation="1">
      <EmptyState
        icon="mdi-information-outline"
        title="代表者証明を申請していません"
        message="まずは代表者証明の申請を完了してください"
      >
        <v-btn
          color="orange-darken-2"
          elevation="0"
          size="x-large"
          rounded="pill"
          class="font-weight-bold"
          to="/prove-owner"
        >
          代表者証明を申請する
        </v-btn>
      </EmptyState>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { getProveOwnerApplicantService } from '@/services/proveService'
import { instagramUrl, xUrl } from '@/config/constants'
import { openExternalLink } from '@/utils/externalLink'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import SectionLabel from '@/components/common/SectionLabel.vue'
import StepFlow from '@/components/event/StepFlow.vue'

const store = useStore()

useFirebasePageView('view_prove_owner_description', {})

// 代表者証明の申請手順
const applicationSteps = [
  { label: '上の一時IDをコピー' },
  { label: '団体の公式SNSを確認' },
  { label: '下記のアプリ運営アカウントにDMで一時IDを送信' },
  { label: '審査完了を待機' },
]

const applicant = ref(null)
const userId = computed(() => store.getters['auth/userId'])
const isLoading = ref(false)
const copied = ref(false)

const { notifyError } = useSnackbar()

const fetchApplicantData = async () => {
  try {
    isLoading.value = true

    applicant.value = await getProveOwnerApplicantService(userId.value)
  } catch (error) {
    notifyError(error)
  } finally {
    isLoading.value = false
  }
}

const copyTempId = async () => {
  try {
    const tempId = applicant.value?.proveOwnerApplication?.tempId
    if (tempId) {
      void logFirebaseAnalyticsEvent('prove_owner_description_copy_temp_id', {})
      await navigator.clipboard.writeText(tempId)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  } catch (error) {
    notifyError(error)
  }
}

const openLink = (url) => {
  void logFirebaseAnalyticsEvent('prove_owner_description_external_link', {
    linkDomain: (() => {
      try {
        return new URL(url).hostname
      } catch {
        return 'unknown'
      }
    })(),
  })
  openExternalLink(url)
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
