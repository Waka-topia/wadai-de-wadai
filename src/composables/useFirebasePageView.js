import { onMounted } from 'vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

/**
 * ページマウント時に Firebase Analytics へ画面閲覧用のカスタムイベントを送る（EventCal と同系統）
 *
 * @param {string} eventName - イベント名（例: view_home）
 * @param {Record<string, unknown> | (() => Record<string, unknown>)} [params] - 静的パラメータまたは取得関数
 */
export const useFirebasePageView = (eventName, params = {}) => {
  onMounted(() => {
    const resolved = typeof params === 'function' ? params() : params
    void logFirebaseAnalyticsEvent(eventName, resolved)
  })
}
