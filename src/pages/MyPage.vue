<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10 px-4">
    <ProfileHeader />

    <StampsList class="mt-4" />

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
</script>
