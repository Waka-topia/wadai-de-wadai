import { logEvent } from 'firebase/analytics'
import { initFirebaseAnalytics } from '@/firebase/config'

let initPromise = null

/**
 * Firebase Analytics インスタンスを取得する（初回のみ初期化）
 *
 * @returns {Promise<import('firebase/analytics').Analytics | null>} Analytics インスタンス、または非対応時は null
 */
export const getFirebaseAnalytics = async () => {
  if (!initPromise) {
    initPromise = initFirebaseAnalytics()
  }
  return initPromise
}

/**
 * Firebase Analytics にカスタムイベントを送る
 *
 * @param {string} eventName - イベント名
 * @param {Record<string, unknown>} [eventParams] - パラメータ
 * @returns {Promise<void>}
 */
export const logFirebaseAnalyticsEvent = async (eventName, eventParams) => {
  const analytics = await getFirebaseAnalytics()
  if (!analytics) {
    return
  }
  logEvent(analytics, eventName, eventParams)
}

/**
 * Vue Router の画面遷移を Firebase Analytics の screen_view として記録する
 *
 * @param {import('vue-router').Router} router - Vue Router インスタンス
 */
export const setupFirebaseAnalyticsRouter = (router) => {
  router.afterEach((to) => {
    void (async () => {
      const analytics = await getFirebaseAnalytics()
      if (!analytics) {
        return
      }
      const screenName = String(to.name ?? to.path)
      /* eslint-disable camelcase -- Firebase Analytics の screen_view で必須のパラメータ名 */
      logEvent(analytics, 'screen_view', {
        firebase_screen: screenName,
        firebase_screen_class: screenName,
      })
    })()
  })
}
