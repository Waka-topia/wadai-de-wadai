<template>
  <v-app>
    <v-app-bar color="orange">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"> </v-app-bar-nav-icon>

      <v-app-bar-title class="font-weight-bold text-h7 text-white">
        和大DE話題-{{ title }}-
      </v-app-bar-title>

      <!-- 2025年4月版の復刻であることが常に分かるようにしておく -->
      <v-chip class="mr-3 font-weight-bold" color="white" size="small" variant="flat">
        v{{ appVersion }}
      </v-chip>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" class="bg-white">
      <v-alert
        class="ma-2"
        type="info"
        variant="tonal"
        density="compact"
        icon="mdi-history"
        rounded="lg"
      >
        <span class="text-caption">
          これは 2025年4月（新歓シーズン）時点の
          <strong>v{{ appVersion }}</strong> を復刻したデモ版です
        </span>
      </v-alert>

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

    <v-main>
      <router-view v-slot="{ Component }">
        <!-- ReaderPage はカメラを、RankingPage は onSnapshot を保持するため keep-alive しない -->
        <keep-alive include="EventCal,MyPage">
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <div v-if="!isKeyboardOpen" class="mb-6">
        <v-footer app>
          <span>&copy; 2026 和大DE話題</span>
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
  <BottomNavigation v-if="showBottomNavigation && !isKeyboardOpen" />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import BottomNavigation from '@/components/templates/BottomNavigation.vue'
import DeleteAccountButton from '@/components/templates/DeleteAccountButton.vue'
import LogOutButton from '@/components/templates/LogOut.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useVirtualKeyboard } from '@/composables/useVirtualKeyboard'

const router = useRouter()
const route = useRoute()

const { snackbarState, closeSnackbar } = useSnackbar()

// キーボードの高さを --keyboard-inset として公開する（ボトムシートが隠れないように）
const { isKeyboardOpen } = useVirtualKeyboard()

/** 復刻対象のバージョン。ヘッダーとドロワーに表示する */
const appVersion = '1.0.0'

const drawer = ref(null)
const title = ref('新歓日程')
const showBottomNavigation = ref(true)

const routeTitleMap = {
  Home: '新歓日程',
  EventDetail: '新歓詳細',
  QrReader: 'QR読み取り',
  Ranking: 'ランキング',
  MyPage: 'マイページ',
  LoginPage: 'ログイン',
  SignupPage: 'サインアップ',
  ForgotPasswordPage: 'パスワードリセット',
  ResetPasswordPage: 'パスワードリセット',
  InquiryPage: 'お問い合わせ',
  Rule: '利用規約',
  Tutorial: 'チュートリアル',
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

const gotoinquiry = () => {
  window.open(
    'https://docs.google.com/forms/d/e/1FAIpQLScqjOjJ8B3XcSEH5d__94ucGD00FVqIbIJe2hq2MxUodczL7Q/viewform?usp=dialog',
    '_blank',
  )
}

const gotorule = () => {
  router.push('/rule')
}

/** 公式Instagramを開く */
const gotoInstagram = () => {
  window.open('https://instagram.com/wakatopia_official', '_blank')
}

watch(
  route,
  (newRoute) => {
    updateTitle(newRoute)
    updateBottomNavigationVisibility(newRoute)
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

/* キーボード表示時にボトムシート全体をその分だけ押し上げる（iOS Safari 対策） */
.v-bottom-sheet > .v-overlay__content {
  padding-bottom: var(--keyboard-inset, 0px);
  transition: padding-bottom 0.15s ease;
}

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
