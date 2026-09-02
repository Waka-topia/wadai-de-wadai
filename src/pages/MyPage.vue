<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10 px-4">
    <ProfileHeader />

    <MyPageMenu class="mt-4" />

    <StampsList
      class="mt-4"
      :stamps="stamps"
      :owned-count="ownedCount"
      :total-count="totalCount"
      :progress-ratio="progressRatio"
      :is-loading="isLoading"
      :error-message="errorMessage"
    />
  </div>
  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import MyPageMenu from '@/components/my-page/MyPageMenu.vue'
import ProfileHeader from '@/components/my-page/ProfileHeader.vue'
import StampsList from '@/components/my-page/StampsList.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useStampCollection } from '@/composables/useStampCollection'

const store = useStore()

useFirebasePageView('view_mypage', () => ({
  authenticated: store.getters['auth/isAuthenticated'],
}))

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userId = computed(() => store.getters['auth/userId'])

// スタンプは一覧で使う。ここで1回だけ読み込む
const { stamps, ownedCount, totalCount, progressRatio, isLoading, errorMessage } =
  useStampCollection(userId)
</script>
