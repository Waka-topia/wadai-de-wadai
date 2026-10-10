import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

/**
 * フォーム送信の共通処理（ローディング・バリデーション・通知・遷移）をまとめるコンポーザブル
 *
 * @param {object} options - 送信の設定
 * @param {() => Promise<unknown>} options.action - 送信時に実行する処理。成功時のアナリティクスもここで送る
 * @param {string} options.successMessage - 成功時にスナックバーに表示するメッセージ
 * @param {string | (() => string)} [options.redirectTo] - 成功後の遷移先。省略時は遷移しない
 * @param {number} [options.redirectDelay] - 成功後に遷移するまでの待ち時間 (ms)
 * @param {string} [options.errorEvent] - 失敗時に送るアナリティクスのイベント名
 * @returns {{
 *   isLoading: import('vue').Ref<boolean>
 *   submit: (validationPromise?: Promise<{ valid: boolean }>) => Promise<void>
 * }}
 *   送信中かどうかと、v-form の submit に渡す送信関数
 */
export const useFormSubmit = ({
  action,
  successMessage,
  redirectTo,
  redirectDelay = 1000,
  errorEvent,
}) => {
  const router = useRouter()
  const { notifySuccess, notifyError } = useSnackbar()
  const isLoading = ref(false)

  /**
   * フォームを送信する
   *
   * @param {Promise<{ valid: boolean }>} [validationPromise] - V-form の submit イベント（バリデーション結果）
   */
  const submit = async (validationPromise) => {
    try {
      isLoading.value = true

      if (validationPromise) {
        const { valid } = await validationPromise
        if (!valid) throw new Error('入力に誤りがあります。')
      }

      await action()
      notifySuccess(successMessage)

      if (redirectTo) {
        const path = typeof redirectTo === 'function' ? redirectTo() : redirectTo
        setTimeout(() => router.push(path), redirectDelay)
      }
    } catch (error) {
      if (errorEvent) {
        void logFirebaseAnalyticsEvent(errorEvent, { errorCode: String(error?.code || 'unknown') })
      }
      notifyError(error)
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, submit }
}
