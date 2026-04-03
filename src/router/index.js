import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

/** ルート定義 各ページコンポーネントは動的インポートでコード分割 */
const routes = [
  {
    path: '/',
    name: 'Home',
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
    component: () => import('@/pages/MyPage.vue'),
  },
  {
    path: '/testpage',
    name: 'testpage',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/eventcal',
    name: 'EventCal',
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
    component: () => import('@/pages/SyllabusSearchPage.vue'),
  },
  {
    path: '/prove-owner',
    name: 'ProveOwner',
    component: () => import('@/pages/ProveOwnerPage.vue'),
  },
  {
    path: '/prove-owner/description',
    name: 'ProveOwnerDescription',
    component: () => import('@/pages/ProveOwnerDescriptionPage.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
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

// ナビゲーションガード: ページを離れる前にスクロール位置を保存
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

  next()
})

export default router
