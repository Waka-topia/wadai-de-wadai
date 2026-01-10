<template>
  <div class="d-flex flex-column justify-center my-10" v-if="isAuthenticated">
    <ProfileCard :count="stampCount" :name="displayName" :photo-url-resolved="photoURLResolved" />
    <EditForm />
    <TabsBar :tabs-component="tabsComponent" :tabs-name="tabsName" />
  </div>
  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed, markRaw, ref } from 'vue'
import { useStore } from 'vuex'
import EditForm from '@/components/edit-form/EditForm.vue'
import DegreesList from '@/components/my-page/DegreesList.vue'
import ProfileCard from '@/components/my-page/ProfileCard.vue'
import StampsList from '@/components/my-page/StampsList.vue'
import TabsBar from '@/components/my-page/TabsBar.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()

const tabsName = ref(['獲得したスタンプ', '獲得した称号'])
const tabsComponent = ref([markRaw(StampsList), markRaw(DegreesList)])

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const photoURLResolved = computed(() => store.getters['auth/photoURLResolved'])
const displayName = computed(() => store.getters['auth/displayName'])

// Vuexからスタンプリストを取得し、スタンプ数を計算
const stampCount = computed(() => {
  const stamps = store.getters['stamps/userStampImages']
  return stamps ? stamps.length : 0
})
</script>
