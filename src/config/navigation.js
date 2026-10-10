// 主要画面へのナビゲーション項目。スマホの下部バーと PC のサイドナビで共通に使う
export const mainNavItems = [
  { to: '/', value: 'home', icon: 'mdi-home', label: 'ホーム' },
  { to: '/eventcal', value: 'eventcal', icon: 'mdi-calendar-month', label: '新歓日程' },
  { to: '/timetable', value: 'timetable', icon: 'mdi-table-clock', label: '時間割' },
  { to: '/jobs', value: 'jobs', icon: 'mdi-briefcase-search', label: '求人情報' },
  { to: '/mypage', value: 'mypage', icon: 'mdi-account', label: 'マイページ' },
]

/**
 * パスに対応するナビゲーション項目の value を返す
 *
 * @param {string} path - 現在のルートのパス
 * @returns {string | undefined} 対応する項目の value（主要画面以外は undefined）
 */
export const findNavValue = (path) => mainNavItems.find((item) => item.to === path)?.value
