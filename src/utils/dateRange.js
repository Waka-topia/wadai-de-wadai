/**
 * Date を日付入力欄の形式（YYYY-MM-DD）に変換する
 *
 * ToISOString はUTCに寄せるため日付がずれることがある。ローカル時刻から組み立てる。
 *
 * @param {Date} date - 変換する日付
 * @returns {string} YYYY-MM-DD 形式の文字列
 */
export const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 今日から指定した年数だけずらした日付を返す
 *
 * 選択できる期間を固定値で書くと、年度をまたいだ時点で今日を選べなくなる。 カレンダーと登録フォームの双方でこの相対指定を使う。
 *
 * @param {number} yearOffset - 今日から何年ずらすか（過去は負の数）
 * @returns {Date} ずらした日付
 */
export const shiftYears = (yearOffset) => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + yearOffset)
  return date
}

/** 選択できる最も古い日付（今日の1年前） */
export const selectableMinDate = () => shiftYears(-1)

/** 選択できる最も新しい日付（今日の2年後） */
export const selectableMaxDate = () => shiftYears(2)
