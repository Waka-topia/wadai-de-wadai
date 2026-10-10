/**
 * 入力必須のバリデーション
 *
 * 複数選択（配列）の場合は 1 つ以上選ばれていることを求める
 *
 * @param {unknown} value - 入力値
 * @returns {true | string} 有効なら true、無効ならエラーメッセージ
 */
export const required = (value) => {
  const isFilled = Array.isArray(value) ? value.length > 0 : !!value
  return isFilled || 'このフィールドは必須です。'
}

export const passwordRule = (value) => {
  if (value && value.length < 8) {
    return 'パスワードは8文字以上で入力してください'
  }
  return true
}

export const confirmPasswordRule = (password) => (value) => {
  if (value !== password) {
    return 'パスワードが一致しません'
  }
  return true
}

export const nameCheck = (value) => {
  if (value && value.length < 2) {
    return 'ユーザー名は2文字以上で入力してください'
  }
  return true
}

/**
 * メールアドレスの形式のバリデーション（空欄は required に任せる）
 *
 * @param {string} value - 入力値
 * @returns {true | string} 有効なら true、無効ならエラーメッセージ
 */
export const emailFormat = (value) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'メールアドレスの形式が正しくありません'
  }
  return true
}

export const emailDomainCheck = (value) => {
  if (value && value.endsWith('@wakayama-u.ac.jp')) {
    return 'このドメインは使用できません'
  }
  return true
}
