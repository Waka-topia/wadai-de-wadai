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
