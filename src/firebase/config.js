import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebaseの設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
}

// 環境変数の検証
const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
]

const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key])

if (missingVars.length > 0) {
  console.error(
    '❌ Firebase設定エラー: 以下の環境変数が設定されていません:',
    missingVars.join(', '),
  )
  console.error('📝 プロジェクトルートに .env ファイルを作成し、Firebase設定を追加してください。')
  console.error('📖 詳細は README.md を参照してください。')
}

// Firebase初期化（エラーハンドリング付き）
let app
let db
let auth

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  console.log('✅ Firebase初期化成功')
} catch (error) {
  console.error('❌ Firebase初期化エラー:', error)
  console.error('💡 .env ファイルにFirebase設定が正しく設定されているか確認してください。')
  // エラーが発生してもアプリは起動できるように、ダミーオブジェクトをエクスポート
  // ただし、Firebase機能は使用できません
}

export { db, auth }
