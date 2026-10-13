import { getAnalytics, isSupported } from 'firebase/analytics'
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

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

/**
 * Google Analytics for Firebase（Web の firebase/analytics）を初期化する 非対応環境（例: 一部のプライベートモードや未対応ブラウザ）では
 * null を返す
 *
 * @returns {Promise<import('firebase/analytics').Analytics | null>} Analytics インスタンス、または非対応時は null
 */
export const initFirebaseAnalytics = async () => {
  if (!(await isSupported())) {
    return null
  }
  return getAnalytics(app)
}

export { app, auth, db }
