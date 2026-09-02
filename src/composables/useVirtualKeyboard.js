import { onMounted, onUnmounted, ref } from 'vue'

/** キーボードが覆っている高さを保持するCSSカスタムプロパティ名 */
const keyboardInsetProperty = '--keyboard-inset'

/** キーボードを開かない入力タイプ */
const nonTextInputTypes = ['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range']

/**
 * 文字入力を受け付ける要素かどうかを判定する
 *
 * @param {EventTarget | null} element - 判定する要素
 * @returns {boolean} 文字入力欄なら true
 */
const isTextEntry = (element) => {
  if (!(element instanceof HTMLElement)) return false
  if (element.isContentEditable) return true
  if (element.tagName === 'TEXTAREA') return true
  return element.tagName === 'INPUT' && !nonTextInputTypes.includes(element.type)
}

/**
 * ソフトウェアキーボードの状態を追跡する
 *
 * 2つの情報を提供する。
 *
 * 1. --keyboard-inset: キーボードが画面下から覆っている高さ。 Chrome(Android) は viewport メタの
 *    interactive-widget=resizes-content で レイアウトごと縮むため 0 になるが、iOS Safari は覆いかぶさるだけなので visualViewport
 *    から差分を取り、ボトムシートの余白として使う。
 * 2. IsKeyboardOpen: 入力欄にフォーカスがあるか。 ブラウザ差に依存しないよう focusin/focusout で判定し、 画面下端に固定しているナビとフッターを隠すのに使う。
 *
 * @returns {{ isKeyboardOpen: import('vue').Ref<boolean> }} キーボードの開閉状態
 */
export const useVirtualKeyboard = () => {
  const isKeyboardOpen = ref(false)
  const viewport = window.visualViewport

  const updateInset = () => {
    if (!viewport) return

    const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    document.documentElement.style.setProperty(keyboardInsetProperty, `${Math.round(inset)}px`)
  }

  const onFocusIn = (event) => {
    if (isTextEntry(event.target)) isKeyboardOpen.value = true
  }

  const onFocusOut = () => {
    // 入力欄から入力欄へ移るときに一瞬 false になるのを避けるため、次のタスクで確認する
    window.setTimeout(() => {
      isKeyboardOpen.value = isTextEntry(document.activeElement)
    }, 0)
  }

  onMounted(() => {
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)

    if (!viewport) return
    viewport.addEventListener('resize', updateInset)
    viewport.addEventListener('scroll', updateInset)
    updateInset()
  })

  onUnmounted(() => {
    document.removeEventListener('focusin', onFocusIn)
    document.removeEventListener('focusout', onFocusOut)

    if (!viewport) return
    viewport.removeEventListener('resize', updateInset)
    viewport.removeEventListener('scroll', updateInset)
    document.documentElement.style.removeProperty(keyboardInsetProperty)
  })

  return { isKeyboardOpen }
}
