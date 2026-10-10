import { createRouter, createWebHistory } from 'vue-router'
import { adminUserId } from '@/config/constants'
import store from '@/store'

/** ルート定義 各ページコンポーネントは動的インポートでコード分割 */
const routes = [
  {
    path: '/',
    name: 'Home',
    // PC では電車とバスなどを 2 列に並べる。背景のベージュは本文の外側まで広げる
    meta: { layout: 'wide', background: '#fff8e1' },
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/signup',
    name: 'SignupPage',
    component: () => import('@/pages/SignupPage.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPasswordPage',
    component: () => import('@/pages/ForgotPasswordPage.vue'),
  },
  {
    path: '/reset-password',
    name: 'ResetPasswordPage',
    component: () => import('@/pages/ResetPasswordPage.vue'),
  },
  {
    path: '/mypage',
    name: 'MyPage',
    meta: { requiresAuth: true },
    component: () => import('@/pages/MyPage.vue'),
  },
  {
    path: '/tutorial',
    name: 'Tutorial',
    meta: { requiresAuth: true },
    component: () => import('@/pages/TutorialPage.vue'),
  },
  {
    path: '/testpage',
    name: 'testpage',
    meta: { layout: 'wide', background: '#fff8e1' },
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/eventcal',
    name: 'EventCal',
    // PC ではカレンダーとその日のイベントを 2 列に並べる
    meta: { layout: 'wide' },
    component: () => import('@/pages/EventCal.vue'),
  },
  {
    path: '/eventcal/:id',
    name: 'EventDetail',
    component: () => import('@/pages/EventDetail.vue'),
  },
  {
    path: '/inquiry',
    name: 'InquiryPage',
    component: () => import('@/pages/InquiryPage.vue'),
  },
  {
    path: '/rule',
    name: 'Rule',
    component: () => import('@/pages/RulePage.vue'),
  },
  {
    path: '/jobs',
    name: 'RecruitPage',
    // component: () => import('@/pages/RecruitPage.vue'),
    // 開発途中ページを代わりに表示
    component: () => import('@/pages/WorkInProgressPage.vue'),
  },
  {
    path: '/jobs/:id',
    name: 'JobDetailPage',
    component: () => import('@/pages/JobsDetailPage.vue'),
  },
  {
    path: '/map',
    name: 'Map',
    // 地図は画面全体に広げる（PC でも本文の最大幅を適用しない）
    meta: { layout: 'full' },
    component: () => import('@/pages/MapPage.vue'),
  },
  {
    path: '/timetable',
    name: 'Timetable',
    component: () => import('@/pages/TimetablePage.vue'),
  },
  {
    path: '/syllabus-search',
    name: 'SyllabusSearch',
    // シラバスのデータは Security Rules で認証済みユーザーのみ読み取り可能
    meta: { requiresAuth: true },
    component: () => import('@/pages/SyllabusSearchPage.vue'),
  },
  {
    path: '/prove-owner',
    name: 'ProveOwner',
    meta: { requiresAuth: true },
    component: () => import('@/pages/ProveOwnerPage.vue'),
  },
  {
    path: '/prove-owner/description',
    name: 'ProveOwnerDescription',
    meta: { requiresAuth: true },
    component: () => import('@/pages/ProveOwnerDescriptionPage.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    // 一覧の表を PC で広く見せる
    meta: { requiresAdmin: true, layout: 'wide' },
    component: () => import('@/pages/AdminPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  /**
   * スクロール位置の制御
   *
   * @param {object} to - 遷移先のルート
   * @param {object} from - 遷移元のルート
   * @param {object} savedPosition - 保存されたスクロール位置(ブラウザの戻る/進むボタン使用時)
   * @returns {Promise<object> | object | undefined} スクロール位置
   */
  scrollBehavior(to, from, savedPosition) {
    // ブラウザの戻る/進むボタンを使用した場合
    if (savedPosition) {
      return savedPosition
    }

    // アンカーリンク(#hash)がある場合
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // 同じページ内での遷移の場合、スクロール位置を維持
    if (to.path === from.path) {
      return
    }

    // Vuexストアから保存されたスクロール位置を取得
    const savedScroll = store.getters['scroll/getScrollPosition'](to.path)

    if (savedScroll > 0) {
      // 保存されたスクロール位置に即座に復元
      return { top: savedScroll }
    }

    // デフォルトはトップにスクロール
    return { top: 0 }
  },
})

// ナビゲーションガード: ページを離れる前にスクロール位置を保存し、アクセス制御を実施
router.beforeEach((to, from, next) => {
  // スクロール位置を保存するページのリスト
  const saveScrollPages = ['/', '/ranking', '/mypage', '/eventcal']

  if (saveScrollPages.includes(from.path)) {
    // 現在のスクロール位置を取得
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0

    // Vuexストアに保存
    store.dispatch('scroll/saveScrollPosition', {
      path: from.path,
      scrollTop,
    })
  }

  // 認証が必要なページのアクセス制御（未ログインならログインページへリダイレクト）
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const isAuthenticated = store.getters['auth/isAuthenticated']
    if (!isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Adminページのアクセス制御
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const currentUserId = store.getters['auth/userId']
    // console.log('[AdminGuard] currentUserId:', currentUserId)
    // console.log('[AdminGuard] adminUserId:', adminUserId)
    if (currentUserId !== adminUserId) {
      // console.warn('[AdminGuard] Not admin. Redirecting to home.')
      // 運営アカウントでなければホームにリダイレクト
      next({ path: '/' })
      return
    }
    // console.log('[AdminGuard] Access granted.')
  }

  next()
})

export default router
