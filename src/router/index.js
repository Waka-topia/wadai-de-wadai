import { createRouter, createWebHistory } from 'vue-router'

/** ルート定義 各ページコンポーネントは動的インポートでコード分割 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/pages/SignUp.vue'),
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
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/eventcal',
    name: 'EventCal',
    component: () => import('@/pages/EventCal.vue'),
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
