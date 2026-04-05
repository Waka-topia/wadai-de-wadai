/**
 * アプリケーション全体で使用する共通の定数・設定値
 */

// Waka-topia運営の管理者ユーザーID
// .env または .env.local ファイルに VITE_ADMIN_UID=あなたのUID を設定してください
export const adminUserId = import.meta.env.VITE_ADMIN_UID || ''

// 将来的な機能拡張用（イベント優先度など）
export const officialEventPriority = 10
