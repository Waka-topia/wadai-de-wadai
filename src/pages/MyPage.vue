<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10">
    <ProfileCard />
    <EditForm />
    <ContactBanner />
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
