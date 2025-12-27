<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center my-10">
    <ProfileCard
      v-for="(user, index) in userInfo"
      :key="index"
      :count="user.count"
      :image="getImageUrl(user.photoURL)"
      :name="user.displayName"
    />
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
import EditForm from '@/components/EditForm/EditForm.vue'
import DegreesList from '@/components/MyPage/DegreesList.vue'
import ProfileCard from '@/components/MyPage/ProfileCard.vue'
import StampsList from '@/components/MyPage/StampsList.vue'
import TabsBar from '@/components/MyPage/TabsBar.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()

const tabsName = ref(['獲得したスタンプ', '獲得した称号'])
const tabsComponent = ref([markRaw(StampsList), markRaw(DegreesList)])

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

// Vuexからスタンプリストを取得し、スタンプ数を計算
const stampCount = computed(() => {
  const stamps = store.getters['stamps/userStampImages'] // Vuexのgetterから取得
  return stamps ? stamps.length : 0
})

const userInfo = computed(() => {
  const user = store.getters['auth/user']
  if (!user) return []
  return [
    {
      displayName: user.displayName,
      photoURL: user.photoURL,
      count: stampCount.value, // スタンプ数を設定
    },
  ]
})

// 画像パスを相対パスに変換
const getImageUrl = (relativePath) => {
  return relativePath
    ? new URL(`../assets/${relativePath}`, import.meta.url).href
    : new URL('../assets/userIcon/defaultIcon.png', import.meta.url).href
}
</script>
