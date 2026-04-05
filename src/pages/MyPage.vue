<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10">
    <ProfileCard :name="displayName" :photo-url-resolved="photoURLResolved" />
    <EditForm />
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
import ProfileCard from '@/components/my-page/ProfileCard.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()

useFirebasePageView('view_mypage', () => ({
  authenticated: store.getters['auth/isAuthenticated'],
}))

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const photoURLResolved = computed(() => store.getters['auth/photoURLResolved'])
const displayName = computed(() => store.getters['auth/displayName'])
</script>
