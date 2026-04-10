<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10">
    <ProfileCard />
    <EditForm />
    <ContactBanner />

    <div class="pa-4 text-center">
      <v-btn
        to="/tutorial"
        class="text-white font-weight-bold"
        color="orange"
        elevation="3"
        rounded
      >
        使い方を見る
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
import EditForm from '@/components/edit-form/EditForm.vue'
import ContactBanner from '@/components/my-page/ContactBanner.vue'
import ProfileCard from '@/components/my-page/ProfileCard.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()

useFirebasePageView('view_mypage', () => ({
  authenticated: store.getters['auth/isAuthenticated'],
}))

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
</script>
