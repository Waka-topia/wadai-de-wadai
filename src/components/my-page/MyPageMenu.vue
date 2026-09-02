<template>
  <v-card elevation="1" rounded="lg">
    <v-expansion-panels v-model="openPanel" variant="accordion" flat>
      <v-expansion-panel value="info">
        <v-expansion-panel-title class="font-weight-bold text-body-1">
          <v-icon class="mr-3" color="grey-darken-1" size="small">
            mdi-card-account-details-outline
          </v-icon>
          基本情報・所属団体
        </v-expansion-panel-title>

        <v-expansion-panel-text class="bg-grey-lighten-4">
          <v-row dense>
            <UserAddress :email="user.email" />
            <UserId :user-id="user.userId" />
            <UserOrgs :belonging-orgs="user.belongingOrgs ?? []" />
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="qr">
        <v-expansion-panel-title class="font-weight-bold text-body-1">
          <v-icon class="mr-3" color="orange" size="small">mdi-qrcode</v-icon>
          友達にアプリを教える
        </v-expansion-panel-title>

        <v-expansion-panel-text class="text-center bg-grey-lighten-4">
          <p class="text-caption text-grey-darken-1 mb-3">
            このQRコードを友達に読み取ってもらいましょう！
          </p>
          <div class="qr-slot d-flex justify-center align-center">
            <v-fade-transition>
              <v-img
                v-show="isQrVisible"
                class="border rounded pa-2 bg-white"
                :src="qrCodeImage"
                alt="アプリ共有用QRコード"
                max-width="150"
                height="150"
              />
            </v-fade-transition>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-divider />

    <v-list class="menu-list py-0" density="compact">
      <v-list-item to="/tutorial" append-icon="mdi-chevron-right">
        <template #prepend>
          <v-icon color="grey-darken-1" size="small">mdi-cellphone-arrow-down</v-icon>
        </template>
        <v-list-item-title class="font-weight-bold text-body-1">
          スマホアプリとして使う
        </v-list-item-title>
      </v-list-item>

      <v-divider />

      <v-list-item append-icon="mdi-open-in-new" @click="openSurvey">
        <template #prepend>
          <v-icon color="blue-darken-2" size="small">mdi-clipboard-text-outline</v-icon>
        </template>
        <v-list-item-title class="font-weight-bold text-body-1">
          アンケート・お問い合わせ
          <v-chip class="ml-2" color="blue-darken-2" size="x-small" variant="tonal">2〜3分</v-chip>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import UserAddress from '@/components/user-profile/UserAddress.vue'
import UserId from '@/components/user-profile/UserId.vue'
import UserOrgs from '@/components/user-profile/UserOrgs.vue'
import qrCodeImage from '@/assets/QR/wadai-de-wadai.png'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const surveyUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLScqjOjJ8B3XcSEH5d__94ucGD00FVqIbIJe2hq2MxUodczL7Q/viewform?usp=dialog'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])

const openPanel = ref(null)
const isQrVisible = ref(false)

let timer = null

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

// 折りたたみ中は v-img が正しく描画されないため、開くアニメーションの完了を待って表示する
watch(openPanel, (value) => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  if (value === 'qr') {
    timer = setTimeout(() => {
      isQrVisible.value = true
      timer = null
    }, 300)
    return
  }

  isQrVisible.value = false
})

const openSurvey = () => {
  void logFirebaseAnalyticsEvent('mypage_survey_click', {})
  window.open(surveyUrl, '_blank')
}
</script>

<style scoped>
.qr-slot {
  min-height: 166px;
}

/* 展開パネル（左padding 24px）とリスト項目でアイコンと文字の開始位置を揃える */
.menu-list :deep(.v-list-item) {
  padding-inline-start: 24px;
}

.menu-list :deep(.v-list-item__spacer) {
  width: 12px;
}
</style>
