<template>
  <v-app>
    <v-app-bar v-if="!isFullscreenPage" color="orange">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"> </v-app-bar-nav-icon>

      <v-app-bar-title class="font-weight-bold text-h5 text-white">
        和大DE話題-{{ title }}-
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-if="!isFullscreenPage" v-model="drawer" class="bg-white">
      <v-list>
        <v-list-item class="position-relative my-1" block size="large" @click="gotoshop">
          <v-icon> mdi-download </v-icon>
          称号を受け取る
          <v-icon class="position-absolute right-0 mx-2"> mdi-chevron-right </v-icon>
        </v-list-item>
        <v-list-item class="position-relative my-1" block size="large" @click="gotoinquiry">
          <v-icon> mdi-email-outline </v-icon>
          お問い合わせ
          <v-icon class="position-absolute right-0 mx-2"> mdi-open-in-new </v-icon>
        </v-list-item>
        <v-list-item class="position-relative my-1" block size="large" @click="gotorule">
          <v-icon> mdi-information-outline </v-icon>
          利用規約
          <v-icon class="position-absolute right-0 mx-2"> mdi-chevron-right </v-icon>
        </v-list-item>
        <LogOutButton />
        <DeleteAccountButton />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view v-slot="{ Component }">
        <keep-alive include="HomePage,RankingPage,MyPage,EventCal">
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <div v-if="!isFullscreenPage" class="mb-6">
        <v-footer app>
          <span>&copy; 2025 和大DE話題</span>
        </v-footer>
      </div>
    </v-main>
  </v-app>
  <BottomNavigation v-if="showBottomNavigation && !isFullscreenPage" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNavigation from '@/components/templates/BottomNavigation.vue'
import DeleteAccountButton from '@/components/templates/DeleteAccountButton.vue'
import LogOutButton from '@/components/templates/LogOut.vue'

const router = useRouter()
const route = useRoute()

const drawer = ref(null)
const title = ref('ホーム')
const showBottomNavigation = ref(true)
const isEventCalPage = ref(false)
const isFullscreenPage = ref(false)

const routeTitleMap = {
  '/': 'ホーム',
  '/login': 'ログイン',
  '/signup': 'サインアップ',
  '/reader': 'スキャン',
  '/ranking': 'ランキング',
  '/mypage': 'マイページ',
  '/eventcal': '新歓日程',
  '/titleshop': '称号ショップ',
  '/inquiry': 'お問い合わせ',
  '/rule': '利用規約',
  '/map': 'マップ',
  '/jobs': '求人情報', // ★ここを追加
  '/forgot-password': 'パスワードリセット',
  '/reset-password': 'パスワードリセット',
}

/**
 * タイトルを更新
 *
 * @param {object} currentRoute
 */
const updateTitle = (currentRoute) => {
  title.value = routeTitleMap[currentRoute.path] || ''
}

/**
 * ボトムナビゲーションの表示切替
 *
 * @param {object} currentRoute
 */
const updateBottomNavigationVisibility = (currentRoute) => {
  showBottomNavigation.value = !['/login', '/signup'].includes(currentRoute.path)
}

/**
 * 新歓カレンダーページの判定
 *
 * @param {object} currentRoute
 */
const checkEventCalPage = (currentRoute) => {
  isEventCalPage.value = currentRoute.path.includes('/eventcal')
}

/**
 * 全画面表示ページの判定
 *
 * @param {object} currentRoute
 */
const checkFullscreenPage = (currentRoute) => {
  isFullscreenPage.value = ['/map'].includes(currentRoute.path)
}

const gotoshop = () => {
  router.push('/titleshop')
}

const gotoinquiry = () => {
  window.open(
    'https://docs.google.com/forms/d/e/1FAIpQLScqd9venqOBZYzIWlDr6EjfHaCTizqLamkFlJUMBXCJaRmHdg/viewform?usp=header',
    '_blank',
  )
}

const gotorule = () => {
  router.push('/rule')
}

watch(
  route,
  (newRoute) => {
    updateTitle(newRoute)
    updateBottomNavigationVisibility(newRoute)
    checkEventCalPage(newRoute)
    checkFullscreenPage(newRoute)
  },
  { immediate: true },
)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kaisei+Tokumin&display=swap');

/* .vuecal__event {
  border: 1px solid #388e3c;
  color: #666;
  background-color: #f8f8f8cc;
  position: relative;
  box-sizing: border-box;
  left: 0;
  width: 100%;
  z-index: 1;
  transition: box-shadow .3s, left .3s, width .3s;
  overflow: hidden;
} */

v-app-bar-title {
  font-family: 'Kaisei Tokumin', sans-serif;
  /* Poppins フォントを指定 */
}
</style>
