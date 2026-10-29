/** 時間割で使用する定数 */

// 時間割に表示する曜日（月〜金）。並び順は Date#getDay() - 1 と一致する
export const weekdays = [
  { value: 'mon', label: '月' },
  { value: 'tue', label: '火' },
  { value: 'wed', label: '水' },
  { value: 'thu', label: '木' },
  { value: 'fri', label: '金' },
]

/**
 * 日付の曜日コードを返す（土日は時間割に無いので空文字）
 *
 * @param {Date} [date] - 対象の日付（省略時は今日）
 * @returns {string} 曜日コード（例: 'mon'）
 */
export const getWeekdayCode = (date = new Date()) => weekdays[date.getDay() - 1]?.value ?? ''

// 曜日コードから表示ラベルへの対応（例: mon → 月）
export const dayLabels = Object.fromEntries(weekdays.map(({ value, label }) => [value, label]))

// 講義カードの色。bg: 背景、border: 枠線、text / sub: 文字色
export const lectureColorPalette = {
  orange: { bg: '#fff3e0', border: '#ff9800', text: '#e65100', sub: '#ef6c00' },
  red: { bg: '#fce4ec', border: '#e91e63', text: '#c2185b', sub: '#e91e63' },
  blue: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0', sub: '#1976d2' },
  green: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', sub: '#388e3c' },
  purple: { bg: '#f3e5f5', border: '#9c27b0', text: '#6a1b9a', sub: '#8e24aa' },
  teal: { bg: '#e0f2f1', border: '#009688', text: '#00695c', sub: '#00897b' },
  indigo: { bg: '#e8eaf6', border: '#3f51b5', text: '#283593', sub: '#3949ab' },
  brown: { bg: '#efebe9', border: '#795548', text: '#4e342e', sub: '#6d4c41' },
}

// 必修・選択必修の講義を示す色
export const requiredColors = {
  req: '#e53935',
  semi: '#8e24aa',
}

// 各時限の開始・終了時刻
export const periodTimes = {
  1: { start: '09:10', end: '10:40' },
  2: { start: '10:50', end: '12:20' },
  3: { start: '13:10', end: '14:40' },
  4: { start: '14:50', end: '16:20' },
  5: { start: '16:30', end: '18:00' },
  6: { start: '18:10', end: '19:40' },
}
