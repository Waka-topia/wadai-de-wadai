<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10 px-4">
    <ProfileHeader :stamp-count="ownedCount" />

    <StampsList
      class="mt-4"
      :stamps="stamps"
      :owned-count="ownedCount"
      :total-count="totalCount"
      :progress-ratio="progressRatio"
      :is-loading="isLoading"
      :error-message="errorMessage"
    />

    <ContactBanner class="mt-4" />

    <BasicInfoPanel class="mt-4" />

    <AppQRCode class="mt-4" />
    <div class="my-8 text-center">
      <v-btn
        to="/tutorial"
        class="text-white font-weight-bold"
        size="large"
        color="orange"
        elevation="3"
        rounded
      >
        スマホアプリとして使う方法を見る
      </v-btn>
    </div>
  </div>
  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useStampCollection } from '@/composables/useStampCollection'

// 分割したコンポーネント群のインポート
import ProfileHeader from '@/components/my-page/ProfileHeader.vue'
import StampsList from '@/components/my-page/StampsList.vue'
import BasicInfoPanel from '@/components/my-page/BasicInfoPanel.vue'
import AppQRCode from '@/components/my-page/AppQRCode.vue'
import ContactBanner from '@/components/my-page/ContactBanner.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()

useFirebasePageView('view_mypage', () => ({
  authenticated: store.getters['auth/isAuthenticated'],
}))

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userId = computed(() => store.getters['auth/userId'])

// スタンプはヘッダーの獲得数と一覧の両方で使うため、ここで1回だけ読み込む
const { stamps, ownedCount, totalCount, progressRatio, isLoading, errorMessage } =
  useStampCollection(userId)
</script>
