import { reactive, ref } from 'vue'

// モジュールスコープ（シングルトン）
const show = ref(false)
const message = ref('')
const color = ref('success')
const timeout = ref(3000)
const icon = ref(null)
const showCloseButton = ref(false)

/**
 * グローバルスナックバー通知を管理するコンポーザブル
 *
 * @returns {{
 *   showSnackbar: (msg: string, clr?: string, options?: object) => void
 *   closeSnackbar: () => void
 *   snackbarState: object
 * }}
 *   スナックバーの制御関数と状態
 */
export const useSnackbar = () => {
  /**
   * スナックバーを表示する
   *
   * @param {string} msg - 表示するメッセージ
   * @param {string} [clr] - Vuetifyカラー名
   * @param {object} [options] - 追加オプション
   * @param {number} [options.timeout] - タイムアウト (ms)
   * @param {string | null} [options.icon] - Mdi アイコン名（例: 'mdi-check-circle'）
   * @param {boolean} [options.closeButton] - 閉じるボタンを表示するか
   */
  const showSnackbar = (msg, clr = 'success', options = {}) => {
    message.value = msg
    color.value = clr
    timeout.value = options.timeout ?? 3000
    icon.value = options.icon ?? null
    showCloseButton.value = options.closeButton ?? true
    show.value = true
  }

  /** スナックバーを閉じる */
  const closeSnackbar = () => {
    show.value = false
  }

  const snackbarState = reactive({ show, message, color, timeout, icon, showCloseButton })

  return { showSnackbar, closeSnackbar, snackbarState }
}
