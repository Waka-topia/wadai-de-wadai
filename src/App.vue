<template>
  <v-app>
    <v-app-bar v-if="!isFullscreenPage" color="orange">
      <!-- PC ではサイドナビを常時表示するので、開閉ボタンは不要 -->
      <v-app-bar-nav-icon v-if="!mdAndUp" variant="text" @click.stop="drawer = !drawer">
      </v-app-bar-nav-icon>

      <v-app-bar-title class="font-weight-bold text-h7 text-white">
        ワダイdeワダイ(大学非公式)-{{ title }}-
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-if="!isFullscreenPage"
      v-model="drawer"
      :permanent="mdAndUp"
      class="bg-white"
    >
      <!-- PC では下部バーの代わりに、主要画面へのナビをここに出す -->
      <template v-if="mdAndUp">
        <v-list nav color="orange-darken-2">
          <v-list-item
            v-for="item in mainNavItems"
            :key="item.value"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.label"
            :active="findNavValue(route.path) === item.value"
            class="font-weight-bold"
            rounded="lg"
            @click="logSideNav(item.value)"
          />
        </v-list>
        <v-divider />
      </template>
      <v-list>
        <v-list-item class="position-relative my-1" block size="large" @click="gotoinquiry">
          <v-icon> mdi-email-outline </v-icon>
          お問い合わせ
          <v-icon class="position-absolute right-0 mx-2"> mdi-open-in-new </v-icon>
        </v-list-item>
        <v-list-item class="position-relative my-1" block size="large" @click="gotoInstagram">
          <v-icon color="pink"> mdi-instagram </v-icon>
          運営Instagram
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

    <!-- 背景色をページ単位で変えたいときはルートの meta.background で指定する（本文の外側まで塗る） -->
    <v-main :style="{ backgroundColor: route.meta.background }">
      <!-- PC では本文の最大幅をルートの meta.layout で切り替える（スマホでは効かない） -->
      <div class="page-frame" :class="`page-frame--${route.meta.layout ?? 'narrow'}`">
        <router-view v-slot="{ Component }">
          <keep-alive include="HomePage,RankingPage,MyPage,EventCal,TimetablePage">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <div v-if="!isFullscreenPage" class="mb-6">
        <v-footer app>
          <span>&copy; 2026 ワダイdeワダイ(大学非公式)</span>
        </v-footer>
      </div>
    </v-main>

    <v-snackbar
      v-model="snackbarState.show"
      :color="snackbarState.color"
      :timeout="snackbarState.timeout"
      location="top"
      rounded="pill"
    >
      <span class="d-flex align-center">
        <v-icon v-if="snackbarState.icon" class="mr-2" size="18">
          {{ snackbarState.icon }}
        </v-icon>
        {{ snackbarState.message }}
      </span>
      <template v-if="snackbarState.showCloseButton" #actions>
        <v-btn color="white" variant="text" @click="closeSnackbar">閉じる</v-btn>
      </template>
    </v-snackbar>
  </v-app>
  <BottomNavigation v-if="showBottomNavigation && !isFullscreenPage && !mdAndUp" />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import BottomNavigation from '@/components/templates/BottomNavigation.vue'
import DeleteAccountButton from '@/components/templates/DeleteAccountButton.vue'
import LogOutButton from '@/components/templates/LogOut.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { inquiryFormUrl, instagramUrl } from '@/config/constants'
import { findNavValue, mainNavItems } from '@/config/navigation'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { openExternalLink } from '@/utils/externalLink'

const router = useRouter()
const route = useRoute()

// md（960px）以上を PC 表示として扱う
const { mdAndUp } = useDisplay()

/**
 * サイドナビのクリックを記録する
 *
 * @param {string} destination - 遷移先の項目の value
 */
const logSideNav = (destination) => {
  void logFirebaseAnalyticsEvent('side_nav_click', { destination })
}

const { snackbarState, closeSnackbar } = useSnackbar()

const drawer = ref(null)
const title = ref('ホーム')
const showBottomNavigation = ref(true)
const isEventCalPage = ref(false)
const isFullscreenPage = ref(false)

const routeTitleMap = {
  Home: 'ホーム',
  LoginPage: 'ログイン',
  SignupPage: 'サインアップ',
  MyPage: 'マイページ',
  EventCal: '新歓日程',
  EventDetail: '新歓詳細',
  InquiryPage: 'お問い合わせ',
  Rule: '利用規約',
  Map: 'マップ',
  RecruitPage: '求人情報',
  JobDetailPage: '求人詳細',
  Timetable: '時間割',
  ForgotPasswordPage: 'パスワードリセット',
  ResetPasswordPage: 'パスワードリセット',
  SyllabusSearch: 'シラバス検索',
  ProveOwner: '代表者認証',
  ProveOwnerDescription: '認証の手引',
  Admin: '管理画面',
}

/**
 * タイトルを更新
 *
 * @param {object} currentRoute
 */
const updateTitle = (currentRoute) => {
  title.value = routeTitleMap[currentRoute.name] || ''
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

const gotoinquiry = () => {
  openExternalLink(inquiryFormUrl)
}

const gotorule = () => {
  router.push('/rule')
}

/** 公式Instagramを開く */
const gotoInstagram = () => {
  openExternalLink(instagramUrl)
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

const store = useStore()
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userId = computed(() => store.getters['auth/userId'])

watch(
  [isAuthenticated, userId, () => route.path],
  ([auth, id, currentPath]) => {
    if (currentPath === '/signup') return

    if (auth && id) {
      // 認証復元のタイミング差を吸収して、ID確定後に取得する
      store.dispatch('users/getCurrentUserData', id)
    }
  },
  // ユーザーの認証状態やIDが変わったタイミングで実行するため、immediateオプションをtrueに設定
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

/* --- PC 表示での本文の最大幅（md 以上） --- */
@media (min-width: 960px) {
  .page-frame--narrow,
  .page-frame--wide {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* wide のページは 2 列になる lg 以上でだけ広げる（md では 1 列なので narrow と同じ幅にする） */
@media (min-width: 1280px) {
  .page-frame--wide {
    max-width: 1200px;
  }
}
</style>
