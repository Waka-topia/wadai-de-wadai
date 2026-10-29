/** 日付の変換・表示用フォーマットをまとめたユーティリティ */

// Date#getDay() の値（0: 日曜）に対応する曜日ラベル
export const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']

const pad2 = (num) => String(num).padStart(2, '0')

/**
 * 'YYYY-MM-DD' を現地時間の Date に変換する
 *
 * New Date('YYYY-MM-DD') は UTC として解釈されるため、日付がずれないよう年月日から作る
 *
 * @param {string} dateKey - YYYY-MM-DD 形式の日付文字列
 * @returns {Date} 現地時間 0 時の Date
 */
export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Date を 'YYYY-MM-DD' に変換する
 *
 * @param {Date} date - 対象の日付
 * @returns {string} YYYY-MM-DD 形式の文字列
 */
export const toDateKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

/**
 * Firestore の Timestamp・Date・文字列・数値を Date に変換する
 *
 * @param {object | Date | string | number} value - 変換する値
 * @returns {Date | null} 変換できない場合は null
 */
export const toJsDate = (value) => {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * 「M月D日（曜）」形式で表示する
 *
 * @param {Date} date - 対象の日付
 * @returns {string} 例: 10月10日（土）
 */
export const formatMonthDayWeekday = (date) =>
  `${date.getMonth() + 1}月${date.getDate()}日（${weekdayLabels[date.getDay()]}）`

/**
 * 「M/D(曜)」形式で表示する
 *
 * @param {Date} date - 対象の日付
 * @returns {string} 例: 10/10(土)
 */
export const formatShortDateWeekday = (date) =>
  `${date.getMonth() + 1}/${date.getDate()}(${weekdayLabels[date.getDay()]})`

/**
 * 「YYYY/MM/DD」形式で表示する
 *
 * @param {Date} date - 対象の日付
 * @returns {string} 例: 2026/10/10
 */
export const formatYmdSlash = (date) =>
  `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`

/**
 * 日本語ロケールの日時で表示する
 *
 * @param {object | Date | string | number} value - 表示する値（Timestamp も可）
 * @returns {string} 例: 2026/10/10 12:34:56。変換できない場合は '-'
 */
export const formatDateTimeJa = (value) => {
  const date = toJsDate(value)
  return date ? date.toLocaleString('ja-JP') : '-'
}
