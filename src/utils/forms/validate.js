export const required = (value) => !!value || 'このフィールドは必須です。'

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

export const emailDomainCheck = (value) => {
  if (value && value.endsWith('@wakayama-u.ac.jp')) {
    return 'このドメインは使用できません'
  }
  return true
}
