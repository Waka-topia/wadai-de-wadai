import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/reader',
    name: 'Reader',
    component: () => import('@/pages/ReaderPage.vue'),
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/pages/RankingPage.vue'),
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
    path: '/titleshop',
    name: 'TitleShop',
    component: () => import('@/pages/TitleShop.vue'),
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
