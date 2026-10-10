/** アプリケーション全体で使用する共通の定数・設定値 */

// Waka-topia運営の管理者ユーザーID
// .env または .env.local ファイルに VITE_ADMIN_UID=あなたのUID を設定してください
export const adminUserId = import.meta.env.VITE_ADMIN_UID || ''

// 将来的な機能拡張用（イベント優先度など）
export const officialEventPriority = 10

// イベントカレンダーで選択・登録できる期間（YYYY-MM-DD）
export const eventDateMin = '2025-04-01'
export const eventDateMax = '2027-05-31'

// お問い合わせ・アンケート用の Google フォーム
export const inquiryFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLScqjOjJ8B3XcSEH5d__94ucGD00FVqIbIJe2hq2MxUodczL7Q/viewform?usp=dialog'

// Waka-topia 公式 SNS
export const instagramUrl = 'https://instagram.com/wakatopia_official'
export const xUrl = 'https://x.com/wakatopia_off'
