import { onMounted, onUnmounted } from 'vue'

/** キーボードが覆っている高さを保持するCSSカスタムプロパティ名 */
const keyboardInsetProperty = '--keyboard-inset'

/**
 * ソフトウェアキーボードが画面下から覆っている高さを CSS 変数に反映する
 *
 * Chrome(Android) は viewport メタの interactive-widget=resizes-content により レイアウト自体が縮むが、iOS Safari
 * はキーボードが画面に覆いかぶさるだけで レイアウトが変わらない。そのままだと下端に固定されるボトムシートが キーボードの裏に隠れて入力できなくなるため、visualViewport
 * から差分を求めて --keyboard-inset として公開し、シート側で余白として使う。
 *
 * @returns {void}
 */
export const useVirtualKeyboard = () => {
  const viewport = window.visualViewport

  const updateInset = () => {
    if (!viewport) return

    const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    document.documentElement.style.setProperty(keyboardInsetProperty, `${Math.round(inset)}px`)
  }

  onMounted(() => {
    if (!viewport) return

    viewport.addEventListener('resize', updateInset)
    viewport.addEventListener('scroll', updateInset)
    updateInset()
  })

  onUnmounted(() => {
    if (!viewport) return

    viewport.removeEventListener('resize', updateInset)
    viewport.removeEventListener('scroll', updateInset)
    document.documentElement.style.removeProperty(keyboardInsetProperty)
  })
}
